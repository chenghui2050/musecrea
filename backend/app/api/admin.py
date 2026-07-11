from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Evaluation, Order, Coupon
from app.schemas import SystemStats, CouponCreate, CouponResponse
from app.core.security import get_current_admin, get_password_hash
from app.core.i18n import msg, get_request_lang

router = APIRouter(prefix="/admin", tags=["管理后台"])


@router.get("/stats", response_model=SystemStats)
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """获取系统统计数据"""
    total_users = db.query(func.count(User.id)).scalar()
    total_evaluations = db.query(func.count(Evaluation.id)).scalar()
    total_revenue = db.query(func.sum(Order.amount)).filter(
        Order.payment_status == 'paid'
    ).scalar() or 0

    today = datetime.utcnow().date()
    api_calls_today = db.query(func.count(Evaluation.id)).filter(
        func.date(Evaluation.created_at) == today
    ).scalar()
    active_users_today = db.query(func.count(func.distinct(Evaluation.user_id))).filter(
        func.date(Evaluation.created_at) == today
    ).scalar()

    return SystemStats(
        total_users=total_users,
        total_evaluations=total_evaluations,
        total_revenue=float(total_revenue),
        api_calls_today=api_calls_today,
        active_users_today=active_users_today,
    )


@router.get("/users")
def list_users(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """获取用户列表"""
    query = db.query(User)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        'total': total,
        'page': page,
        'users': [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'full_name': u.full_name,
                'role': u.role,
                'credits': u.credits,
                'is_active': u.is_active,
                'created_at': str(u.created_at),
                'evaluation_count': db.query(func.count(Evaluation.id)).filter(
                    Evaluation.user_id == u.id
                ).scalar(),
            }
            for u in users
        ]
    }


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    request: Request,
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """启用/禁用用户"""
    lang = get_request_lang(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=msg("admin.user_not_found", lang))
    user.is_active = not user.is_active
    db.commit()
    return {'user_id': user_id, 'is_active': user.is_active}


@router.put("/users/{user_id}/reset-password")
def reset_user_password(
    request: Request,
    user_id: int,
    new_password: str = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """管理员重置用户密码"""
    lang = get_request_lang(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=msg("admin.user_not_found", lang))
    # Default password if none provided
    pwd = new_password if new_password and len(new_password) >= 6 else "MuseCrea123"
    user.hashed_password = get_password_hash(pwd)
    db.commit()
    return {'user_id': user_id, 'message': msg('admin.password_reset_ok', lang)}


@router.put("/users/{user_id}/credits")
def update_user_credits(
    request: Request,
    user_id: int,
    credits: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """调整用户积分"""
    lang = get_request_lang(request)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=msg("admin.user_not_found", lang))
    user.credits = credits
    db.commit()
    return {'user_id': user_id, 'credits': credits}


@router.get("/api-logs")
def get_api_logs(
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """获取API调用日志（以评价记录代替）"""
    query = db.query(Evaluation).join(User)
    total = query.count()
    logs = query.order_by(Evaluation.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        'total': total,
        'page': page,
        'logs': [
            {
                'id': e.id,
                'user': e.user.username if e.user else 'N/A',
                'product_id': e.product.product_id if e.product else 'N/A',
                'creativity_score': e.creativity_score,
                'sample_count': e.sample_count,
                'has_llm': bool(e.llm_analysis),
                'created_at': str(e.created_at),
            }
            for e in logs
        ]
    }


# ========== 券码管理 ==========

@router.post("/coupons", response_model=CouponResponse)
def create_coupon(
    request: Request,
    req: CouponCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """创建优惠券"""
    lang = get_request_lang(request)
    existing = db.query(Coupon).filter(Coupon.code == req.code).first()
    if existing:
        raise HTTPException(status_code=400, detail=msg("admin.coupon_exists", lang))

    coupon = Coupon(
        code=req.code,
        discount_type=req.discount_type,
        discount_value=req.discount_value,
        credits_value=req.credits_value,
        max_uses=req.max_uses,
        expires_at=req.expires_at,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.get("/coupons")
def list_coupons(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """获取优惠券列表"""
    query = db.query(Coupon)
    total = query.count()
    coupons = query.order_by(Coupon.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    return {'total': total, 'page': page, 'coupons': coupons}


@router.delete("/coupons/{coupon_id}")
def delete_coupon(
    request: Request,
    coupon_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    """删除优惠券"""
    lang = get_request_lang(request)
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail=msg("admin.coupon_not_found", lang))
    db.delete(coupon)
    db.commit()
    return {'message': msg('admin.coupon_deleted', lang)}
