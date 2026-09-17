"""
SaveSmart Goal Controller
CRUD operations and baseline health analysis for savings goals.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.common import ApiResponse
from app.schemas.goal import (
    GoalCreateRequest,
    GoalHealthResponse,
    GoalResponse,
    GoalUpdateRequest,
)
from app.services.goal_service import goal_service

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=ApiResponse[List[GoalResponse]])
async def list_goals(user_id: str = Query("demo_user", description="User ID")):
    """List all savings goals for a user."""
    goals = await goal_service.list_user_goals(user_id)
    return ApiResponse[List[GoalResponse]](success=True, data=goals)


@router.post("", response_model=ApiResponse[GoalResponse], status_code=status.HTTP_201_CREATED)
async def create_goal(req: GoalCreateRequest):
    """Create a new savings goal."""
    created = await goal_service.create_goal(req)
    return ApiResponse[GoalResponse](success=True, data=created)


@router.get("/{goal_id}", response_model=ApiResponse[GoalResponse])
async def get_goal(goal_id: str):
    """Retrieve a single savings goal by ID."""
    goal = await goal_service.get_goal(goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return ApiResponse[GoalResponse](success=True, data=goal)


@router.put("/{goal_id}", response_model=ApiResponse[GoalResponse])
async def update_goal(goal_id: str, req: GoalUpdateRequest):
    """Update goal parameters."""
    updated = await goal_service.update_goal(goal_id, req)
    if not updated:
        raise HTTPException(status_code=404, detail="Goal not found")
    return ApiResponse[GoalResponse](success=True, data=updated)


@router.delete("/{goal_id}", response_model=ApiResponse[dict])
async def delete_goal(goal_id: str):
    """Delete a savings goal."""
    success = await goal_service.delete_goal(goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    return ApiResponse[dict](success=True, data={"id": goal_id, "deleted": True})


@router.get("/{goal_id}/health", response_model=ApiResponse[GoalHealthResponse])
async def get_goal_health(goal_id: str):
    """
    Evaluates baseline goal health, computing the Resilience Score (0–100)
    and risk factors strictly via the deterministic Financial Engine.
    """
    health = await goal_service.get_goal_health(goal_id)
    if not health:
        raise HTTPException(status_code=404, detail="Goal not found")
    return ApiResponse[GoalHealthResponse](success=True, data=health)
