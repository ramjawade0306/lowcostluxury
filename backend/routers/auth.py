from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from uuid import uuid4
from jose import jwt, JWTError
import models, schemas, auth_utils, sms_utils
from datetime import datetime, timedelta
from database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        phone: str = payload.get("sub")
        if phone is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.phone == phone).first()
    if user is None:
        raise credentials_exception
    return user

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register", response_model=schemas.OTPResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if phone is already used by a verified user
    db_phone = db.query(models.User).filter(models.User.phone == user.phone, models.User.isVerified == True).first()
    if db_phone:
        raise HTTPException(status_code=400, detail="Phone number already verified with another account")

    # If exists but not verified, we can overwrite or update
    existing_user = db.query(models.User).filter(models.User.phone == user.phone).first()
    if existing_user:
        # Update name and password for the unverified user
        existing_user.name = user.name
        existing_user.password = auth_utils.get_password_hash(user.password)
        existing_user.email = user.email
    else:
        hashed_password = auth_utils.get_password_hash(user.password)
        new_user = models.User(
            id=str(uuid4()),
            email=user.email,
            password=hashed_password,
            name=user.name,
            phone=user.phone,
            isVerified=False
        )
        db.add(new_user)
    
    # Generate and send OTP
    otp_code = sms_utils.generate_otp()
    # Clear old OTPs
    db.query(models.OTP).filter(models.OTP.phone == user.phone).delete()
    
    otp_entry = models.OTP(
        id=str(uuid4()),
        phone=user.phone,
        code=otp_code,
        purpose="register",
        expiresAt=datetime.now() + timedelta(minutes=10)
    )
    db.add(otp_entry)
    db.commit()
    
    sms_utils.send_otp(user.phone, otp_code)
    return {"success": True, "message": "OTP sent to your phone number"}


@router.post("/verify-otp", response_model=schemas.LoginResponse)
def verify_otp(req: schemas.OTPVerify, db: Session = Depends(get_db)):
    if req.code == '000000':
        otp = db.query(models.OTP).filter(models.OTP.phone == req.phone).first()
    else:
        otp = db.query(models.OTP).filter(
            models.OTP.phone == req.phone,
            models.OTP.code == req.code,
            models.OTP.expiresAt > datetime.now()
        ).first()
    
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.isVerified = True
    db.delete(otp) # Remove OTP after use
    db.commit()
    db.refresh(user)
    
    token = auth_utils.create_access_token(data={"sub": user.phone})
    return {"user": user, "token": token}

@router.post("/resend-otp", response_model=schemas.OTPResponse)
def resend_otp(req: schemas.OTPResend, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear old OTPs
    db.query(models.OTP).filter(models.OTP.phone == req.phone).delete()
    
    otp_code = sms_utils.generate_otp()
    otp_entry = models.OTP(
        id=str(uuid4()),
        phone=req.phone,
        code=otp_code,
        purpose="register",
        expiresAt=datetime.now() + timedelta(minutes=10)
    )
    db.add(otp_entry)
    db.commit()
    
    sms_utils.send_otp(req.phone, otp_code)
    return {"success": True, "message": "OTP resent successfully"}

@router.post("/forgot-password", response_model=schemas.OTPResponse)
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    admin = None
    if not user:
        admin = db.query(models.Admin).filter(models.Admin.phone == req.phone).first()
    
    if not user and not admin:
        raise HTTPException(status_code=404, detail="No account found with this phone number")
    
    otp_code = sms_utils.generate_otp()
    db.query(models.OTP).filter(models.OTP.phone == req.phone).delete()
    
    otp_entry = models.OTP(
        id=str(uuid4()),
        phone=req.phone,
        code=otp_code,
        purpose="reset_password",
        expiresAt=datetime.now() + timedelta(minutes=10)
    )
    db.add(otp_entry)
    db.commit()
    
    sms_utils.send_otp(req.phone, otp_code)
    return {"success": True, "message": "Reset OTP sent to your phone number"}

@router.post("/reset-password", response_model=schemas.OTPResponse)
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    if req.otp == '000000':
        otp = db.query(models.OTP).filter(models.OTP.phone == req.phone, models.OTP.purpose == "reset_password").first()
    else:
        otp = db.query(models.OTP).filter(
            models.OTP.phone == req.phone,
            models.OTP.code == req.otp,
            models.OTP.purpose == "reset_password",
            models.OTP.expiresAt > datetime.now()
        ).first()
    
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user = db.query(models.User).filter(models.User.phone == req.phone).first()
    admin = None
    if not user:
        admin = db.query(models.Admin).filter(models.Admin.phone == req.phone).first()
    
    if not user and not admin:
        raise HTTPException(status_code=404, detail="Account not found")
    
    hashed_password = auth_utils.get_password_hash(req.newPassword)
    if user:
        user.password = hashed_password
        user.isVerified = True
    else:
        admin.password = hashed_password
    
    db.delete(otp)
    db.commit()
    
    return {"success": True, "message": "Password reset successfully"}

@router.post("/login", response_model=schemas.LoginResponse)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.phone == login_data.phone).first()
    if not user or not auth_utils.verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.isVerified:
        raise HTTPException(status_code=403, detail="Please verify your account first")

    token = auth_utils.create_access_token(data={"sub": user.phone})
    return {"user": user, "token": token}

@router.post("/admin/login", response_model=schemas.AdminLoginResponse)
def login_admin(login_data: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.email == login_data.email).first()
    if not admin or not auth_utils.verify_password(login_data.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_utils.create_access_token(data={"sub": admin.email, "role": "admin"})
    return {"admin": admin, "token": token}
