from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends
from app.services.ai_service import (AIService)
from sqlalchemy.orm import Session
from app.db.dependencies import get_db
from app.models.document import Document
from app.services.document_service import ( DocumentService)

from app.core.dependencies import (get_current_user)

router = APIRouter()


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    # Sauvegarde du fichier PDF
    filepath = (
        DocumentService.save_file(
            file
        )
    )

    # Extraction du texte du PDF
    content = (
        DocumentService.extract_text(
            filepath
        )
    )

    # Création du document en base
    document = Document(
        filename=file.filename,
        filepath=filepath,
        content=content,
        owner_id=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "id": document.id,
        "filename": document.filename,
        "characters": len(content)
    }
#OPENAI
@router.post("/{document_id}/summary")
def generate_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.owner_id == current_user.id
        )
        .first()
    )

    if not document:
        return {
            "error": "Document not found"
        }

    summary = (
        AIService.generate_summary(
            document.content
        )
    )

    return {
        "document_id": document.id,
        "summary": summary
    }