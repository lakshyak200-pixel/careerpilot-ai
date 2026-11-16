"""
CareerPilot AI - Resume Analysis & Skill Gap Detection Router
Exposes endpoints for:
- POST /api/resumes/analyze: Deep NLP skill gap audit against curated roles or custom JDs
- GET /api/resumes/analyses: History of audit reports
- GET /api/job-roles: Curated entry-level roles catalog
- GET /api/job-roles/{role_slug}: Role benchmark details
- PUT /api/job-roles/{role_slug}: Configurable/editable role skills and weights
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user, AuthenticatedUser
from app.schemas.analysis import (
    AnalyzeResumeRequest,
    AnalysisResponse,
    JobRoleUpdate,
)
from app.services.analysis_engine import analysis_engine
from app.services.job_roles_catalog import (
    get_all_roles,
    get_role_by_slug,
    update_role_config,
)
from app.services.supabase_service import supabase_service
from app.parsers.extractor import parse_resume_content

router = APIRouter(prefix="/api", tags=["Resume Analysis & Skill Gap"])

@router.get("/job-roles", response_model=List[Dict[str, Any]])
async def list_job_roles():
    """
    Returns curated entry-level tech roles with required skills,
    preferred skills, skill categories, and importance weights.
    """
    return get_all_roles()

@router.get("/job-roles/{role_slug}")
async def get_job_role_detail(role_slug: str):
    """
    Retrieves detailed skill definitions and importance weights for a specific role.
    """
    role = get_role_by_slug(role_slug)
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role '{role_slug}' not found in curated catalog."
        )
    return role

@router.put("/job-roles/{role_slug}")
async def update_job_role_benchmark(
    role_slug: str,
    payload: JobRoleUpdate,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Allows editing and re-configuring role requirements, skills, and weights.
    """
    updated = update_role_config(role_slug, payload.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job role '{role_slug}' not found."
        )
    return updated

@router.post("/resumes/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    payload: AnalyzeResumeRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Executes the 9-step explainable skill gap detection pipeline:
    - Normalizes skills and aliases
    - Evaluates exact & verified equivalent matches with resume evidence
    - Modular Sentence Transformer / NLP contextual suggestions
    - Detects missing required & preferred skills
    - Calculates transparent weighted match score
    - Persists analysis audit in Supabase PostgreSQL
    """
    resume_record = None

    # Option A: Analyze by existing resume ID
    if payload.resume_id:
        resume_record = await supabase_service.get_resume_by_id(
            payload.resume_id, user.id, user.jwt_token
        )
        if not resume_record:
            # Check if demo or local resume exists in cache
            all_user_resumes = await supabase_service.get_user_resumes(user.id, user.jwt_token)
            for r in all_user_resumes:
                if str(r.get("id")) == str(payload.resume_id):
                    resume_record = r
                    break

    # Option B: Analyze ad-hoc by raw text
    if not resume_record:
        if payload.resume_text and payload.resume_text.strip():
            parsed_entities = parse_resume_content(payload.resume_text)
            resume_record = {
                "id": payload.resume_id or "adhoc-resume",
                "user_id": user.id,
                "file_name": "Pasted_Resume_Text.txt",
                "extracted_text": payload.resume_text,
                "parsed_data": parsed_entities.model_dump()
            }
        else:
            # Fallback to candidate's most recent uploaded resume
            user_resumes = await supabase_service.get_user_resumes(user.id, user.jwt_token)
            if user_resumes:
                resume_record = user_resumes[0]
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please provide a valid resume_id or resume_text to perform analysis."
                )

    # Execute analysis engine
    analysis_result = analysis_engine.run_analysis(
        resume_record=resume_record,
        target_role_name_or_slug=payload.resolved_target_role,
        custom_job_description=payload.custom_job_description,
        weights_override=payload.weights_override
    )

    # Store analysis result in Supabase
    await supabase_service.insert_resume_analysis(
        user_id=user.id,
        resume_id=resume_record.get("id"),
        analysis_data=analysis_result,
        user_jwt=user.jwt_token
    )

    # Log audit activity
    await supabase_service.log_activity(
        user_id=user.id,
        activity_type="RESUME_ANALYZED",
        metadata={
            "analysis_id": analysis_result["id"],
            "target_role": analysis_result["target_role"],
            "match_score": analysis_result["match_score"]
        },
        user_jwt=user.jwt_token
    )

    return analysis_result

@router.get("/resumes/analyses")
async def list_user_analyses(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves previous skill gap audit reports for the authenticated student.
    """
    return await supabase_service.get_user_analyses(user.id, user.jwt_token)

