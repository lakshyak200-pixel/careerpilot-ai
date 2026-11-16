"""
CareerPilot AI - Trained Model V2 & V4.1 Integration Router
Exposes:
- GET /api/roles: List supported career roles
- POST /api/analyze-resume: End-to-end analysis using trained Model V2 and Model V4.1
"""

import os
import sys
import uuid
import tempfile
import pathlib
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Header
from starlette.concurrency import run_in_threadpool

# Ensure CareerPilot_AI_Final is importable
AI_FINAL_DIR = pathlib.Path(__file__).resolve().parent.parent.parent / "CareerPilot_AI_Final"
if str(AI_FINAL_DIR) not in sys.path:
    sys.path.insert(0, str(AI_FINAL_DIR))

# Ensure V2 engine directory is importable
V2_DIR = AI_FINAL_DIR / "models" / "resume_v2"
if str(V2_DIR) not in sys.path:
    sys.path.insert(0, str(V2_DIR))

# Remove invalid CURL_CA_BUNDLE if present
if "CURL_CA_BUNDLE" in os.environ and not os.path.exists(os.environ["CURL_CA_BUNDLE"]):
    del os.environ["CURL_CA_BUNDLE"]

import careerpilot_engine
from app.schemas.resume import ExtractedResumeData, EducationEntry, ExperienceEntry, ProjectEntry
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api", tags=["Trained AI Models"])

SUPPORTED_ROLES = [
    "Software Engineer",
    "Data Scientist",
    "Data Analyst",
    "ML Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Java Developer",
    "Full Stack Developer"
]

@router.get("/roles", response_model=List[str])
async def get_supported_roles():
    """
    Returns the 8 supported career roles for the trained AI models.
    """
    return SUPPORTED_ROLES

def _map_student_info_to_schema(student_info: Dict[str, Any]) -> ExtractedResumeData:
    """Helper to convert Model V2 student_information into standard ExtractedResumeData."""
    # Education
    education_entries = []
    edu_raw = student_info.get("education", [])
    college_candidates = student_info.get("college_candidates", [])
    
    inst = college_candidates[0] if college_candidates else "University / College"
    if isinstance(edu_raw, list):
        for line in edu_raw:
            education_entries.append(
                EducationEntry(
                    institution=inst,
                    degree=line[:80],
                    field_of_study="Computer Science / Engineering",
                    year="",
                    gpa=student_info.get("cgpa")
                )
            )
    if not education_entries:
        education_entries.append(
            EducationEntry(
                institution=inst,
                degree="Bachelor's Degree",
                field_of_study="Computer Science / Engineering",
                year="",
                gpa=student_info.get("cgpa")
            )
        )

    # Projects
    projects_entries = []
    proj_raw = student_info.get("projects", [])
    proj_names = student_info.get("project_name_candidates", [])
    if isinstance(proj_raw, list):
        for p in proj_raw:
            clean_p = p.lstrip("-•* \t")
            title = proj_names[0] if proj_names else clean_p[:40]
            projects_entries.append(
                ProjectEntry(
                    title=title,
                    technologies=[],
                    description=clean_p
                )
            )

    # Experience
    internships = []
    work_exp = []
    exp_raw = student_info.get("experience", [])
    if isinstance(exp_raw, list):
        for e in exp_raw:
            clean_e = e.lstrip("-•* \t")
            is_intern = any(k in clean_e.lower() for k in ["intern", "trainee", "academic project"])
            entry = ExperienceEntry(
                role=clean_e[:60],
                organization="Technology Organization",
                duration="",
                description=clean_e,
                is_internship=is_intern
            )
            if is_intern:
                internships.append(entry)
            else:
                work_exp.append(entry)

    # Summary
    summary_raw = student_info.get("summary", [])
    summary_str = " ".join(summary_raw) if isinstance(summary_raw, list) else str(summary_raw or "")

    return ExtractedResumeData(
        full_name=student_info.get("name"),
        email=student_info.get("email"),
        phone=student_info.get("phone"),
        education=education_entries,
        technical_skills=student_info.get("skills", []),
        soft_skills=[],
        certifications=student_info.get("certifications", []),
        projects=projects_entries,
        internship_experience=internships,
        work_experience=work_exp,
        summary=summary_str or None,
        is_scanned_pdf=False,
        warning=None
    )

@router.post("/analyze-resume")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: str = Form("Full Stack Developer"),
    learning_time: str = Form("2 hours per day"),
    career_goal: str = Form("Get an entry-level job"),
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None),
    x_user_email: Optional[str] = Header(None),
    x_user_name: Optional[str] = Header(None)
):
    """
    Accepts multipart/form-data:
    - file: PDF resume
    - target_role: selected career role
    - learning_time: student's available daily learning time
    - career_goal: student's career objective

    Executes:
    1. Validates PDF format and size.
    2. Runs trained Model V2 (spaCy NER) & Model V4.1 (Qwen fine-tuned LoRA).
    3. Saves generated career report to Supabase if credentials available.
    4. Returns structured career report with AI recommendations.
    """
    # 1. Validation
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF documents are supported for AI resume analysis. Please upload a .pdf file."
        )

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please select a valid resume PDF."
        )

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10 MB limit."
        )

    # Match target role to supported catalog (fuzzy match case-insensitively)
    matched_role = None
    for r in SUPPORTED_ROLES:
        if r.lower() == target_role.strip().lower():
            matched_role = r
            break
        elif r.lower().replace(" ", "-") == target_role.strip().lower().replace(" ", "-"):
            matched_role = r
            break
        elif r.lower().replace(" ", "") == target_role.strip().lower().replace(" ", ""):
            matched_role = r
            break
    
    if not matched_role:
        matched_role = target_role if target_role in careerpilot_engine.resume_engine.job_roles else "Software Engineer"

    # 2. Save temporary PDF
    temp_pdf_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(file_bytes)
            temp_pdf_path = tmp.name

        # 3. Run complete AI analysis using trained models in threadpool (non-blocking)
        result = await run_in_threadpool(
            careerpilot_engine.analyze_resume,
            pdf_path=temp_pdf_path,
            target_role=matched_role,
            learning_time=learning_time or "2 hours per day",
            career_goal=career_goal or "Get an entry-level job"
        )

        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("error", "Failed to analyze resume.")
            )

        # 4. Map student info to ExtractedResumeData schema
        extracted_schema = _map_student_info_to_schema(result.get("student_information", {}))
        result["extracted_resume_data"] = extracted_schema.model_dump()
        result["id"] = str(uuid.uuid4())
        result["file_name"] = file.filename

        # 5. Persist to Supabase if user credentials provided
        jwt_token = None
        if authorization and authorization.startswith("Bearer "):
            jwt_token = authorization.split("Bearer ")[1].strip()

        user_id = x_user_id or (jwt_token if jwt_token and not jwt_token.startswith("demo-") else "demo-user")

        try:
            if user_id:
                await supabase_service.insert_resume_analysis(
                    user_id=user_id,
                    resume_id=None,
                    analysis_data=result,
                    user_jwt=jwt_token
                )
        except Exception:
            pass

        return result

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI model inference error: {str(exc)}"
        )
    finally:
        # 6. Delete temporary PDF
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except Exception:
                pass
