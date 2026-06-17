from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Depends

from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.document import Document

from app.services.document_service import (
    DocumentService
)

from app.core.dependencies import (
    get_current_user
)

router = APIRouter()


@router.post("/upload")
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    )
):

    filepath = (
        DocumentService.save_file(
            file
        )
    )

    document = Document(
        filename=file.filename,
        filepath=filepath,
        owner_id=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "id": document.id,
        "filename": document.filename
    }