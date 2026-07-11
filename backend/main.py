import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
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

# No-cache middleware for development
class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if not request.url.path.startswith("/api/") and not request.url.path.startswith("/uploads/"):
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

app.add_middleware(NoCacheMiddleware)

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
def _no_cache_response(file_path, media_type):
    """Return file content with no-cache headers to prevent browser caching."""
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    )

def _get_media_type(path):
    if path.endswith(".html"): return "text/html; charset=utf-8"
    if path.endswith(".css"): return "text/css; charset=utf-8"
    if path.endswith(".js"): return "application/javascript; charset=utf-8"
    if path.endswith(".json"): return "application/json; charset=utf-8"
    return "application/octet-stream"

@app.get("/")
async def serve_frontend():
    return _no_cache_response(os.path.join(frontend_dir, "index.html"), "text/html; charset=utf-8")


@app.get("/{full_path:path}")
async def serve_frontend_routes(full_path: str):
    """Serve frontend for all routes (SPA routing)"""
    if full_path.startswith("api/") or full_path.startswith("uploads/"):
        return
    file_path = os.path.join(frontend_dir, full_path)
    if os.path.isfile(file_path):
        media_type = _get_media_type(file_path)
        if media_type == "application/octet-stream":
            return FileResponse(file_path)
        return _no_cache_response(file_path, media_type)
    return _no_cache_response(os.path.join(frontend_dir, "index.html"), "text/html; charset=utf-8")
