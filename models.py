from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, text

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    user_name = Column(String(100), nullable=False)

    father_name = Column(String(100), nullable=False)

    mother_name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False)

    date_of_birth = Column(Date, nullable=False)

    gender = Column(String(20), nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="Active"
    )

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )