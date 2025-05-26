import logging
import sys
from functools import wraps
import time
import asyncio

def setup_logger(name):
    # Configure root logger to ensure all loggers receive proper configuration
    root_logger = logging.getLogger()
    if not root_logger.handlers:
        root_logger.setLevel(logging.INFO)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        simple_formatter = logging.Formatter('%(levelname)s: %(message)s')
        console_handler.setFormatter(simple_formatter)
        root_logger.addHandler(console_handler)
    
    # Configure the specific logger for this module
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # Set to DEBUG level
    
    # Create console handler with detailed formatting
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s [%(name)s:%(funcName)s:%(lineno)d] %(message)s')
    handler.setFormatter(formatter)
    
    # Remove existing handlers to avoid duplicate logs
    logger.handlers = []
    logger.addHandler(handler)
    
    # Ensure logs propagate up to the root logger
    logger.propagate = False
    
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