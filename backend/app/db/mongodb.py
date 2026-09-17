"""
SaveSmart MongoDB Atlas Connection Lifecycle
Manages Motor AsyncIOMotorClient with resilient error handling and ping verification.
"""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("savesmart.db")


class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None
    is_connected: bool = False


db_manager = DatabaseManager()


async def connect_to_mongo() -> None:
    """Initializes MongoDB Atlas connection."""
    uri = settings.MONGODB_URI
    if not uri:
        logger.warning("MONGODB_URI not configured. Operating in mock/in-memory repository fallback mode.")
        db_manager.is_connected = False
        return

    try:
        logger.info("Connecting to MongoDB Atlas...")
        db_manager.client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        db_manager.database = db_manager.client[settings.MONGODB_DB_NAME]
        # Ping to verify connectivity
        await db_manager.client.admin.command("ping")
        db_manager.is_connected = True
        logger.info(f"Connected to MongoDB Atlas: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}. Falling back to in-memory store.")
        db_manager.is_connected = False


async def close_mongo_connection() -> None:
    """Closes MongoDB Atlas connection."""
    if db_manager.client is not None:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        db_manager.is_connected = False
        logger.info("MongoDB connection closed.")


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns active MongoDB database instance if connected."""
    return db_manager.database if db_manager.is_connected else None


async def ping_database() -> bool:
    """Pings MongoDB Atlas to verify connection health."""
    if not db_manager.is_connected or db_manager.client is None:
        return False
    try:
        await db_manager.client.admin.command("ping")
        return True
    except Exception:
        return False
