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
You are an expert university professor and assessment designer.

Your task is to create a high-quality multiple-choice quiz based ONLY on the provided document.

STRICT REQUIREMENTS:

1. Generate EXACTLY 20 questions.

2. Difficulty distribution:

   * 7 easy
   * 7 medium
   * 6 hard

3. Each question must:

   * Test understanding of the document.
   * Be factually correct.
   * Be unique.
   * Avoid repetition.
   * Avoid trivial wording.
   * Be clear and concise.

4. Easy questions:

   * Test basic concepts, definitions, terminology.
   * Answers should be directly supported by the document.

5. Medium questions:

   * Test understanding of relationships, processes, mechanisms, or comparisons.
   * Require comprehension rather than simple memorization.

6. Hard questions:

   * Test deeper reasoning, implications, analysis, or advanced concepts present in the document.
   * Require combining multiple pieces of information from the document.

7. Multiple choice rules:

   * Exactly 4 choices per question.
   * Exactly 1 correct answer.
   * Incorrect answers must be plausible.
   * Do NOT create obviously wrong distractors.
   * Do NOT use "All of the above".
   * Do NOT use "None of the above".

8. Answer quality:

   * The answer MUST exactly match one item in choices.
   * No duplicate choices.
   * No empty values.

9. Output format:

   * Return ONLY valid JSON.
   * No markdown.
   * No comments.
   * No explanation.
   * No text before or after JSON.

10. Return this exact structure:

[
{
"difficulty": "easy",
"question": "Question text",
"choices": [
"Choice A",
"Choice B",
"Choice C",
"Choice D"
],
"answer": "Choice A"
}
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