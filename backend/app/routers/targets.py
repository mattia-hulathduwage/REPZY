import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Target, User
from app.schemas import CalorieTargetUpdate, ProteinTargetUpdate, TargetOut

router = APIRouter(prefix="/targets", tags=["targets"])


async def _get_or_create_target(db: AsyncSession, user_id: uuid.UUID) -> Target:
    target = await db.scalar(select(Target).where(Target.user_id == user_id))
    if target is None:
        target = Target(user_id=user_id)
        db.add(target)
    return target


@router.get("", response_model=TargetOut)
async def get_target(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Target:
    target = await db.scalar(select(Target).where(Target.user_id == current_user.id))
    if target is None:
        return Target(user_id=current_user.id, calorie_target=None, protein_target=None)
    return target


@router.put("/calories", response_model=TargetOut)
async def set_calorie_target(
    payload: CalorieTargetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Target:
    target = await _get_or_create_target(db, current_user.id)
    target.calorie_target = payload.calorie_target
    await db.commit()
    await db.refresh(target)
    return target


@router.put("/protein", response_model=TargetOut)
async def set_protein_target(
    payload: ProteinTargetUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Target:
    target = await _get_or_create_target(db, current_user.id)
    target.protein_target = payload.protein_target
    await db.commit()
    await db.refresh(target)
    return target
