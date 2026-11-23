from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import UserCreate
from email_service import send_registration_email


# Create FastAPI application
app = FastAPI(
    title="User Registration API",
    description="Backend API for User Registration System",
    version="1.0.0"
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATABASE SESSION
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

db = get_db()
# --------------------------------------------------
# HOME / HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "Registration API is running"
    }


# --------------------------------------------------
# CREATE USER / REGISTRATION
# --------------------------------------------------

@app.post("/users")
def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        existing_user = (
            db.query(User)
            .filter(User.email == user.email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        new_user = User(
            user_name=user.user_name,
            father_name=user.father_name,
            mother_name=user.mother_name,
            email=user.email,
            date_of_birth=user.date_of_birth,
            gender=user.gender,
            status=user.status
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        # Send registration email
        background_tasks.add_task(
            send_registration_email,
            new_user.email,
            new_user.user_name
        )

        return {
            "success": True,
            "message": "User registered successfully",
            "data": {
                "id": new_user.id,
                "user_name": new_user.user_name,
                "email": new_user.email,
                "status": new_user.status
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

# --------------------------------------------------
# GET ALL USERS
# --------------------------------------------------

@app.get("/users")
def get_users(
    db: Session = Depends(get_db)
):

    users = db.query(User).all()

    return {
        "success": True,
        "data": users
    }

# --------------------------------------------------
# UPDATE USER
# --------------------------------------------------

@app.put("/users/{user_id}")
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db)
):

    try:

        # Find the user
        existing_user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        # User doesn't exist
        if existing_user is None:

            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Check whether another user already
        # has the same email
        email_user = (
            db.query(User)
            .filter(
                User.email == user.email,
                User.id != user_id
            )
            .first()
        )

        if email_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered by another user"
            )

        # Update user details
        existing_user.user_name = user.user_name
        existing_user.father_name = user.father_name
        existing_user.mother_name = user.mother_name
        existing_user.email = user.email
        existing_user.date_of_birth = user.date_of_birth
        existing_user.gender = user.gender
        existing_user.status = user.status

        # Save changes
        db.commit()

        # Refresh object
        db.refresh(existing_user)

        return {
            "success": True,
            "message": "User updated successfully",
            "data": {
                "id": existing_user.id,
                "user_name": existing_user.user_name,
                "email": existing_user.email,
                "status": existing_user.status
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Update failed: {str(e)}"
        )

@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        existing_user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

        if existing_user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        db.delete(existing_user)
        db.commit()

        return {
            "success": True,
            "message": "User deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {str(e)}"
        )
