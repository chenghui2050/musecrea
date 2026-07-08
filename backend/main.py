import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings
from app.api import auth, upload, evaluation, report, billing, admin

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MuseCrea - Museum Cultural Creative Product Evaluation Platform",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
uploads_dir = settings.UPLOAD_DIR
os.makedirs(uploads_dir, exist_ok=True)
os.makedirs(os.path.join(uploads_dir, "images"), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# API Routes
app.include_router(auth.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}


# Serve frontend
@app.get("/")
async def serve_frontend():
    return FileResponse(os.path.join(frontend_dir, "index.html"))


@app.get("/{full_path:path}")
async def serve_frontend_routes(full_path: str):
    """Serve frontend for all routes (SPA routing)"""
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return
    file_path = os.path.join(frontend_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_dir, "index.html"))
