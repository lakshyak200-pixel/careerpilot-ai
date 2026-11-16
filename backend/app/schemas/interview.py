"""
CareerPilot AI - Pydantic Schemas for AI Mock Interview Module
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class StartInterviewRequest(BaseModel):
    job_role: str = Field("Full Stack Developer", description="Target job role")
    interview_type: str = Field("Mixed", description="Technical, HR, Behavioral, Resume-Based, or Mixed")
    difficulty: str = Field("Intermediate", description="Beginner, Intermediate, or Advanced")
    question_count: int = Field(5, description="Number of questions: 5, 10, or 15")
    resume_id: Optional[str] = Field(None, description="Optional resume ID for tailored question generation")

class SubmitAnswerRequest(BaseModel):
    answer_text: str = Field(..., min_length=1, description="Student's text answer")
    question_id: Optional[str] = Field(None, description="UUID of the question being answered")
    duration_seconds: Optional[int] = Field(None, description="Time spent typing/recording the answer")
    time_spent_seconds: Optional[int] = Field(0, description="Time spent typing/recording the answer")

    @property
    def resolved_duration(self) -> int:
        return self.duration_seconds or self.time_spent_seconds or 0

class QuestionResponse(BaseModel):
    session_id: str
    question_id: str
    question_text: str
    question_type: str
    question_number: int
    total_questions: int
    difficulty: str
    category: str
    key_competencies: List[str] = Field(default_factory=list)
    # Note: expected_answer is intentionally EXCLUDED before submission to ensure interview integrity

class AnswerEvaluationResponse(BaseModel):
    answer_id: str
    session_id: str
    question_id: str
    score: float = Field(..., description="Overall question score out of 10")
    technical_score: float = Field(..., description="Technical accuracy out of 10")
    clarity_score: float = Field(..., description="Communication clarity out of 10")
    relevance_score: float = Field(..., description="Direct relevance out of 10")
    completeness_score: float = Field(..., description="Completeness out of 10")
    feedback: str
    strengths: str
    areas_for_improvement: str
    suggested_improved_answer: str
    follow_up_question: Optional[str] = None
    is_last_question: bool = False
    next_question_number: Optional[int] = None

class QuestionFeedbackItem(BaseModel):
    question_id: str
    question_order: int
    question_text: str
    question_type: str
    user_answer: str
    score: float
    feedback: str
    strengths: str
    areas_for_improvement: str
    suggested_improved_answer: str

class InterviewReportResponse(BaseModel):
    session_id: str
    job_role: str
    interview_type: str
    difficulty: str
    overall_score: float = Field(..., description="Overall score out of 100")
    technical_knowledge_score: float = Field(..., description="Technical knowledge score out of 100")
    communication_clarity_score: float = Field(..., description="Communication clarity score out of 100")
    duration_seconds: int = 0
    total_questions: int = 0
    questions_feedback: List[QuestionFeedbackItem] = Field(default_factory=list)
    strong_answers: List[str] = Field(default_factory=list)
    weak_answers: List[str] = Field(default_factory=list)
    topics_to_revise: List[str] = Field(default_factory=list)
    recommended_next_interview: Dict[str, str] = Field(default_factory=dict)
    summary_feedback: str = ""
    created_at: str

class InterviewSessionListItem(BaseModel):
    id: str
    job_role: str
    interview_type: str
    difficulty: str
    overall_score: Optional[float] = None
    status: str
    duration_seconds: int = 0
    total_questions: int = 0
    created_at: str

