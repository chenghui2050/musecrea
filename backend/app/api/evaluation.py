from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product, Evaluation
from app.schemas import EvaluationRequest, EvaluationResponse, EvaluationResult
from app.core.security import get_current_user
from app.services.creativity import calculate_creativity_scores, extract_comments, detect_data_language
from app.services.creativity import DIMENSION_LABELS_ZH, DIMENSION_LABELS_EN
from app.services.llm_service import analyze_comments_batch, translate_text
from app.services.billing import deduct_credits, estimate_cost
from app.core.i18n import msg, get_request_lang
from app.api.upload import get_uploaded_data, find_product_image
import json

router = APIRouter(prefix="/evaluate", tags=["评价计算"])


@router.post("/estimate")
def get_cost_estimate(
    req: EvaluationRequest,
    current_user: User = Depends(get_current_user),
):
    """获取费用预估"""
    return estimate_cost(current_user, len(req.product_ids), req.run_llm_analysis)


@router.post("/run", response_model=EvaluationResponse)
def run_evaluation(
    request: Request,
    req: EvaluationRequest,
    upload_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """运行评价计算"""
    lang = get_request_lang(request)
    # 获取已上传的数据
    data = get_uploaded_data(upload_id, current_user.id)
    if not data:
        raise HTTPException(status_code=400, detail=msg("eval.upload_first", lang))

    df = data['dataframe']
    product_ids = req.product_ids

    # 检查积分
    needed = len(product_ids)
    if current_user.credits < needed:
        raise HTTPException(
            status_code=402,
            detail=msg("eval.insufficient_credits", lang, needed, current_user.credits)
        )

    # 运行计算
    scores = calculate_creativity_scores(df, product_ids)
    comments = extract_comments(df, product_ids)

    # 检测数据集语言（基于评论内容），用于 LLM 分析和报告输出
    data_lang = detect_data_language(comments) if comments else lang

    # LLM分析 — 使用数据语言而非界面语言
    llm_results = {}
    if req.run_llm_analysis and comments:
        dim_scores = {pid: s['dimension_scores'] for pid, s in scores.items()}
        llm_results = analyze_comments_batch(comments, dim_scores, data_lang)

    # 根据数据语言选择维度标签
    dim_labels = DIMENSION_LABELS_EN if data_lang == 'en' else DIMENSION_LABELS_ZH

    # 保存结果
    results = []
    total_cost = 0
    for pid, score_data in scores.items():
        # 查找或创建产品
        product = db.query(Product).filter(Product.product_id == pid).first()
        if not product:
            product = Product(product_id=pid)
            db.add(product)
            db.flush()

        # 自动关联产品图片
        if not product.image_url:
            img = find_product_image(pid)
            if img:
                product.image_url = img

        llm_result = llm_results.get(pid, {})
        # 根据数据语言选择维度排名标签
        dim_ranking_labels = [dim_labels.get(d, d) for d in score_data['dimension_ranking']]
        evaluation = Evaluation(
            user_id=current_user.id,
            product_id=product.id,
            novelty_score=score_data['dimension_scores'].get('Novelty', 0),
            usefulness_score=score_data['dimension_scores'].get('Usefulness', 0),
            affect_score=score_data['dimension_scores'].get('Affect', 0),
            aesthetics_score=score_data['dimension_scores'].get('Aesthetics', 0),
            cultural_value_score=score_data['dimension_scores'].get('Cultural Values', 0),
            creativity_score=score_data['creativity_score'],
            dimension_ranking=json.dumps(dim_ranking_labels),
            llm_analysis=llm_result.get('analysis', ''),
            improvement_suggestions=llm_result.get('suggestions', ''),
            sample_count=score_data['sample_count'],
            raw_data_path=data['file_path'],
            data_language=data_lang,
        )
        db.add(evaluation)
        db.flush()

        results.append(EvaluationResult(
            id=evaluation.id,
            product_id=pid,
            product_name=product.name,
            product_image=product.image_url,
            creativity_score=score_data['creativity_score'],
            dimension_scores=score_data['dimension_scores'],
            dimension_ranking=dim_ranking_labels,
            sample_count=score_data['sample_count'],
            llm_analysis=llm_result.get('analysis'),
            improvement_suggestions=llm_result.get('suggestions'),
            created_at=evaluation.created_at or __import__('datetime').datetime.now(),
        ))

        total_cost += 1  # 每个产品扣1次积分

    db.commit()
    deduct_credits(current_user, db, total_cost)

    return EvaluationResponse(results=results, total_cost=float(total_cost), credits_used=total_cost)


@router.get("/history")
def get_evaluation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
):
    """获取历史评价记录"""
    query = db.query(Evaluation).filter(Evaluation.user_id == current_user.id)
    total = query.count()
    evaluations = query.order_by(Evaluation.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    results = []
    for e in evaluations:
        product_image = e.product.image_url if e.product else None
        if not product_image and e.product:
            product_image = find_product_image(e.product.product_id)
        results.append({
            'id': e.id,
            'product_id': e.product.product_id if e.product else 'N/A',
            'product_name': e.product.name if e.product else 'N/A',
            'product_image': product_image,
            'creativity_score': e.creativity_score,
            'dimension_scores': {
                'Novelty': e.novelty_score,
                'Usefulness': e.usefulness_score,
                'Affect': e.affect_score,
                'Aesthetics': e.aesthetics_score,
                'Cultural Values': e.cultural_value_score,
            },
            'dimension_ranking': json.loads(e.dimension_ranking) if e.dimension_ranking else [],
            'sample_count': e.sample_count,
            'created_at': str(e.created_at),
            'has_llm_analysis': bool(e.llm_analysis),
        })

    return {'total': total, 'page': page, 'page_size': page_size, 'results': results}


@router.get("/history/{evaluation_id}")
def get_evaluation_detail(
    request: Request,
    evaluation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取单个评价详情"""
    lang = get_request_lang(request)
    e = db.query(Evaluation).filter(
        Evaluation.id == evaluation_id,
        Evaluation.user_id == current_user.id,
    ).first()
    if not e:
        raise HTTPException(status_code=404, detail=msg("eval.not_found", lang))

    # 自动发现产品图片：优先用数据库记录，其次扫描文件系统
    product_image = e.product.image_url if e.product else None
    if not product_image and e.product:
        product_image = find_product_image(e.product.product_id)
        if product_image:
            e.product.image_url = product_image
            db.commit()

    # Translate LLM content if requested language differs from data language
    data_lang = getattr(e, 'data_language', None) or 'zh'
    llm_analysis = e.llm_analysis
    improvement_suggestions = e.improvement_suggestions
    if data_lang != lang:
        if llm_analysis:
            llm_analysis = translate_text(llm_analysis, data_lang, lang)
        if improvement_suggestions:
            improvement_suggestions = translate_text(improvement_suggestions, data_lang, lang)

    return {
        'id': e.id,
        'product_id': e.product.product_id if e.product else 'N/A',
        'product_name': e.product.name if e.product else 'N/A',
        'product_image': product_image,
        'creativity_score': e.creativity_score,
        'dimension_scores': {
            'Novelty': e.novelty_score,
            'Usefulness': e.usefulness_score,
            'Affect': e.affect_score,
            'Aesthetics': e.aesthetics_score,
            'Cultural Values': e.cultural_value_score,
        },
        'dimension_ranking': json.loads(e.dimension_ranking) if e.dimension_ranking else [],
        'sample_count': e.sample_count,
        'llm_analysis': llm_analysis,
        'improvement_suggestions': improvement_suggestions,
        'created_at': str(e.created_at),
    }
