import os
import uuid
import glob
import shutil
from typing import Optional, List
from datetime import datetime
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product
from app.core.security import get_current_user
from app.core.i18n import msg, get_request_lang
from app.services.creativity import validate_dataframe, extract_products, DIMENSION_COLUMNS
from app.config import settings

router = APIRouter(prefix="/upload", tags=["文件上传"])


def find_product_image(product_id: str) -> Optional[str]:
    """在uploads/images目录中查找产品图片（支持多种扩展名）"""
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    if not os.path.isdir(img_dir):
        return None
    for ext in ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP']:
        path = os.path.join(img_dir, f"{product_id}{ext}")
        if os.path.isfile(path):
            return f"/uploads/images/{product_id}{ext}"
    # 不区分大小写兜底扫描
    for f in os.listdir(img_dir):
        name, _ = os.path.splitext(f)
        if name.lower() == product_id.lower():
            return f"/uploads/images/{f}"
    return None


@router.get("/product-images")
def list_product_images(
    current_user: User = Depends(get_current_user),
):
    """列出所有可用的产品图片（按product_id映射）"""
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    if not os.path.isdir(img_dir):
        return {'images': {}}
    images = {}
    for f in os.listdir(img_dir):
        name, ext = os.path.splitext(f)
        if ext.lower() in ('.jpg', '.jpeg', '.png', '.webp'):
            images[name] = f"/uploads/images/{f}"
    return {'images': images}

# 临时存储已上传但未处理的DataFrame（生产环境应改用Redis）
_uploaded_data = {}


