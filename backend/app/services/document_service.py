import os
import shutil

from fastapi import UploadFile
from pypdf import PdfReader

UPLOAD_DIR = "uploads"


class DocumentService:

    @staticmethod
    def save_file(file: UploadFile):

        os.makedirs(
            UPLOAD_DIR,
            exist_ok=True
        )

        filepath = os.path.join(
            UPLOAD_DIR,
            file.filename
        )

        with open(
            filepath,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        return filepath

    @staticmethod
    def extract_text(filepath: str):

        reader = PdfReader(filepath)

        text = ""

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text