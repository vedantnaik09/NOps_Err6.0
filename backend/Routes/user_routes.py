from fastapi import APIRouter, HTTPException
from Models.user_model import UserSignup, UserLogin, Token
from Functions.auth import get_password_hash, verify_password, create_access_token
from database import db

router = APIRouter()


@router.post("/register", response_model=Token)
async def register_user(user: UserSignup):
    # Check if a user with this email already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password and prepare data for insertion.
    hashed_password = get_password_hash(user.password)
    user_data = user.dict(exclude={"password"})
    user_data["hashed_password"] = hashed_password
    user_data["user_type"] = "client"  # Mark the user as a client.
    
    result = await db.users.insert_one(user_data)
    user_id = str(result.inserted_id)
    
    # Create and return a JWT token.
    token = create_access_token({
        "sub": user.email,
        "id": user_id,
        "user_type": "client"
    })
    
    # Prepare the response data
    user_response = {
        "token": token,
        "user": {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "phoneNumber": user.phoneNumber,
            "address": user.address,
            "user_type": "client"
        }
    }
    return user_response


@router.post("/login", response_model=Token)
async def login_user(user: UserLogin):
    # Look for the user in the database.
    found_user = await db.users.find_one({"email": user.email})
    if not found_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify the provided password.
    if not verify_password(user.password, found_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_access_token({
        "sub": user.email,
        "id": str(found_user["_id"]),
        "user_type": "client"
    })
    
    # Prepare user data excluding sensitive information
    user_data = {
        "id": str(found_user["_id"]),
        "email": found_user["email"],
        "name": found_user["name"],
        "phoneNumber": found_user["phoneNumber"],
        "address": found_user["address"],
        "user_type": found_user["user_type"]
    }
    
    return {
        "token": token,
        "user": user_data
    }
