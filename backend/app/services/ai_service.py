from app.core.openai_client import client

class AIService:

    @staticmethod
    def generate_summary(text: str):
        # Vérifier si le texte est None ou vide
        if not text or not text.strip():
            return "No content available to summarize."
        
        # Tronquer le texte si nécessaire (limite de 12000 caractères)
        truncated_text = text[:12000] if len(text) > 12000 else text
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an academic assistant. "
                            "Provide a clear, concise summary of the document."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"Summarize this document:\n\n{truncated_text}"
                        ),
                    },
                ],
                temperature=0.3,
                max_tokens=500,
            )

            return (
                response
                .choices[0]
                .message
                .content
            )
        except Exception as e:
            return f"Error generating summary: {str(e)}"