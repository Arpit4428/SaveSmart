"""
SaveSmart Baseline Financial Repository
Data access layer for user baseline profiles with MongoDB Atlas persistence and in-memory fallback.
"""
from datetime import datetime, timezone
from typing import Dict, Optional
from app.core.config import settings
from app.db.mongodb import get_database


class BaselineRepository:
    """Manages CRUD operations for financial baselines in MongoDB Atlas."""

    def __init__(self):
        self._in_memory_store: Dict[str, dict] = {}

    @property
    def collection(self):
        db = get_database()
        return db["baselines"] if db is not None else None

    async def get_baseline_by_user(self, user_id: str) -> Optional[dict]:
        col = self.collection
        if col is not None:
            doc = await col.find_one({"user_id": user_id})
            if doc:
                doc.pop("_id", None)
                return doc
            return None

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        return self._in_memory_store.get(user_id)

    async def save_baseline(self, user_id: str, baseline_data: dict) -> dict:
        now_iso = datetime.now(timezone.utc).isoformat()
        baseline_data["user_id"] = user_id
        baseline_data["updated_at"] = now_iso

        col = self.collection
        if col is not None:
            await col.update_one(
                {"user_id": user_id},
                {"$set": baseline_data},
                upsert=True
            )
            return baseline_data

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        self._in_memory_store[user_id] = dict(baseline_data)
        return baseline_data


baseline_repository = BaselineRepository()
