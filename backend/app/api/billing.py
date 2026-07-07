from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Order
from app.schemas import CostEstimate, OrderCreate, OrderResponse, CouponRedeem
from app.core.security import get_current_user
from app.services.billing import estimate_cost, create_order, redeem_coupon

router = APIRouter(prefix="/billing", tags=["计费系统"])


@router.post("/estimate", response_model=CostEstimate)
def get_estimate(
    evaluation_count: int,
    run_llm: bool = True,
    current_user: User = Depends(get_current_user),
):
    """获取费用预估"""
    return estimate_cost(current_user, evaluation_count, run_llm)


@router.post("/order", response_model=OrderResponse)
def create_new_order(
    req: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建订单"""
    order = create_order(
        user=current_user,
        db=db,
        order_type=req.order_type,
        payment_method=req.payment_method,
        coupon_code=req.coupon_code,
    )
    return order


@router.get("/orders")
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1,
    page_size: int = 20,
):
    """获取订单历史"""
    query = db.query(Order).filter(Order.user_id == current_user.id)
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        'total': total,
        'page': page,
        'orders': [
            {
                'id': o.id,
                'order_type': o.order_type,
                'amount': o.amount,
                'payment_method': o.payment_method,
                'payment_status': o.payment_status,
                'credits_added': o.credits_added,
                'created_at': str(o.created_at),
            }
            for o in orders
        ]
    }


@router.post("/redeem-coupon")
def redeem_coupon_endpoint(
    req: CouponRedeem,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """兑换优惠券"""
    result = redeem_coupon(current_user, db, req.code)
    if not result['success']:
        raise HTTPException(status_code=400, detail=result['message'])
    return result


@router.get("/balance")
def get_balance(current_user: User = Depends(get_current_user)):
    """获取账户余额"""
    return {
        'credits': current_user.credits,
        'role': current_user.role,
    }
