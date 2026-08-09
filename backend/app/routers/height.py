from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import HeightEntry, User
from app.schemas import HeightEntryCreate, HeightEntryOut

router = APIRouter(prefix="/height", tags=["height"])


@router.post("/entries", response_model=HeightEntryOut, status_code=status.HTTP_201_CREATED)
async def create_height_entry(
    payload: HeightEntryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HeightEntry:
    entry = HeightEntry(
        user_id=current_user.id,
        height=payload.height,
        recorded_date=datetime.now(timezone.utc).date(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/entries", response_model=list[HeightEntryOut])
async def list_height_entries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[HeightEntry]:
    result = await db.scalars(
        select(HeightEntry)
        .where(HeightEntry.user_id == current_user.id)
        .order_by(HeightEntry.recorded_date)
    )
    return list(result.all())
