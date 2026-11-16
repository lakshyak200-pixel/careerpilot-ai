from typing import Optional, List, Any
from pydantic import BaseModel, Field

class EducationEntry(BaseModel):
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    year: str = ""
    gpa: Optional[str] = None

class ExperienceEntry(BaseModel):
    role: str = ""
    organization: str = ""
    duration: str = ""
    description: str = ""
    is_internship: bool = False

class ProjectEntry(BaseModel):
    title: str = ""
    technologies: List[str] = Field(default_factory=list)
    description: str = ""

class ExtractedResumeData(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: List[EducationEntry] = Field(default_factory=list)
    technical_skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    internship_experience: List[ExperienceEntry] = Field(default_factory=list)
    work_experience: List[ExperienceEntry] = Field(default_factory=list)
    summary: Optional[str] = None
    is_scanned_pdf: bool = False
    warning: Optional[str] = None

class ResumeResponse(BaseModel):
    id: str
    user_id: str
    file_name: str
    file_path: str
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    processing_status: str
    extracted_text: Optional[str] = None
    parsed_data: Optional[ExtractedResumeData] = None
    created_at: str
    download_url: Optional[str] = None

class ResumeUpdateRequest(BaseModel):
    parsed_data: ExtractedResumeData

class SignedUrlResponse(BaseModel):
    file_path: str
    signed_url: str
    expires_in_seconds: int = 3600
