from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Meal, MealItem, User
from app.schemas import MealCreate, MealOut
from app.services.nutrition import NutritionEstimationError, estimate_nutrition

router = APIRouter(prefix="/meals", tags=["meals"])


@router.post("", response_model=MealOut, status_code=status.HTTP_201_CREATED)
async def create_meal(
    payload: MealCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Meal:
    try:
        estimates = await estimate_nutrition(
            [(item.food_name, item.quantity, item.unit) for item in payload.items]
        )
    except NutritionEstimationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not estimate nutrition for these items. Please try again.",
        ) from exc

    meal = Meal(
        user_id=current_user.id,
        meal_type=payload.meal_type,
        logged_at=payload.logged_at,
        items=[
            MealItem(
                food_name=item.food_name,
                quantity=item.quantity,
                unit=item.unit,
                calories=estimate["calories"],
                protein_g=estimate["protein_g"],
                carbs_g=estimate["carbs_g"],
                fats_g=estimate["fats_g"],
            )
            for item, estimate in zip(payload.items, estimates)
        ],
    )
    db.add(meal)
    await db.commit()

    meal = await db.scalar(
        select(Meal).where(Meal.id == meal.id).options(selectinload(Meal.items))
    )
    return meal


@router.get("", response_model=list[MealOut])
async def list_meals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Meal]:
    result = await db.scalars(
        select(Meal)
        .where(Meal.user_id == current_user.id)
        .options(selectinload(Meal.items))
        .order_by(Meal.logged_at.desc())
    )
    return list(result.all())
