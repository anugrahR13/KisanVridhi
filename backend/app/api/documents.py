import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models import FarmDocument, User
from app.schemas import FarmDocumentResponse
from app.auth.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Document Vault"])

DOC_UPLOAD_DIR = os.path.join(settings.UPLOAD_DIR, "documents")
os.makedirs(DOC_UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[FarmDocumentResponse])
def get_documents(
    category: Optional[str] = None,
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FarmDocument).filter(FarmDocument.user_id == current_user.id)
    if category:
        query = query.filter(FarmDocument.category == category)
    if farm_id:
        query = query.filter(FarmDocument.farm_id == farm_id)
    return query.order_by(FarmDocument.uploaded_at.desc()).all()

@router.post("", response_model=FarmDocumentResponse)
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    farm_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save uploaded file
    filename = f"user_{current_user.id}_{int(os.path.getmtime(settings.UPLOAD_DIR) if os.path.exists(settings.UPLOAD_DIR) else 1)}_{file.filename}"
    file_path = os.path.join(DOC_UPLOAD_DIR, filename)

    contents = await file.read()
    file_size = len(contents)

    with open(file_path, "wb") as f:
        f.write(contents)

    relative_path = f"/uploads/documents/{filename}"

    new_doc = FarmDocument(
        user_id=current_user.id,
        farm_id=farm_id,
        title=title,
        category=category,
        file_path=relative_path,
        file_type=file.content_type or "application/octet-stream",
        file_size_bytes=file_size
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    doc = db.query(FarmDocument).filter(FarmDocument.id == doc_id, FarmDocument.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Try removing file on disk
    if doc.file_path.startswith("/uploads/"):
        abs_path = os.path.join(settings.UPLOAD_DIR, doc.file_path.replace("/uploads/", ""))
        if os.path.exists(abs_path):
            try:
                os.remove(abs_path)
            except Exception:
                pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
