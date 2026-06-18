import json
import re
import ollama

from app.models.quiz import Quiz
from app.models.question import Question
from sqlalchemy.orm import Session


class AIService:

    @staticmethod
    def generate_quiz(text: str, document_id: int, db: Session):

        prompt = f"""
You are a strict JSON generator.

Generate EXACTLY 20 multiple-choice questions.

RULES:
- 7 easy
- 7 medium
- 6 hard
- 4 choices each
- only one correct answer

Return ONLY JSON array:

[
  {{
    "difficulty": "easy|medium|hard",
    "question": "...",
    "choices": ["A","B","C","D"],
    "answer": "correct choice"
  }}
]

TEXT:
{text[:12000]}
"""

        response = ollama.chat(
            model="llama3",
            messages=[{"role": "user", "content": prompt}]
        )

        content = response["message"]["content"]

        # extraction JSON
        match = re.search(r"\[\s*\{.*\}\s*\]", content, re.DOTALL)

        if not match:
            return None

        try:
            quiz_data = json.loads(match.group())
        except json.JSONDecodeError:
            return None

        #  validation basique
        if not isinstance(quiz_data, list):
            return None

        # =========================
        #  SAUVEGARDE DB
        # =========================

        # 1. créer Quiz
        quiz = Quiz(
            document_id=document_id,
            title="AI Generated Quiz"
        )

        db.add(quiz)
        db.flush()  # pour obtenir quiz.id

        # 2. créer Questions
        for q in quiz_data:

            if len(q.get("choices", [])) != 4:
                continue

            question = Question(
                quiz_id=quiz.id,
                difficulty=q.get("difficulty"),
                question=q.get("question"),
                choices=q.get("choices"),
                answer=q.get("answer")
            )

            db.add(question)

        db.commit()
        db.refresh(quiz)

        return quiz