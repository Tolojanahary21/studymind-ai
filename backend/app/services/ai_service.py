from ollama import chat
import json
import re


class AIService:

    @staticmethod
    def generate_summary(text: str):

        response = chat(
            model="llama3",
            messages=[
                {
                    "role": "system",
                    "content": "You are an academic assistant."
                },
                {
                    "role": "user",
                    "content": f"""
Summarize the following academic document.

Provide:
- Main concepts
- Important definitions
- Key points

Document:

{text[:10000]}
"""
                }
            ]
        )

        return response["message"]["content"]

    @staticmethod
    def generate_quiz(text: str):

        prompt = f"""
You are an academic teacher.

Generate EXACTLY 20 multiple-choice questions based on the document.

Difficulty distribution:
- 7 easy
- 7 medium
- 6 hard

Rules:
- Each question must have exactly 4 choices.
- Only one answer must be correct.
- Questions must be based on the document.
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No text before or after the JSON.

Expected format:

[
    {{
        "difficulty": "easy",
        "question": "What is Hibernate?",
        "choices": [
            "ORM Framework",
            "Database",
            "IDE",
            "Programming Language"
        ],
        "answer": "ORM Framework"
    }}
]

Document:

{text[:12000]}
"""

        response = chat(
            model="llama3",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = response["message"]["content"]

        # print("\n\n===== OLLAMA RESPONSE =====")
        # print(content)
        # print("===========================\n\n")

        try:

            match = re.search(
                r"\[.*\]",
                content,
                re.DOTALL
            )

            if not match:
                print("JSON array not found")
                return []

            quiz_json = match.group()

            quiz_data = json.loads(
                quiz_json
            )

            return quiz_data

        except Exception as e:

            print(
                f"Quiz parsing error: {e}"
            )

            return []