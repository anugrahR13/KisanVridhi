from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import User, Farm, AIChatMessage
from app.schemas import ChatRequest, ChatResponse
from app.auth.dependencies import get_current_user
from app.ai.knowledge_base import AgriculturalRAGKnowledgeBase

router = APIRouter(prefix="/assistant", tags=["AI Farming Assistant"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(chat_in: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch farm profile if available
    farm = None
    if chat_in.farm_id:
        farm = db.query(Farm).filter(Farm.id == chat_in.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        farm = db.query(Farm).filter(Farm.user_id == current_user.id).first()

    farm_info = {}
    if farm:
        farm_info = {
            "primary_crop": farm.primary_crop,
            "soil_type": farm.soil_type,
            "irrigation_type": farm.irrigation_type,
            "water_source": farm.water_source,
            "area_acres": farm.area_acres
        }

    # Generate answer using RAG knowledge base
    rag_result = AgriculturalRAGKnowledgeBase.generate_grounded_answer(
        query_text=chat_in.message,
        farm_info=farm_info
    )

    # Store user query & assistant reply in chat history database
    user_msg = AIChatMessage(
        user_id=current_user.id,
        farm_id=farm.id if farm else None,
        role="user",
        content=chat_in.message
    )
    db.add(user_msg)

    assistant_msg = AIChatMessage(
        user_id=current_user.id,
        farm_id=farm.id if farm else None,
        role="assistant",
        content=rag_result["reply"],
        sources_json=rag_result["sources"]
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "reply": rag_result["reply"],
        "sources": rag_result["sources"],
        "farm_context_used": rag_result["farm_context_used"]
    }
