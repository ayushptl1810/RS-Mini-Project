from __future__ import annotations
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend (this folder) is on sys.path so imports like `routes.recommender` and `models.schemas` work
BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from routes.recommender import router as recommender_router

app = FastAPI(title="Recommender API")

# CORS - allow all for development; tighten in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommender_router, prefix="/api")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Recommender API - endpoints at /api"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
