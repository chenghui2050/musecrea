from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.core.i18n import msg, get_request_lang

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
