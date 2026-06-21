from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.document import Document
from app.services.document_service import DocumentService
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user
from app.services.quiz_service import QuizService
router = APIRouter()


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    filepath = DocumentService.save_file(file)
    content = DocumentService.extract_text(filepath)

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


@router.post("/{document_id}/summary")
def generate_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        summary = AIService.generate_summary(document.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "document_id": document.id,
        "summary": summary
    }


@router.post("/{document_id}/quiz")
def generate_quiz(
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

    quiz_data = AIService.generate_quiz(
        document.content
    )

    if not quiz_data:
        return {
            "error": "Quiz generation failed"
        }

    quiz = QuizService.save_quiz(
        db=db,
        document_id=document.id,
        quiz_data=quiz_data
    )

    return {
        "quiz_id": quiz.id,
        "document_id": document.id,
        "questions_count": len(
            quiz_data
        )
    }
@router.get("/")
def get_my_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            Document.owner_id == current_user.id
        )
        .order_by(Document.id.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "characters": len(doc.content or "")
        }
        for doc in documents
    ]

@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
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
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "name": document.filename,
        "type": document.filename.split('.')[-1].upper(),
        "date": document.created_at.strftime("%d/%m/%Y") if hasattr(document, 'created_at') else "N/A",
        "size": f"{len(document.content or '') / 1024:.1f} MB" if document.content else "0 MB"
    }
@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    documents = (
        db.query(Document)
        .filter(
            Document.owner_id == current_user.id
        )
        .order_by(Document.id.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "characters": len(doc.content or "")
        }
        for doc in documents
    ]