from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MuseCrea"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./musecrea.db"

    # JWT
    SECRET_KEY: str = "musecrea-secret-key-change-in-production-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # DashScope / Tongyi Qianwen
    DASHSCOPE_API_KEY: str = "sk-c2327ea7be9a41e5ac3ce59d55ca674f"
    DASHSCOPE_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    DASHSCOPE_MODEL: str = "qwen-plus"

    # Billing
    FREE_CREDITS: int = 3  # 新用户免费次数
    PER_EVALUATION_COST: float = 2.0  # 每次评价费用（元）
    PER_LLM_ANALYSIS_COST: float = 1.0  # 每次LLM分析费用（元）

    # Membership plans
    MONTHLY_PLAN_PRICE: float = 49.0  # 月费
    MONTHLY_PLAN_EVALUATIONS: int = 50  # 月计划评价次数
    YEARLY_PLAN_PRICE: float = 399.0  # 年费
    YEARLY_PLAN_EVALUATIONS: int = 800  # 年计划评价次数

    # SMTP Email (for password reset)
    SMTP_HOST: str = "smtp.qq.com"
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "MuseCrea"
    RESET_TOKEN_EXPIRE_HOURS: int = 1

    # File upload
    MAX_UPLOAD_SIZE_MB: int = 20
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
