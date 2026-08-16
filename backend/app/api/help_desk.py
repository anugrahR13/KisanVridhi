from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/help-desk", tags=["Farmer Help Desk & Support Tickets"])

class TicketCreate(BaseModel):
    subject: str
    category: str = "General Advisory"
    description: str

class TicketResponse(BaseModel):
    id: int
    ticket_no: str
    subject: str
    category: str
    status: str
    created_at: str

@router.get("", response_model=List[TicketResponse])
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return [
        {
            "id": 1,
            "ticket_no": "TICK-9021",
            "subject": "Soil Health Card test lab location near Ludhiana",
            "category": "Soil Advisory",
            "status": "In Progress",
            "created_at": "2026-08-14 10:30"
        },
        {
            "id": 2,
            "ticket_no": "TICK-9044",
            "subject": "Solar Pump subsidy application status inquiry",
            "category": "Government Schemes",
            "status": "Resolved",
            "created_at": "2026-08-10 14:15"
        }
    ]

@router.post("", response_model=TicketResponse)
def create_ticket(
    ticket_in: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "id": 3,
        "ticket_no": "TICK-9105",
        "subject": ticket_in.subject,
        "category": ticket_in.category,
        "status": "Open (Assigned to KVK Agronomist)",
        "created_at": "2026-08-15 22:45"
    }
