"""
CareerPilot AI - Personalized Career Learning Roadmap Router
Provides authenticated endpoints for:
- Generating adaptive weekly roadmaps based on resume analysis & mock interview weaknesses
- Fetching active roadmap and milestone progress
- Updating completion status for individual skills
- Uploading/comparing an updated CV with score diff and automatic gap closure
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user, AuthenticatedUser
from app.schemas.roadmap import (
    GenerateRoadmapRequest,
    UpdateSkillProgressRequest,
    CompareResumeRequest,
    RoadmapResponse,
    ScoreComparisonResponse
)
from app.services.roadmap_service import roadmap_service
from app.services.supabase_service import supabase_service
from app.parsers.extractor import parse_resume_content

router = APIRouter(prefix="/api/roadmaps", tags=["Learning Roadmap"])

@router.post("/generate", response_model=Dict[str, Any])
async def generate_learning_roadmap(
    payload: GenerateRoadmapRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Synthesizes an adaptive learning roadmap organized into weekly milestones
    (4, 8, or 12 weeks) tailored to missing skills from the student's latest
    resume analysis and weak topics from their mock interview.
    """
    # 1. Fetch latest resume analysis if available
    user_analyses = await supabase_service.get_user_analyses(user.id, user.jwt_token)
    latest_analysis = user_analyses[0] if user_analyses else None

    # 2. Fetch mock interview weak topics if available
    interview_sessions = await supabase_service.get_user_analyses(user.id, user.jwt_token)
    from app.services.interview_service import _LOCAL_INTERVIEW_SESSIONS_DB
    user_interviews = [
        s for s in _LOCAL_INTERVIEW_SESSIONS_DB.values()
        if s.get("user_id") == user.id and s.get("status") == "completed"
    ]
    weak_topics = []
    if user_interviews and user_interviews[0].get("report"):
        weak_topics = user_interviews[0]["report"].get("topics_to_revise", [])

    roadmap = await roadmap_service.generate_adaptive_roadmap(
        user_id=user.id,
        job_role=payload.job_role or "Full Stack Developer",
        duration_weeks=payload.duration_weeks or 8,
        user_jwt=user.jwt_token,
        resume_analysis=latest_analysis,
        interview_weaknesses=weak_topics
    )

    return roadmap

@router.get("/current", response_model=Dict[str, Any])
async def get_current_roadmap(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves the student's active roadmap. If none exists, creates a default one.
    """
    roadmap = await roadmap_service.get_user_roadmap(user.id, user.jwt_token)
    if not roadmap:
        # Auto-generate baseline roadmap
        roadmap = await roadmap_service.generate_adaptive_roadmap(
            user_id=user.id,
            job_role="Full Stack Developer",
            duration_weeks=8,
            user_jwt=user.jwt_token
        )
    return roadmap

@router.put("/progress", response_model=Dict[str, Any])
@router.post("/progress", response_model=Dict[str, Any])
async def update_skill_progress(
    payload: UpdateSkillProgressRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Updates the status (not_started, in_progress, completed) of a specific skill.
    Recalculates milestone completion and overall roadmap progress.
    """
    try:
        updated_roadmap = await roadmap_service.update_skill_progress(
            user_id=user.id,
            skill_canonical=payload.skill_canonical,
            new_status=payload.resolved_status,
            user_jwt=user.jwt_token
        )
        return updated_roadmap
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

@router.post("/compare-cv", response_model=Dict[str, Any])
async def compare_updated_cv(
    payload: CompareResumeRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Analyzes an updated CV and compares its match score with the previous analysis.
    Identifies newly closed skill gaps and automatically updates roadmap milestones.
    """
    # 1. Fetch previous analysis
    user_analyses = await supabase_service.get_user_analyses(user.id, user.jwt_token)
    if not user_analyses:
        prev_analysis = {
            "match_score": 75,
            "target_role": payload.job_role or "Full Stack Developer",
            "matched_skills": [{"name": "JavaScript"}, {"name": "React"}]
        }
    else:
        prev_analysis = user_analyses[0]

    # 2. Retrieve or build new resume record
    new_resume = None
    resume_id = payload.resolved_resume_id
    resume_text = payload.resolved_resume_text

    if resume_id:
        new_resume = await supabase_service.get_resume_by_id(
            resume_id, user.id, user.jwt_token
        )

    if not new_resume:
        if resume_text and resume_text.strip():
            parsed_entities = parse_resume_content(resume_text)
            new_resume = {
                "id": "revised-cv-" + str(int(user.id[-4:] if user.id[-4:].isdigit() else 101)),
                "user_id": user.id,
                "file_name": "Updated_CV_Revision.pdf",
                "extracted_text": resume_text,
                "parsed_data": parsed_entities.model_dump()
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide new_resume_id or new_resume_text for the updated CV."
            )

    comparison = await roadmap_service.compare_revised_resume(
        user_id=user.id,
        user_jwt=user.jwt_token,
        previous_analysis=prev_analysis,
        new_resume_record=new_resume
    )

    return comparison

