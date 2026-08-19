import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from app.models import MealType


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class WeightEntryCreate(BaseModel):
    weight: float = Field(gt=0, le=500)


class WeightEntryOut(BaseModel):
    id: uuid.UUID
    weight: float
    recorded_date: date

    model_config = {"from_attributes": True}


class HeightEntryCreate(BaseModel):
    height: float = Field(gt=0, le=300)


class HeightEntryOut(BaseModel):
    id: uuid.UUID
    height: float
    recorded_date: date

    model_config = {"from_attributes": True}


class CalorieTargetUpdate(BaseModel):
    calorie_target: float = Field(gt=0, le=20000)


class ProteinTargetUpdate(BaseModel):
    protein_target: float = Field(gt=0, le=2000)


class TargetOut(BaseModel):
    calorie_target: float | None
    protein_target: float | None

    model_config = {"from_attributes": True}


class ExerciseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=50)


class ExerciseOut(BaseModel):
    id: uuid.UUID
    name: str
    category: str | None

    model_config = {"from_attributes": True}


class ScheduleDayExerciseIn(BaseModel):
    exercise_id: uuid.UUID | None = None
    exercise_name: str | None = Field(default=None, max_length=100)
    order_index: int
    sets: int | None = None
    reps: str | None = Field(default=None, max_length=20)
    weight: float | None = None
    rest_seconds: int | None = None


class ScheduleDayExerciseOut(BaseModel):
    id: uuid.UUID
    exercise_id: uuid.UUID
    exercise_name: str
    order_index: int
    sets: int | None
    reps: str | None
    weight: float | None
    rest_seconds: int | None

    model_config = {"from_attributes": True}


class ScheduleDayIn(BaseModel):
    day_number: int = Field(ge=1, le=7)
    day_label: str | None = Field(default=None, max_length=50)
    is_rest: bool = False
    exercises: list[ScheduleDayExerciseIn] = []


class ScheduleDayOut(BaseModel):
    id: uuid.UUID
    day_number: int
    day_label: str | None
    is_rest: bool
    exercises: list[ScheduleDayExerciseOut]

    model_config = {"from_attributes": True}


class WorkoutScheduleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    num_days: int = Field(ge=1, le=7)
    days: list[ScheduleDayIn]


class WorkoutScheduleUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    num_days: int = Field(ge=1, le=7)
    is_active: bool = True
    days: list[ScheduleDayIn]


class WorkoutScheduleListOut(BaseModel):
    id: uuid.UUID
    name: str
    num_days: int
    is_active: bool

    model_config = {"from_attributes": True}


class WorkoutScheduleOut(BaseModel):
    id: uuid.UUID
    name: str
    num_days: int
    is_active: bool
    days: list[ScheduleDayOut]

    model_config = {"from_attributes": True}


class MealItemCreate(BaseModel):
    food_name: str = Field(min_length=1, max_length=255)
    quantity: float = Field(gt=0)
    unit: str | None = Field(default=None, max_length=50)


class MealItemOut(BaseModel):
    id: uuid.UUID
    food_name: str
    quantity: float
    unit: str | None
    calories: float
    protein_g: float
    carbs_g: float
    fats_g: float

    model_config = {"from_attributes": True}


class MealCreate(BaseModel):
    meal_type: MealType
    logged_at: datetime
    items: list[MealItemCreate] = Field(min_length=1)


class MealOut(BaseModel):
    id: uuid.UUID
    meal_type: MealType
    logged_at: datetime
    created_at: datetime
    items: list[MealItemOut]

    model_config = {"from_attributes": True}
