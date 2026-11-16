import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resumes, analysis, interviews, roadmaps, ai_engine
from app.config import settings

app = FastAPI(
    title="CareerPilot AI - Resume Processing Service",
    description=(
        "Production-ready FastAPI service for secure CV uploads, PyMuPDF & python-docx text extraction, "
        "NLP-based structured entity extraction, Supabase private Storage management, and PostgreSQL persistence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Cross-Origin Resource Sharing (CORS)
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(resumes.router)
app.include_router(analysis.router)
app.include_router(interviews.router)
app.include_router(roadmaps.router)
app.include_router(ai_engine.router)

# Custom Error Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

@app.get("/")
def read_root():
    return {
        "service": "CareerPilot AI Resume Processing Service",
        "status": "operational",
        "docs_url": "/docs",
        "endpoints": {
            "upload_resume": "POST /api/resumes/upload",
            "list_resumes": "GET /api/resumes",
            "get_resume": "GET /api/resumes/{resume_id}",
            "update_resume": "PUT /api/resumes/{resume_id}",
            "delete_resume": "DELETE /api/resumes/{resume_id}",
            "signed_url": "GET /api/resumes/{resume_id}/signed-url"
        }
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "careerpilot-ai-backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
