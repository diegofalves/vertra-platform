import asyncpg
from app.core.config import DATABASE_URL

_pool: asyncpg.Pool | None = None


async def create_pool() -> asyncpg.Pool:
    global _pool
    _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool


async def fetch_one(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.fetchrow(query, *args)


async def fetch_all(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.fetch(query, *args)


async def execute(query: str, *args):
    async with get_pool().acquire() as conn:
        return await conn.execute(query, *args)
