from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default=UserRole.user)
    credits = Column(Integer, default=3)  # 免费次数
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    evaluations = relationship("Evaluation", back_populates="user")
    orders = relationship("Order", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String(100), index=True, nullable=False)  # 来自Excel的产品编号
    name = Column(String(200), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluations = relationship("Evaluation", back_populates="product")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    novelty_score = Column(Float)
    usefulness_score = Column(Float)
    affect_score = Column(Float)
    aesthetics_score = Column(Float)
    cultural_value_score = Column(Float)
    creativity_score = Column(Float)
    dimension_ranking = Column(Text)  # JSON: ranked dimension names
    llm_analysis = Column(Text)  # LLM generated analysis
    improvement_suggestions = Column(Text)  # LLM generated suggestions
    sample_count = Column(Integer)
    raw_data_path = Column(String(500))  # uploaded file path
    data_language = Column(String(5), default='zh')  # 'zh' or 'en' — language of the source data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="evaluations")
    product = relationship("Product", back_populates="evaluations")
    report = relationship("Report", back_populates="evaluation", uselist=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    evaluation_id = Column(Integer, ForeignKey("evaluations.id"), nullable=False)
    report_type = Column(String(20), default="html")  # html / pdf
    report_data = Column(Text)  # rendered HTML content
    file_path = Column(String(500), nullable=True)  # PDF file path
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluation = relationship("Evaluation", back_populates="report")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_type = Column(String(20))  # evaluation / subscription_monthly / subscription_yearly
    amount = Column(Float)
    payment_method = Column(String(50), nullable=True)  # wechat / alipay / coupon
    payment_status = Column(String(20), default="pending")  # pending / paid / failed
    transaction_id = Column(String(200), nullable=True)
    credits_added = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(String(20))  # free_evaluation / free_subscription / discount_percent
    discount_value = Column(Float, default=0)
    credits_value = Column(Integer, default=0)  # 赠送的免费次数
    is_active = Column(Boolean, default=True)
    used_count = Column(Integer, default=0)
    max_uses = Column(Integer, default=1)
    used_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)


class TranslationCache(Base):
    __tablename__ = "translation_cache"

    id = Column(Integer, primary_key=True, index=True)
    content_hash = Column(String(64), index=True, nullable=False)  # SHA-256 of source text
    source_lang = Column(String(5), nullable=False)
    target_lang = Column(String(5), nullable=False)
    translated_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
