import aioredis

redis_pool = None
async def get_redis_pool():
    global redis_pool
    if redis_pool is None:
        redis_pool = await aioredis.from_url("redis://cache:6379", encoding="utf-8", decode_responses=True)
    return redis_pool
