from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.i18n import msg, get_request_lang
from app.config import settings
from app.services.email_service import send_reset_email

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=UserResponse)
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """用户注册"""
    lang = get_request_lang(request)
    # 检查用户名和邮箱是否已存在
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail=msg('auth.username_taken', lang))
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail=msg('auth.email_taken', lang))

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        credits=3,  # 新用户赠送3次免费评价
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    """用户登录"""
    lang = get_request_lang(request)
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail=msg('auth.wrong_credentials', lang))
    if not user.is_active:
        raise HTTPException(status_code=403, detail=msg('auth.account_disabled', lang))

    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    full_name: str = None,
    phone: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新个人信息"""
    if full_name is not None:
        current_user.full_name = full_name
    if phone is not None:
        current_user.phone = phone
    db.commit()
    db.refresh(current_user)
    return current_user


# ========== 密码重置 ==========

@router.post("/forgot-password")
def forgot_password(request: Request, email: str, db: Session = Depends(get_db)):
    """忘记密码 - 发送重置邮件"""
    lang = get_request_lang(request)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # 不泄露邮箱是否存在，统一返回成功
        return {'message': msg('auth.reset_email_sent', lang)}

    # 生成重置 token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
        hours=settings.RESET_TOKEN_EXPIRE_HOURS
    )
    db.commit()

    # 发送邮件
    base_url = str(request.base_url).rstrip('/')
    send_reset_email(user.email, user.username, token, base_url)

    return {'message': msg('auth.reset_email_sent', lang)}


@router.post("/reset-password")
def reset_password(
    request: Request,
    token: str,
    new_password: str,
    db: Session = Depends(get_db),
):
    """使用 token 重置密码"""
    lang = get_request_lang(request)
    user = db.query(User).filter(
        User.reset_token == token,
        User.reset_token_expires > datetime.now(timezone.utc),
    ).first()
    if not user:
        raise HTTPException(status_code=400, detail=msg('auth.invalid_reset_token', lang))

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail=msg('auth.password_too_short', lang))

    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {'message': msg('auth.password_reset_ok', lang)}
