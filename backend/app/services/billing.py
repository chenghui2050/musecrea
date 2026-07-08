from sqlalchemy.orm import Session
from app.models import User, Order, Coupon
from app.config import settings
from datetime import datetime
from app.core.i18n import msg
import uuid


def estimate_cost(user: User, evaluation_count: int, run_llm: bool) -> dict:
    """预估费用"""
    eval_cost = evaluation_count * settings.PER_EVALUATION_COST
    llm_cost = (evaluation_count * settings.PER_LLM_ANALYSIS_COST) if run_llm else 0
    total = eval_cost + llm_cost
    return {
        'evaluation_count': evaluation_count,
        'llm_analysis': run_llm,
        'evaluation_cost': eval_cost,
        'llm_cost': llm_cost,
        'total_cost': total,
        'user_credits': user.credits,
    }


def deduct_credits(user: User, db: Session, count: int = 1) -> bool:
    """扣除用户积分/次数"""
    if user.credits < count:
        return False
    user.credits -= count
    db.commit()
    return True


def create_order(
    user: User,
    db: Session,
    order_type: str,
    payment_method: str = "credits",
    coupon_code: str = None,
) -> Order:
    """创建订单"""
    amount = 0
    credits_added = 0

    if order_type == "evaluation":
        amount = settings.PER_EVALUATION_COST + settings.PER_LLM_ANALYSIS_COST
        credits_added = 1
    elif order_type == "subscription_monthly":
        amount = settings.MONTHLY_PLAN_PRICE
        credits_added = settings.MONTHLY_PLAN_EVALUATIONS
    elif order_type == "subscription_yearly":
        amount = settings.YEARLY_PLAN_PRICE
        credits_added = settings.YEARLY_PLAN_EVALUATIONS

    # 使用优惠券
    if coupon_code:
        coupon = db.query(Coupon).filter(
            Coupon.code == coupon_code,
            Coupon.is_active == True,
        ).first()
        if coupon:
            if coupon.discount_type == "free_evaluation":
                amount = 0
                credits_added = coupon.credits_value or 1
            elif coupon.discount_type == "discount_percent":
                amount = amount * (1 - coupon.discount_value / 100)
            elif coupon.discount_type == "free_subscription":
                amount = 0
                credits_added = coupon.credits_value or settings.MONTHLY_PLAN_EVALUATIONS

            coupon.used_count += 1
            coupon.used_by = user.id
            if coupon.used_count >= coupon.max_uses:
                coupon.is_active = False

    # 用积分支付
    if payment_method == "credits" and user.credits >= credits_added:
        user.credits -= credits_added
        payment_status = "paid"
    else:
        payment_status = "pending"

    order = Order(
        user_id=user.id,
        order_type=order_type,
        amount=amount,
        payment_method=payment_method,
        payment_status=payment_status,
        transaction_id=str(uuid.uuid4())[:16],
        credits_added=credits_added,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def add_credits(user: User, db: Session, count: int) -> User:
    """给用户增加积分/次数"""
    user.credits += count
    db.commit()
    db.refresh(user)
    return user


def redeem_coupon(user: User, db: Session, code: str, lang: str = "zh") -> dict:
    """兑换优惠券"""
    coupon = db.query(Coupon).filter(
        Coupon.code == code,
        Coupon.is_active == True,
    ).first()

    if not coupon:
        return {'success': False, 'message': msg('billing.invalid_coupon', lang)}

    if coupon.used_count >= coupon.max_uses:
        return {'success': False, 'message': msg('billing.coupon_max_reached', lang)}

    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return {'success': False, 'message': msg('billing.coupon_expired', lang)}

    if coupon.used_by and coupon.used_by != user.id and coupon.max_uses == 1:
        return {'success': False, 'message': msg('billing.coupon_other_user', lang)}

    # 兑换成功
    credits_to_add = coupon.credits_value or 1
    add_credits(user, db, credits_to_add)

    coupon.used_count += 1
    coupon.used_by = user.id
    if coupon.used_count >= coupon.max_uses:
        coupon.is_active = False
    db.commit()

    return {
        'success': True,
        'message': msg('billing.redeem_success', lang, credits_to_add),
        'credits_added': credits_to_add,
    }
