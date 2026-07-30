from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    user_id: int


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)