@router.post("/excel")
async def upload_excel(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传Excel文件并预览数据"""
    lang = get_request_lang(request)
    # 检查文件大小
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(status_code=400, detail=msg("upload.file_too_large", lang, settings.MAX_UPLOAD_SIZE_MB))

    # 检查文件类型
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail=msg("upload.unsupported_format", lang))

    # 保存文件
    upload_id = str(uuid.uuid4())[:12]
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(upload_dir, f"{upload_id}{file_ext}")

    with open(file_path, "wb") as f:
        f.write(content)

    # 读取并验证数据
    try:
        if file_ext == '.csv':
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path, sheet_name=0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=msg("upload.read_error", lang, str(e)))

    valid, message = validate_dataframe(df, lang)
    if not valid:
        raise HTTPException(status_code=400, detail=message)

    # 提取产品信息
    preview = extract_products(df)

    # 保存DataFrame引用和文件路径
    _uploaded_data[upload_id] = {
        'dataframe': df,
        'file_path': file_path,
        'user_id': current_user.id,
    }

    # 保存产品信息到数据库
    for pid in preview['products']:
        existing = db.query(Product).filter(Product.product_id == str(pid)).first()
        if not existing:
            product = Product(product_id=str(pid))
            db.add(product)
    db.commit()

    return {
        'upload_id': upload_id,
        'filename': file.filename,
        'preview': preview,
        'warnings': _generate_warnings(preview, lang),
    }


@router.post("/image/{product_db_id}")
async def upload_product_image(
    request: Request,
    product_db_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传产品图片"""
    lang = get_request_lang(request)
    product = db.query(Product).filter(Product.id == product_db_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=msg("upload.product_not_found", lang))

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail=msg("upload.image_too_large", lang))

    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(status_code=400, detail=msg("upload.unsupported_image", lang))

    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(img_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    img_path = os.path.join(img_dir, f"{product.product_id}{ext}")

    with open(img_path, "wb") as f:
        f.write(content)

    product.image_url = f"/uploads/images/{product.product_id}{ext}"
    db.commit()

    return {'image_url': product.image_url}


@router.post("/images/batch")
async def upload_product_images_batch(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """批量上传产品图片（文件名作为产品ID）"""
    results = []
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(img_dir, exist_ok=True)

    for file in files:
        content = await file.read()
        name_without_ext = os.path.splitext(file.filename)[0]
        ext = os.path.splitext(file.filename)[1]

        # 查找对应的产品，不存在则自动创建
        product = db.query(Product).filter(Product.product_id == name_without_ext).first()
        if not product:
            product = Product(product_id=name_without_ext)
            db.add(product)
            db.flush()

        img_path = os.path.join(img_dir, f"{name_without_ext}{ext}")
        with open(img_path, "wb") as f:
            f.write(content)

        product.image_url = f"/uploads/images/{name_without_ext}{ext}"
        results.append({'filename': file.filename, 'status': 'success', 'product_id': name_without_ext})

    db.commit()
    return {'results': results}


# ========== Image Library Management ==========

@router.get("/image-library")
def get_image_library(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取图片库：列出所有图片，基于产品 image_url 判断分配状态"""
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    folder_exists = os.path.isdir(img_dir)
    abs_path = os.path.abspath(img_dir) if folder_exists else None

    # 构建 URL -> product_id 映射（一个 URL 只能被一个产品使用）
    url_to_product = {}
    products = {}
    for p in db.query(Product).all():
        products[p.product_id] = p
        if p.image_url:
            url_to_product[p.image_url] = p.product_id

    images = []
    if folder_exists:
        for f in sorted(os.listdir(img_dir)):
            name, ext = os.path.splitext(f)
            if ext.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
                continue
            file_path = os.path.join(img_dir, f)
            stat = os.stat(file_path)
            file_url = f"/uploads/images/{f}"
            assigned_to = url_to_product.get(file_url)
            product = products.get(assigned_to) if assigned_to else None
            images.append({
                'filename': f,
                'product_id': name,
                'url': file_url,
                'size': stat.st_size,
                'size_text': _format_size(stat.st_size),
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'assigned_to': assigned_to,
                'product_name': product.name if product else None,
            })

    return {
        'images': images,
        'total': len(images),
        'folder_exists': folder_exists,
        'folder_path': abs_path,
    }


@router.post("/image-library/upload")
async def upload_to_library(
    request: Request,
    file: UploadFile = File(...),
    product_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """上传图片到图片库，可选择直接分配给某个产品"""
    lang = get_request_lang(request)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail=msg("upload.image_too_large", lang))

    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(status_code=400, detail=msg("upload.unsupported_image", lang))

    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    os.makedirs(img_dir, exist_ok=True)

    # 保存文件（用原始文件名）
    save_name = file.filename
    img_path = os.path.join(img_dir, save_name)
    with open(img_path, "wb") as f:
        f.write(content)

    # 如果指定了 product_id，直接关联
    if product_id:
        product = db.query(Product).filter(Product.product_id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=msg("upload.product_id_not_found", lang, product_id))
        # 清除其他产品对该文件的引用
        file_url = f"/uploads/images/{save_name}"
        db.query(Product).filter(
            Product.image_url == file_url,
            Product.product_id != product_id,
        ).update({'image_url': None})
        product.image_url = file_url
        db.commit()

    return {
        'filename': save_name,
        'url': f"/uploads/images/{save_name}",
        'product_id': product_id,
    }


@router.put("/image-library/assign")
def assign_image_to_product(
    request: Request,
    filename: str = Form(...),
    product_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """将图片库中的某张图片分配给指定产品（直接引用，不创建副本）"""
    lang = get_request_lang(request)
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    src_path = os.path.join(img_dir, filename)

    if not os.path.isfile(src_path):
        raise HTTPException(status_code=404, detail=msg("upload.image_not_found", lang))

    # 查找目标产品
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=msg("upload.product_id_not_found", lang, product_id))

    new_url = f"/uploads/images/{filename}"
    old_url = product.image_url

    # 1. 如果目标产品之前有旧图片，清理旧的产品副本文件
    if old_url and old_url != new_url:
        old_filename = os.path.basename(old_url)
        old_path = os.path.join(img_dir, old_filename)
        # 只删除以产品ID命名的副本文件，不删除其他源文件
        if os.path.isfile(old_path) and old_filename.startswith(product_id):
            # 确认没有其他产品引用这个旧文件
            other_ref = db.query(Product).filter(
                Product.image_url == old_url,
                Product.product_id != product_id,
            ).count()
            if other_ref == 0:
                os.remove(old_path)
                print(f"[Assign] Cleaned old copy: {old_path}")

    # 2. 清除其他产品对源文件的引用（一张图只能分配给一个产品）
    db.query(Product).filter(
        Product.image_url == new_url,
        Product.product_id != product_id,
    ).update({'image_url': None})

    # 3. 设置目标产品的图片
    product.image_url = new_url
    db.commit()

    print(f"[Assign] {filename} -> product {product_id}, url={new_url}")
    return {
        'product_id': product_id,
        'image_url': new_url,
        'filename': filename,
    }


@router.put("/image-library/unassign")
def unassign_image(
    filename: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """取消图片与产品的关联（不删除文件）"""
    file_url = f"/uploads/images/{filename}"
    updated = db.query(Product).filter(Product.image_url == file_url).update({'image_url': None})
    db.commit()
    print(f"[Unassign] Cleared {updated} product(s) referencing {filename}")
    return {'filename': filename, 'unassigned': updated}


@router.delete("/image-library/file/{filename}")
def delete_library_image(
    request: Request,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除图片库中的图片"""
    lang = get_request_lang(request)
    img_dir = os.path.join(settings.UPLOAD_DIR, "images")
    file_path = os.path.join(img_dir, filename)

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail=msg("upload.image_not_found", lang))

    # 清除所有引用该文件的产品
    file_url = f"/uploads/images/{filename}"
    db.query(Product).filter(Product.image_url == file_url).update({'image_url': None})

    # 移至回收站
    trash_dir = os.path.join(settings.UPLOAD_DIR, ".trash")
    os.makedirs(trash_dir, exist_ok=True)
    shutil.move(file_path, os.path.join(trash_dir, f"{uuid.uuid4().hex[:8]}_{filename}"))
    db.commit()

    return {'deleted': filename}


def _format_size(size_bytes: int) -> str:
    """格式化文件大小"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def _generate_warnings(preview: dict, lang: str = "zh") -> list:
    """生成数据质量警告"""
    warnings = []
    for pid, count in preview['sample_counts'].items():
        if count < 200:
            warnings.append(msg("data.low_samples", lang, pid, count))
    if not preview['has_comments']:
        warnings.append(msg("data.no_comments_col", lang))
    elif preview['valid_comments_count'] == 0:
        warnings.append(msg("data.no_valid_comments", lang))
    return warnings


def get_uploaded_data(upload_id: str, user_id: int) -> dict:
    """获取已上传的数据（供其他模块调用）"""
    data = _uploaded_data.get(upload_id)
    if not data:
        return None
    if data['user_id'] != user_id:
        return None
    return data
