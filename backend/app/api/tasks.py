from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.models import FarmTask, User
from app.schemas import FarmTaskCreate, FarmTaskUpdate, FarmTaskResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Farmer Action Center Tasks"])

@router.get("", response_model=List[FarmTaskResponse])
def get_tasks(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmTask).filter(FarmTask.user_id == current_user.id)
    if status_filter:
        query = query.filter(FarmTask.status == status_filter)
    return query.order_by(FarmTask.due_date.asc(), FarmTask.created_at.desc()).all()

@router.post("", response_model=FarmTaskResponse)
def create_task(
    task_in: FarmTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_task = FarmTask(
        user_id=current_user.id,
        farm_id=task_in.farm_id,
        title=task_in.title,
        description=task_in.description,
        category=task_in.category or "General",
        due_date=task_in.due_date,
        priority=task_in.priority or "medium",
        source=task_in.source or "user",
        status="pending"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=FarmTaskResponse)
def update_task(
    task_id: int,
    task_in: FarmTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(FarmTask).filter(FarmTask.id == task_id, FarmTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_in.title is not None:
        task.title = task_in.title
    if task_in.description is not None:
        task.description = task_in.description
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.status is not None:
        task.status = task_in.status

    db.commit()
    db.refresh(task)
    return task

@router.post("/{task_id}/toggle", response_model=FarmTaskResponse)
def toggle_task_status(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(FarmTask).filter(FarmTask.id == task_id, FarmTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "completed" if task.status == "pending" else "pending"
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(FarmTask).filter(FarmTask.id == task_id, FarmTask.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
