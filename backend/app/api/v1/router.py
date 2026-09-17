"""
SaveSmart API v1 Router Aggregator
Combines Health, Goals, and Baseline endpoints.
"""
from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.goals import router as goals_router
from app.api.v1.baseline import router as baseline_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(goals_router)
api_v1_router.include_router(baseline_router)
