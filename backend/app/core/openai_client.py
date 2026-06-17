from openai import OpenAI
import os

# Récupérer la clé API depuis les variables d'environnement
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")  # ou directement la clé en dur (pas recommandé)
)