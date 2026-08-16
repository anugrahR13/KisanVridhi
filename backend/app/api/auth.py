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
    if user_in.password != user_in.confirm_password:
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
        location=user_in.location,
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
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
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
    if not phone or len(phone) < 8:
        raise HTTPException(status_code=400, detail="Invalid phone number format.")

    # Simulation OTP code for demonstration/testing
    simulated_otp = "123456"
    
    user = db.query(User).filter(User.phone_number == phone).first()
    if user:
        user.otp_code = simulated_otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    else:
        # Create temp user registration state if needed or set on verify
        pass
        
    db.commit()
    return {
        "message": f"OTP sent to {phone}. (Demo mode OTP: 123456)",
        "phone_number": phone
    }

@router.post("/otp/verify", response_model=Token)
def verify_otp(otp_in: OTPVerify, db: Session = Depends(get_db)):
    phone = otp_in.phone_number.strip()
    code = otp_in.otp_code.strip()

    if code != "123456":
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code.")

    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        # Auto-create farmer user with phone number
        email = f"farmer_{phone[-4:]}@eco.farm"
        user = User(
            email=email,
            phone_number=phone,
            password_hash=get_password_hash("Farmer@123456"),
            full_name=otp_in.full_name or "Farmer",
            display_name=f"{otp_in.full_name or 'Farmer'} ({phone[-4:]})",
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
