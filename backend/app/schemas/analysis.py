"""
CareerPilot AI - Pydantic Schemas for Resume Analysis & Skill Gap Engine
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AnalyzeResumeRequest(BaseModel):
    resume_id: Optional[str] = Field(None, description="UUID of existing uploaded resume record")
    resume_text: Optional[str] = Field(None, description="Direct text of resume if analyzing ad-hoc")
    target_role: Optional[str] = Field("software-developer", description="Slug or title of target role")
    target_role_slug: Optional[str] = Field(None, description="Alias for target_role")
    custom_job_description: Optional[str] = Field(None, description="Custom pasted recruiter job description")
    weights_override: Optional[Dict[str, float]] = Field(None, description="Custom weight overrides")

    @property
    def resolved_target_role(self) -> str:
        return self.target_role_slug or self.target_role or "software-developer"

class MatchedSkill(BaseModel):
    name: str
    canonical: str
    category: str
    importance: str
    weight: float
    match_type: str
    matched_candidate_term: str
    confidence: float
    evidence: str
    is_required: bool

class MissingSkill(BaseModel):
    name: str
    canonical: str
    category: str
    importance: str
    weight: float
    is_required: bool
    action_tip: str

class StrengthItem(BaseModel):
    title: str
    description: str
    impact: str = "High"

class ImprovementItem(BaseModel):
    title: str
    description: str
    priority: str = "High"

class ContextualSuggestion(BaseModel):
    skill: str
    category: str
    importance: str
    confidence_score: float
    contextual_rationale: str
    action_item: str

class ScoringBreakdown(BaseModel):
    overall_match_score: int
    required_skills_score: float
    preferred_skills_score: float
    weights_applied: Dict[str, float]
    points_earned: Dict[str, float]
    formula_explanation: str

class AnalysisResponse(BaseModel):
    id: str
    resume_id: Optional[str] = None
    target_role: str
    match_score: int
    matched_skills: List[MatchedSkill]
    missing_required_skills: List[MissingSkill]
    missing_preferred_skills: List[MissingSkill]
    strengths: List[StrengthItem]
    improvement_suggestions: List[ImprovementItem]
    evidence_from_resume: Dict[str, str]
    scoring_breakdown: ScoringBreakdown
    contextual_suggestions: List[ContextualSuggestion]
    next_steps: List[str]
    disclaimer: str
    created_at: str
    nlp_model_used: Optional[str] = None

class JobRoleUpdate(BaseModel):
    description: Optional[str] = None
    required_skills: Optional[List[Dict[str, Any]]] = None
    preferred_skills: Optional[List[Dict[str, Any]]] = None
    scoring_weights: Optional[Dict[str, float]] = None

