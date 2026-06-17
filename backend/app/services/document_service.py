import os
import shutil

from fastapi import UploadFile

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