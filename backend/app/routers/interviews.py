"""
CareerPilot AI - AI Mock Interview Router
Provides authenticated endpoints for:
- Starting personalized interview sessions
- Submitting answers & receiving rubric evaluation
- Fetching next sequential questions
- Completing interviews and generating comprehensive audit reports
- Accessing interview history
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.auth import get_current_user, AuthenticatedUser
from app.schemas.interview import (
    StartInterviewRequest,
    SubmitAnswerRequest,
    QuestionResponse,
    AnswerEvaluationResponse,
    InterviewReportResponse,
    InterviewSessionListItem
)
from app.services.interview_service import interview_service
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/interviews", tags=["AI Mock Interview"])

@router.post("/start", response_model=Dict[str, Any])
async def start_interview_session(
    payload: StartInterviewRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Initializes a new mock interview session tailored to the student's
    resume projects, skills, and detected skill gaps.
    Returns session metadata and the first question (withholding expected answer).
    """
    # 1. Retrieve user's resume record
    resume_record = None
    if payload.resume_id:
        resume_record = await supabase_service.get_resume_by_id(
            payload.resume_id, user.id, user.jwt_token
        )
    if not resume_record:
        all_resumes = await supabase_service.get_user_resumes(user.id, user.jwt_token)
        if all_resumes:
            resume_record = all_resumes[0]

    # 2. Retrieve user's latest resume analysis if available (for skill gap questions)
    resume_analysis = None
    user_analyses = await supabase_service.get_user_analyses(user.id, user.jwt_token)
    if user_analyses:
        resume_analysis = user_analyses[0]

    # 3. Create interview session and pre-generate customized questions
    session_record = await interview_service.create_session(
        user_id=user.id,
        job_role=payload.job_role,
        interview_type=payload.interview_type,
        difficulty=payload.difficulty,
        question_count=payload.question_count,
        user_jwt=user.jwt_token,
        resume_record=resume_record,
        resume_analysis=resume_analysis
    )

    # 4. Fetch the first question
    questions = await interview_service.get_questions_for_session(session_record["id"])
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate interview questions."
        )

    first_q = questions[0]
    return {
        "session_id": session_record["id"],
        "job_role": session_record["job_role"],
        "interview_type": session_record["interview_type"],
        "difficulty": session_record["difficulty"],
        "total_questions": len(questions),
        "first_question": {
            "session_id": session_record["id"],
            "question_id": first_q["id"],
            "question_text": first_q["question_text"],
            "question_type": first_q["question_type"],
            "question_number": 1,
            "total_questions": len(questions),
            "difficulty": session_record["difficulty"],
            "category": first_q.get("category", "General"),
            "key_competencies": first_q.get("key_competencies", [])
        }
    }

@router.get("/{session_id}/next-question", response_model=Dict[str, Any])
async def get_next_question(
    session_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves the next unanswered question for the active session.
    """
    session = await interview_service.get_session(session_id)
    if not session or session.get("user_id") != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found or unauthorized."
        )

    questions = await interview_service.get_questions_for_session(session_id)
    from app.services.interview_service import _LOCAL_INTERVIEW_ANSWERS_DB
    answered_ids = {a["question_id"] for a in _LOCAL_INTERVIEW_ANSWERS_DB.get(session_id, [])}

    for idx, q in enumerate(questions):
        if q["id"] not in answered_ids:
            return {
                "has_next": True,
                "question": {
                    "session_id": session_id,
                    "question_id": q["id"],
                    "question_text": q["question_text"],
                    "question_type": q["question_type"],
                    "question_number": idx + 1,
                    "total_questions": len(questions),
                    "difficulty": session.get("difficulty", "Intermediate"),
                    "category": q.get("category", "General"),
                    "key_competencies": q.get("key_competencies", [])
                }
            }

    return {
        "has_next": False,
        "message": "All questions in this session have been answered. You can now view the final report."
    }

@router.post("/{session_id}/answer", response_model=AnswerEvaluationResponse)
@router.post("/{session_id}/answers", response_model=AnswerEvaluationResponse)
async def submit_question_answer(
    session_id: str,
    payload: SubmitAnswerRequest,
    question_id: Optional[str] = Query(None, description="UUID of the question being answered"),
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Submits student's text answer, runs rubric evaluation, and returns scoring breakdown.
    Reveals model improved answer only AFTER answer is evaluated and saved.
    """
    session = await interview_service.get_session(session_id)
    if not session or session.get("user_id") != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )

    resolved_qid = question_id or payload.question_id
    if not resolved_qid and session.get("questions"):
        # Fallback to the current pending question
        resolved_qid = session["questions"][-1].get("question_id")

    if not resolved_qid:
        resolved_qid = "q-current"

    try:
        evaluation_result = await interview_service.record_answer(
            session_id=session_id,
            question_id=resolved_qid,
            user_answer=payload.answer_text,
            user_id=user.id,
            user_jwt=user.jwt_token,
            time_spent_seconds=payload.resolved_duration
        )
        return evaluation_result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

@router.post("/{session_id}/complete", response_model=InterviewReportResponse)
async def complete_interview_session(
    session_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Concludes the interview, compiles question-by-question scoring,
    and returns the comprehensive final report.
    """
    session = await interview_service.get_session(session_id)
    if not session or session.get("user_id") != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )

    try:
        report = await interview_service.generate_final_report(
            session_id=session_id,
            user_id=user.id,
            user_jwt=user.jwt_token
        )
        return report
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

@router.get("/{session_id}/report", response_model=InterviewReportResponse)
async def get_interview_report(
    session_id: str,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves the report of a completed interview session.
    """
    session = await interview_service.get_session(session_id)
    if not session or session.get("user_id") != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )

    if session.get("report"):
        return session["report"]

    return await interview_service.generate_final_report(
        session_id=session_id,
        user_id=user.id,
        user_jwt=user.jwt_token
    )

@router.get("", response_model=List[InterviewSessionListItem])
async def list_interview_history(
    user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieves previous interview sessions for the authenticated user.
    """
    return await interview_service.list_user_sessions(user.id, user.jwt_token)

