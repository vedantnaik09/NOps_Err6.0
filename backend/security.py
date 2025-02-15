# security.py
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Annotated

# Load environment variables
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret-if-not-set")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        print(payload)
        user_id: str = payload.get("id")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError as e:
        raise credentials_exception