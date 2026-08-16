from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models import CommunityPost, User
from app.auth.dependencies import get_current_user
from app.services.gamification_service import award_xp
from pydantic import BaseModel

router = APIRouter(prefix="/community", tags=["Community Knowledge Exchange"])

class PostCreate(BaseModel):
    title: str
    content: str
    category: str = "General Eco Farming"

class PostResponse(BaseModel):
    id: int
    user_id: int
    author_name: str
    author_level: int
    title: str
    content: str
    category: str
    upvotes: int
    created_at: str

    class Config:
        from_attributes = True

@router.get("", response_model=List[PostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).all()
    # Format created_at to string
    res = []
    for p in posts:
        res.append({
            "id": p.id,
            "user_id": p.user_id,
            "author_name": p.author_name,
            "author_level": p.author_level,
            "title": p.title,
            "content": p.content,
            "category": p.category,
            "upvotes": p.upvotes,
            "created_at": p.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return res

@router.post("", response_model=PostResponse)
def create_post(
    post_in: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = CommunityPost(
        user_id=current_user.id,
        author_name=current_user.display_name or current_user.full_name,
        author_level=current_user.level,
        title=post_in.title,
        content=post_in.content,
        category=post_in.category,
        upvotes=0
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # Award community contribution XP
    award_xp(current_user.id, 25, "community_post", f"Community Post: {post.title}", db)

    return {
        "id": post.id,
        "user_id": post.user_id,
        "author_name": post.author_name,
        "author_level": post.author_level,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "upvotes": post.upvotes,
        "created_at": post.created_at.strftime("%Y-%m-%d %H:%M")
    }

@router.post("/{post_id}/upvote")
def upvote_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.upvotes += 1
    db.commit()
    return {"message": "Upvoted!", "upvotes": post.upvotes}
