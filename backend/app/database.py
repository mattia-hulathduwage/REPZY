from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# Neon requires SSL; asyncpg needs it passed via connect_args rather than a ?sslmode= query param.
# statement_cache_size=0 is required when connecting through Neon's PgBouncer pooler (transaction
# mode doesn't support asyncpg's prepared statement cache).
# pool_recycle (instead of pool_pre_ping) avoids paying a round trip to validate the connection on
# every single checkout, which is costly over a high-latency link.
engine = create_async_engine(
    settings.database_url,
    connect_args={"ssl": True, "statement_cache_size": 0},
    pool_recycle=300,
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
