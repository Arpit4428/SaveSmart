"""
SaveSmart Goal Repository
Data access layer for savings goals with MongoDB Atlas persistence and in-memory fallback.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from bson import ObjectId
from app.core.config import settings
from app.db.mongodb import get_database


class GoalRepository:
    """Manages CRUD operations for goals in MongoDB Atlas."""

    def __init__(self):
        # In-memory dictionary store for testing or offline operation
        self._in_memory_store: Dict[str, dict] = {}

    @property
    def collection(self):
        db = get_database()
        return db["goals"] if db is not None else None

    async def get_goals_by_user(self, user_id: str) -> List[dict]:
        col = self.collection
        if col is not None:
            cursor = col.find({"user_id": user_id}).sort("created_at", -1)
            goals = []
            async for doc in cursor:
                doc["id"] = str(doc.pop("_id"))
                goals.append(doc)
            return goals

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        return [
            g for g in self._in_memory_store.values()
            if g.get("user_id") == user_id
        ]

    async def get_goal_by_id(self, goal_id: str) -> Optional[dict]:
        col = self.collection
        if col is not None:
            try:
                # Try ObjectId first
                doc = await col.find_one({"_id": ObjectId(goal_id)})
            except Exception:
                # Fallback to string id match
                doc = await col.find_one({"id": goal_id})

            if doc:
                doc["id"] = str(doc.pop("_id"))
                return doc
            return None

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        return self._in_memory_store.get(goal_id)

    async def create_goal(self, goal_data: dict) -> dict:
        now_iso = datetime.now(timezone.utc).isoformat()
        goal_data["created_at"] = now_iso
        goal_data["updated_at"] = now_iso

        col = self.collection
        if col is not None:
            insert_result = await col.insert_one(dict(goal_data))
            goal_data["id"] = str(insert_result.inserted_id)
            return goal_data

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        goal_id = f"goal_{uuid.uuid4().hex[:8]}"
        goal_data["id"] = goal_id
        self._in_memory_store[goal_id] = dict(goal_data)
        return goal_data

    async def update_goal(self, goal_id: str, update_data: dict) -> Optional[dict]:
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        col = self.collection
        if col is not None:
            try:
                filter_q = {"_id": ObjectId(goal_id)}
            except Exception:
                filter_q = {"id": goal_id}

            result = await col.find_one_and_update(
                filter_q,
                {"$set": update_data},
                return_document=True
            )
            if result:
                result["id"] = str(result.pop("_id"))
                return result
            return None

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        if goal_id in self._in_memory_store:
            self._in_memory_store[goal_id].update(update_data)
            return self._in_memory_store[goal_id]
        return None

    async def delete_goal(self, goal_id: str) -> bool:
        col = self.collection
        if col is not None:
            try:
                filter_q = {"_id": ObjectId(goal_id)}
            except Exception:
                filter_q = {"id": goal_id}

            result = await col.delete_one(filter_q)
            return result.deleted_count > 0

        if settings.ENVIRONMENT == "production":
            raise RuntimeError("CRITICAL: MongoDB connection unavailable in production.")

        # In-memory fallback
        if goal_id in self._in_memory_store:
            del self._in_memory_store[goal_id]
            return True
        return False


goal_repository = GoalRepository()
