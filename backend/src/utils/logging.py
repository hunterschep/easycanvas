import logging
import sys
from functools import wraps
import time

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    
    return logger

def log_execution_time(logger):
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.time()
            result = await func(*args, **kwargs)
            end = time.time()
            logger.info(f"{func.__name__} took {end - start:.2f} seconds to execute")
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.time()
            result = func(*args, **kwargs)
            end = time.time()
            logger.info(f"{func.__name__} took {end - start:.2f} seconds to execute")
            return result

        return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper
    return decorator