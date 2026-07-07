from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime


# ========== Auth Schemas ==========
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    phone: Optional[str]
    role: str
    credits: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ========== Product Schemas ==========
class ProductResponse(BaseModel):
    id: int
    product_id: str
    name: Optional[str]
    image_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ProductUpload(BaseModel):
    product_id: str
    name: Optional[str] = None


# ========== Evaluation Schemas ==========
class DimensionScore(BaseModel):
    novelty: float
    usefulness: float
    affect: float
    aesthetics: float
    cultural_value: float


class EvaluationRequest(BaseModel):
    product_ids: List[str]  # 选择要评价的产品ID列表
    run_llm_analysis: bool = True  # 是否运行LLM评论分析


class EvaluationResult(BaseModel):
    id: int
    product_id: str
    product_name: Optional[str]
    product_image: Optional[str] = None
    creativity_score: float
    dimension_scores: Dict[str, float]
    dimension_ranking: List[str]
    sample_count: int
    llm_analysis: Optional[str]
    improvement_suggestions: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class EvaluationResponse(BaseModel):
    results: List[EvaluationResult]
    total_cost: float
    credits_used: int


# ========== Report Schemas ==========
class ReportResponse(BaseModel):
    id: int
    evaluation_id: int
    report_type: str
    created_at: datetime
    download_url: Optional[str] = None

    class Config:
        from_attributes = True


# ========== Billing Schemas ==========
class CostEstimate(BaseModel):
    evaluation_count: int
    llm_analysis: bool
    evaluation_cost: float
    llm_cost: float
    total_cost: float
    user_credits: int


class OrderCreate(BaseModel):
    order_type: str  # evaluation / subscription_monthly / subscription_yearly
    payment_method: str  # wechat / alipay / coupon
    coupon_code: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_type: str
    amount: float
    payment_method: Optional[str]
    payment_status: str
    credits_added: int
    created_at: datetime

    class Config:
        from_attributes = True


class CouponRedeem(BaseModel):
    code: str


# ========== Admin Schemas ==========
class SystemStats(BaseModel):
    total_users: int
    total_evaluations: int
    total_revenue: float
    api_calls_today: int
    active_users_today: int


class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float = 0
    credits_value: int = 0
    max_uses: int = 1
    expires_at: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    discount_type: str
    discount_value: float
    credits_value: int
    is_active: bool
    used_count: int
    max_uses: int
    created_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class FilePreview(BaseModel):
    products: List[str]  # 产品ID列表
    sample_counts: Dict[str, int]  # 每个产品的样本数
    columns: List[str]  # 列名
    total_rows: int
    has_comments: bool
    valid_comments_count: int
