from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import User, WeightEntry
from app.schemas import WeightEntryCreate, WeightEntryOut

router = APIRouter(prefix="/weight", tags=["weight"])


@router.post("/entries", response_model=WeightEntryOut, status_code=status.HTTP_201_CREATED)
async def create_weight_entry(
    payload: WeightEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WeightEntry:
    entry = WeightEntry(
        user_id=current_user.id,
        weight=payload.weight,
        recorded_date=datetime.now(timezone.utc).date(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/entries", response_model=list[WeightEntryOut])
async def list_weight_entries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WeightEntry]:
    result = await db.scalars(
        select(WeightEntry)
        .where(WeightEntry.user_id == current_user.id)
        .order_by(WeightEntry.recorded_date)
    )
    return list(result.all())
