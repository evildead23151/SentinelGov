import jwt
from datetime import datetime, timedelta
from typing import Optional
from argon2 import PasswordHasher
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "SENTINEL_GOV_SECURE_LAYER_X99" # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

ph = PasswordHasher()
security = HTTPBearer()

def hash_password(password: str) -> str:
    return ph.hash(password)

def verify_password(hashed_password: str, plain_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user_from_token(auth: HTTPAuthorizationCredentials = Security(security)):
    token = auth.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid identity token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Identity token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate identity")

def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    from sqlalchemy.orm import Session
    from . import database, models
    db = next(database.get_db())
    
    username = get_current_user_from_token(auth)
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, auth: HTTPAuthorizationCredentials = Security(security)):
        token = auth.credentials
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_role = payload.get("role")
            if user_role not in self.allowed_roles:
                raise HTTPException(
                    status_code=403, 
                    detail=f"Structural Authority Mismatch. Required: {self.allowed_roles}"
                )
            return payload.get("sub")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            raise HTTPException(status_code=401, detail="Identity Validation Failed")
