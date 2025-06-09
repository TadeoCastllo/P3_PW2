from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, questions, results, examenes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["Auth"])
app.include_router(questions.router, tags=["Questions"])
app.include_router(results.router, tags=["Results"])
app.include_router(examenes.router)

@app.get("/")
def root():
    return {"message": "API funcionando correctamente 🚀"}
