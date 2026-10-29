from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, OTPRequest, OTPVerify, Token, UserResponse, UserUpdate
from app.auth.security import get_password_hash, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    display_name = user_in.full_name.split()[0] + " Farmer" if user_in.full_name else "Farmer"

    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        display_name=display_name,
        location=user_in.location or "Punjab, India",
        phone_number=user_in.phone_number,
        preferred_language=user_in.preferred_language or "English",
        role="farmer",
        xp=0,
        level=1,
        sustainability_score=50.0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token_str = create_access_token(user_id=new_user.id, role=new_user.role)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": new_user.role,
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "display_name": new_user.display_name
    }

@router.post("/login", response_model=Token)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    raw_input = credentials.email.strip()
    clean_input = raw_input.lower()
    pwd = credentials.password.strip()

    # 1. New Complete Profile: Gurpreet Singh (All implemented features)
    if clean_input in ["gurpreet@eco.farm", "gurpreet", "kisan@eco.farm", "kisan", "+919876501234", "9876501234"]:
        user = db.query(User).filter(User.email == "gurpreet@eco.farm").first()
        if user and (pwd in ["Gurpreet@123", "123456", "password", "Gurpreet@123456", "gurpreet", "kisan"] or verify_password(pwd, user.password_hash)):
            token_str = create_access_token(user_id=user.id, role=user.role)
            return {
                "access_token": token_str,
                "token_type": "bearer",
                "role": user.role,
                "user_id": user.id,
                "full_name": user.full_name,
                "display_name": user.display_name
            }

    # 2. Demo Farmer: Anugrah Sharma
    if clean_input in ["farmer@eco.farm", "demo@eco.farm", "farmer", "anugrah@eco.farm", "anugrah", "+919876543210", "9876543210"]:
        user = db.query(User).filter(User.email == "farmer@eco.farm").first()
        if user and (pwd in ["123456", "Farmer@123456", "farmer123", "password", "farmer", "Farmer@123"] or verify_password(pwd, user.password_hash)):
            token_str = create_access_token(user_id=user.id, role=user.role)
            return {
                "access_token": token_str,
                "token_type": "bearer",
                "role": user.role,
                "user_id": user.id,
                "full_name": user.full_name,
                "display_name": user.display_name
            }

    # 3. Demo Admin
    if clean_input in ["admin@eco.farm", "admin"]:
        admin_user = db.query(User).filter(User.email == "admin@eco.farm").first()
        if admin_user and (pwd in ["123456", "Admin@123456", "admin123", "admin", "password"] or verify_password(pwd, admin_user.password_hash)):
            token_str = create_access_token(user_id=admin_user.id, role=admin_user.role)
            return {
                "access_token": token_str,
                "token_type": "bearer",
                "role": admin_user.role,
                "user_id": admin_user.id,
                "full_name": admin_user.full_name,
                "display_name": admin_user.display_name
            }

    # 4. Standard Database Lookup by email or phone
    user = db.query(User).filter((User.email == raw_input) | (User.email == clean_input) | (User.phone_number == raw_input)).first()
    if not user:
        digits = "".join(filter(str.isdigit, raw_input))
        if digits:
            user = db.query(User).filter(User.phone_number.like(f"%{digits[-10:]}%")).first()

    if not user or not verify_password(pwd, user.password_hash):
        if user and user.email == "gurpreet@eco.farm" and pwd in ["Gurpreet@123", "123456", "password"]:
            pass
        elif user and user.email == "farmer@eco.farm" and pwd in ["123456", "Farmer@123456", "farmer123", "password"]:
            pass
        elif user and user.email == "admin@eco.farm" and pwd in ["123456", "Admin@123456", "admin123", "password"]:
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email/username or password."
            )

    token_str = create_access_token(user_id=user.id, role=user.role)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "display_name": user.display_name
    }

@router.post("/otp/send")
def send_otp(otp_in: OTPRequest, db: Session = Depends(get_db)):
    phone = otp_in.phone_number.strip()
    digits = "".join(filter(str.isdigit, phone))
    if not digits or len(digits) < 6:
        raise HTTPException(status_code=400, detail="Invalid phone number format.")

    # Match Gurpreet (+919876501234) or Farmer (+919876543210)
    user = None
    if "9876501234" in digits:
        user = db.query(User).filter(User.email == "gurpreet@eco.farm").first()
    elif "9876543210" in digits:
        user = db.query(User).filter(User.email == "farmer@eco.farm").first()
    else:
        user = db.query(User).filter(User.phone_number.like(f"%{digits[-10:]}%")).first()

    simulated_otp = "123456"
    if user:
        user.otp_code = simulated_otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        db.commit()

    return {
        "message": f"OTP sent to {phone}. (Demo mode OTP: 123456)",
        "phone_number": phone,
        "demo_otp": "123456"
    }

@router.post("/otp/verify", response_model=Token)
def verify_otp(otp_in: OTPVerify, db: Session = Depends(get_db)):
    phone = otp_in.phone_number.strip()
    digits = "".join(filter(str.isdigit, phone))
    code = otp_in.otp_code.strip()

    if code != "123456":
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

    user = None
    if "9876501234" in digits:
        user = db.query(User).filter(User.email == "gurpreet@eco.farm").first()
    elif "9876543210" in digits:
        user = db.query(User).filter(User.email == "farmer@eco.farm").first()
    else:
        user = db.query(User).filter(User.phone_number.like(f"%{digits[-10:]}%")).first()

    if not user:
        # Default to Gurpreet Singh (full features profile) if sample phone
        if digits.endswith("1234") or digits.endswith("3210"):
            user = db.query(User).filter(User.email == "gurpreet@eco.farm").first()

    if not user:
        email = f"farmer_{digits[-4:] if len(digits)>=4 else 'new'}@eco.farm"
        user = User(
            email=email,
            phone_number=phone,
            password_hash=get_password_hash("Gurpreet@123"),
            full_name=otp_in.full_name or "Farmer",
            display_name=f"{otp_in.full_name or 'Farmer'}",
            location=otp_in.location or "India",
            preferred_language="English",
            role="farmer",
            xp=50,
            level=1,
            sustainability_score=50.0
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token_str = create_access_token(user_id=user.id, role=user.role)
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "display_name": user.display_name
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.display_name:
        current_user.display_name = user_update.display_name
    if user_update.location:
        current_user.location = user_update.location
    if user_update.preferred_language:
        current_user.preferred_language = user_update.preferred_language

    db.commit()
    db.refresh(current_user)
    return current_user
