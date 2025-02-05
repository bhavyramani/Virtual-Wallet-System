import redis
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_redis_client():
    # Get Redis host and port from environment variables, with defaults if not set
    redis_host = os.getenv('REDIS_HOST', 'localhost')  
    redis_port = int(os.getenv('REDIS_PORT', 6379))  

    # Create and return a Redis client
    return redis.StrictRedis(
        host=redis_host,
        port=redis_port,
        db=0,
        decode_responses=True  
    )
