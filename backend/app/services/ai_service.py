from ollama import chat


class AIService:

    @staticmethod
    def generate_summary(text: str):

        response = chat(
            model="llama3",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an academic assistant."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"Summarize this document:\n\n{text[:10000]}"
                    )
                }
            ]
        )

        return response["message"]["content"]