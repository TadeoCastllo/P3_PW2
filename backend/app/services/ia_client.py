import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def generar_respuesta_con_ia(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # o "gpt-4" si tienes acceso
        messages=[
            {"role": "system", "content": "Eres un asistente experto en programación y evaluación educativa."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        stream=False
    )
    return response.choices[0].message.content
