from datetime import date
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):

    user_name: str
    father_name: str
    mother_name: str
    email: EmailStr
    date_of_birth: date
    gender: str
    status: str = "Active"

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value):

        allowed_genders = ["Male", "Female", "Other"]

        if value not in allowed_genders:
            raise ValueError(
                "Gender must be Male, Female, or Other"
            )

        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value):

        today = date.today()

        if value >= today:
            raise ValueError(
                "Date of birth must be a past date"
            )

        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):

        allowed_status = ["Active", "Inactive"]

        if value not in allowed_status:
            raise ValueError(
                "Status must be Active or Inactive"
            )

        return value