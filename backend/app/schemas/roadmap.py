"""
CareerPilot AI - Pydantic Schemas for Personalized Learning Roadmap Module
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GenerateRoadmapRequest(BaseModel):
    job_role: Optional[str] = Field("Full Stack Developer", description="Target job role")
    duration_weeks: Optional[int] = Field(8, description="Roadmap timeline: 4, 8, or 12 weeks")
    force_regenerate: Optional[bool] = Field(False, description="Whether to recreate from scratch")

class UpdateSkillProgressRequest(BaseModel):
    roadmap_id: Optional[str] = Field(None, description="Optional roadmap ID")
    skill_canonical: str = Field(..., description="Canonical name of the skill")
    status: Optional[str] = Field(None, description="'not_started', 'in_progress', or 'completed'")
    new_status: Optional[str] = Field(None, description="Alias for status")

    @property
    def resolved_status(self) -> str:
        return self.status or self.new_status or "in_progress"

class CompareResumeRequest(BaseModel):
    new_resume_id: Optional[str] = Field(None, description="UUID of updated uploaded resume")
    resume_id: Optional[str] = Field(None, description="Alias for new_resume_id")
    new_resume_text: Optional[str] = Field(None, description="Direct text of updated resume")
    resume_text: Optional[str] = Field(None, description="Alias for new_resume_text")
    job_role: Optional[str] = Field(None, description="Target job role")

    @property
    def resolved_resume_id(self) -> Optional[str]:
        return self.new_resume_id or self.resume_id

    @property
    def resolved_resume_text(self) -> Optional[str]:
        return self.new_resume_text or self.resume_text

class SkillResource(BaseModel):
    title: str
    url: str
    type: str
    provider: str

class RoadmapSkill(BaseModel):
    skill_name: str
    canonical: str
    description: str
    why_important: str
    priority: str
    prerequisites: List[str] = Field(default_factory=list)
    estimated_hours: str
    resources: List[SkillResource] = Field(default_factory=list)
    practice_exercises: List[str] = Field(default_factory=list)
    mini_project: str
    status: str = "not_started"

class WeeklyMilestone(BaseModel):
    week_number: int
    title: str
    description: str
    skills: List[RoadmapSkill] = Field(default_factory=list)
    completion_percentage: int = 0
    status: str = "not_started"

class RoadmapResponse(BaseModel):
    id: str
    user_id: str
    job_role: str
    duration_weeks: int
    overall_completion_percentage: int
    total_skills_count: int
    completed_skills_count: int
    weekly_milestones: List[WeeklyMilestone] = Field(default_factory=list)
    created_at: str
    updated_at: str

class ScoreComparisonResponse(BaseModel):
    target_role: str
    previous_match_score: int
    new_match_score: int
    score_difference: int
    is_improved: bool
    closed_skill_gaps: List[str] = Field(default_factory=list)
    remaining_missing_skills: List[str] = Field(default_factory=list)
    summary_feedback: str
