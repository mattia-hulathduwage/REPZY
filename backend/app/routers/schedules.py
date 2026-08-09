import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.deps import get_current_user
from app.models import Exercise, ScheduleDay, ScheduleDayExercise, User, WorkoutSchedule
from app.schemas import (
    ExerciseCreate,
    ExerciseOut,
    ScheduleDayExerciseIn,
    WorkoutScheduleCreate,
    WorkoutScheduleListOut,
    WorkoutScheduleOut,
    WorkoutScheduleUpdate,
)

router = APIRouter(tags=["schedules"])


@router.get("/exercises", response_model=list[ExerciseOut])
async def list_exercises(
    search: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Exercise]:
    query = select(Exercise).where(Exercise.user_id == current_user.id)
    if search:
        query = query.where(Exercise.name.ilike(f"%{search}%"))
    result = await db.scalars(query.order_by(Exercise.name))
    return list(result.all())


@router.post("/exercises", response_model=ExerciseOut, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    payload: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Exercise:
    exercise = Exercise(user_id=current_user.id, name=payload.name, category=payload.category)
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)
    return exercise


async def _resolve_exercise(
    item: ScheduleDayExerciseIn, current_user: User, db: AsyncSession
) -> Exercise:
    if item.exercise_id is not None:
        exercise = await db.scalar(
            select(Exercise).where(
                Exercise.id == item.exercise_id, Exercise.user_id == current_user.id
            )
        )
        if exercise is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")
        return exercise

    if not item.exercise_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="exercise_id or exercise_name is required",
        )

    existing = await db.scalar(
        select(Exercise).where(
            Exercise.user_id == current_user.id, Exercise.name.ilike(item.exercise_name)
        )
    )
    if existing is not None:
        return existing

    exercise = Exercise(user_id=current_user.id, name=item.exercise_name)
    db.add(exercise)
    await db.flush()
    return exercise


async def _build_days(
    days_in: list, current_user: User, db: AsyncSession
) -> list[ScheduleDay]:
    days: list[ScheduleDay] = []
    for day_in in days_in:
        day = ScheduleDay(
            day_number=day_in.day_number,
            day_label=day_in.day_label,
            is_rest=day_in.is_rest,
        )
        for exercise_in in day_in.exercises:
            exercise = await _resolve_exercise(exercise_in, current_user, db)
            day.exercises.append(
                ScheduleDayExercise(
                    exercise_id=exercise.id,
                    order_index=exercise_in.order_index,
                    sets=exercise_in.sets,
                    reps=exercise_in.reps,
                    weight=exercise_in.weight,
                    rest_seconds=exercise_in.rest_seconds,
                )
            )
        days.append(day)
    return days


async def _load_schedule(schedule_id: uuid.UUID, current_user: User, db: AsyncSession) -> WorkoutSchedule:
    schedule = await db.scalar(
        select(WorkoutSchedule)
        .where(WorkoutSchedule.id == schedule_id, WorkoutSchedule.user_id == current_user.id)
        .options(
            selectinload(WorkoutSchedule.days).selectinload(ScheduleDay.exercises).selectinload(
                ScheduleDayExercise.exercise
            )
        )
    )
    if schedule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule not found")
    return schedule


def _serialize_schedule(schedule: WorkoutSchedule) -> WorkoutScheduleOut:
    return WorkoutScheduleOut(
        id=schedule.id,
        name=schedule.name,
        num_days=schedule.num_days,
        is_active=schedule.is_active,
        days=[
            {
                "id": day.id,
                "day_number": day.day_number,
                "day_label": day.day_label,
                "is_rest": day.is_rest,
                "exercises": [
                    {
                        "id": e.id,
                        "exercise_id": e.exercise_id,
                        "exercise_name": e.exercise.name,
                        "order_index": e.order_index,
                        "sets": e.sets,
                        "reps": e.reps,
                        "weight": e.weight,
                        "rest_seconds": e.rest_seconds,
                    }
                    for e in day.exercises
                ],
            }
            for day in schedule.days
        ],
    )


@router.get("/schedules", response_model=list[WorkoutScheduleListOut])
async def list_schedules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WorkoutSchedule]:
    result = await db.scalars(
        select(WorkoutSchedule)
        .where(WorkoutSchedule.user_id == current_user.id)
        .order_by(WorkoutSchedule.created_at.desc())
    )
    return list(result.all())


@router.post("/schedules", response_model=WorkoutScheduleOut, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    payload: WorkoutScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkoutScheduleOut:
    schedule = WorkoutSchedule(
        user_id=current_user.id,
        name=payload.name,
        num_days=payload.num_days,
    )
    schedule.days = await _build_days(payload.days, current_user, db)
    db.add(schedule)
    await db.commit()

    schedule = await _load_schedule(schedule.id, current_user, db)
    return _serialize_schedule(schedule)


@router.get("/schedules/{schedule_id}", response_model=WorkoutScheduleOut)
async def get_schedule(
    schedule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkoutScheduleOut:
    schedule = await _load_schedule(schedule_id, current_user, db)
    return _serialize_schedule(schedule)


@router.put("/schedules/{schedule_id}", response_model=WorkoutScheduleOut)
async def update_schedule(
    schedule_id: uuid.UUID,
    payload: WorkoutScheduleUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkoutScheduleOut:
    schedule = await _load_schedule(schedule_id, current_user, db)

    schedule.name = payload.name
    schedule.num_days = payload.num_days
    schedule.is_active = payload.is_active
    schedule.days = await _build_days(payload.days, current_user, db)
    await db.commit()

    schedule = await _load_schedule(schedule_id, current_user, db)
    return _serialize_schedule(schedule)


@router.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    schedule = await _load_schedule(schedule_id, current_user, db)
    await db.delete(schedule)
    await db.commit()


@router.post(
    "/schedules/{schedule_id}/duplicate",
    response_model=WorkoutScheduleOut,
    status_code=status.HTTP_201_CREATED,
)
async def duplicate_schedule(
    schedule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkoutScheduleOut:
    source = await _load_schedule(schedule_id, current_user, db)

    new_schedule = WorkoutSchedule(
        user_id=current_user.id,
        name=f"{source.name} copy",
        num_days=source.num_days,
        is_active=False,
    )
    for day in source.days:
        new_day = ScheduleDay(
            day_number=day.day_number, day_label=day.day_label, is_rest=day.is_rest
        )
        for e in day.exercises:
            new_day.exercises.append(
                ScheduleDayExercise(
                    exercise_id=e.exercise_id,
                    order_index=e.order_index,
                    sets=e.sets,
                    reps=e.reps,
                    weight=e.weight,
                    rest_seconds=e.rest_seconds,
                )
            )
        new_schedule.days.append(new_day)

    db.add(new_schedule)
    await db.commit()

    new_schedule = await _load_schedule(new_schedule.id, current_user, db)
    return _serialize_schedule(new_schedule)


@router.patch("/schedules/{schedule_id}/activate", response_model=WorkoutScheduleListOut)
async def activate_schedule(
    schedule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkoutSchedule:
    schedule = await _load_schedule(schedule_id, current_user, db)

    others = await db.scalars(
        select(WorkoutSchedule).where(
            WorkoutSchedule.user_id == current_user.id, WorkoutSchedule.id != schedule_id
        )
    )
    for other in others:
        other.is_active = False

    schedule.is_active = True
    await db.commit()
    await db.refresh(schedule)
    return schedule
