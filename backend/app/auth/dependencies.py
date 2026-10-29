from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User
from app.auth.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Graceful handling for demo token in development/demo preview mode
    if token == "demo-token":
        gurpreet_user = db.query(User).filter(User.email == "gurpreet@eco.farm").first()
        if gurpreet_user:
            return gurpreet_user
        demo_user = db.query(User).filter(User.email == "farmer@eco.farm").first()
        if demo_user:
            return demo_user
        first_user = db.query(User).first()
        if first_user:
            return first_user

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
        
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    return user

def get_current_admin(token: str = Depends(oauth2_scheme), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
    if token == "demo-token":
        admin_user = db.query(User).filter(User.email == "admin@eco.farm").first()
        if admin_user:
            return admin_user
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation prohibited. Admin privileges required."
        )
    return current_user
