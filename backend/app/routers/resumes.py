from typing import List, Dict, Any, Optional
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.auth import get_current_user, AuthenticatedUser
from app.parsers.pdf_parser import extract_text_from_pdf, is_scanned_pdf
from app.parsers.docx_parser import extract_text_from_docx
from app.parsers.extractor import extract_resume_data, parse_resume_content
from app.schemas.resume import (
    ResumeResponse,
    ResumeUpdateRequest,
    ExtractedResumeData,
    SignedUrlResponse
)
from app.services.supabase_service import SupabaseService, supabase_service
from app.config import settings

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])

# Maximum allowed size: 5 MB (5 * 1024 * 1024 = 5,242,880 bytes)
MAX_FILE_SIZE = settings.MAX_FILE_SIZE_BYTES

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Authenticated POST /api/resumes/upload endpoint.
    - Validates Supabase JWT and derives user ID.
    - Validates file type, file signature (magic bytes), and maximum file size of 5 MB.
    - Saves file in private user-specific Supabase Storage path: resumes/{user_id}/<timestamp>_<filename>.
    - Extracts PDF text using PyMuPDF or DOCX text using python-docx.
    - Uses NLP and structured extraction to identify:
      Full name, email, phone number, education, technical skills, soft skills,
      certifications, projects, internship experience and work experience.
    - Detects scanned or unreadable PDFs and returns an appropriate diagnostic message.
    - Saves extracted text and structured information in the PostgreSQL database.
    - Prevents unauthorized access to uploaded files.
    """
    filename = file.filename or "resume.pdf"
    if hasattr(file, "file") and hasattr(file.file, "read"):
        file_bytes = file.file.read()
    else:
        file_bytes = await file.read()
    file_size = len(file_bytes)

    # 1. Maximum file size validation (5 MB)
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of 5 MB (received {file_size / (1024*1024):.2f} MB)."
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please select a valid resume document."
        )

    # 2. File type and magic byte signature validation
    is_pdf = False
    is_docx = False
    mime_type = "application/octet-stream"

    if file_bytes.startswith(b"%PDF"):
        is_pdf = True
        mime_type = "application/pdf"
    elif file_bytes.startswith(b"PK\x03\x04") and (filename.lower().endswith(".docx") or "officedocument" in (file.content_type or "")):
        is_docx = True
        mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file format or invalid file signature. Please upload a genuine PDF (.pdf) or Word document (.docx)."
        )

    # 3. Document text extraction
    raw_text = ""
    scanned_detected = False
    warning_msg = None

    try:
        if is_pdf:
            raw_text, scanned_detected, page_count = extract_text_from_pdf(file_bytes)
            if scanned_detected:
                warning_msg = (
                    "Scanned or image-only PDF detected. Little to no selectable digital text could be extracted. "
                    "For accurate skill analysis, please upload a digital PDF (exported from Word, Google Docs, or Canva) "
                    "or manually review and complete your details below."
                )
        elif is_docx:
            raw_text, element_count = extract_text_from_docx(file_bytes)
            if len(raw_text.strip()) < 30:
                warning_msg = "Very little text could be extracted from this Word document. Please review your details."
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract document contents: {str(e)}"
        )

    # 4. Structured Information Extraction (NLP & lexicon matching)
    parsed_model = parse_resume_content(raw_text, is_scanned=scanned_detected)
    parsed_dict = parsed_model.model_dump()
    if warning_msg:
        parsed_dict["warning"] = warning_msg

    # 5. Save file in private user-specific Supabase Storage path
    storage_path = await supabase_service.upload_file_to_storage(
        user_id=current_user.id,
        file_name=filename,
        file_bytes=file_bytes,
        mime_type=mime_type,
        user_jwt=current_user.jwt_token
    )

    # 6. Save extracted text and structured information in PostgreSQL
    record = await supabase_service.insert_resume_record(
        user_id=current_user.id,
        file_name=filename,
        file_path=storage_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        extracted_text=raw_text,
        parsed_data=parsed_dict,
        user_jwt=current_user.jwt_token
    )

    # 7. Generate secure signed download URL for private owner access
    download_url = await supabase_service.create_signed_download_url(
        file_path=storage_path,
        user_jwt=current_user.jwt_token
    )

    # 8. Audit activity log
    await supabase_service.log_activity(
        user_id=current_user.id,
        activity_type="RESUME_UPLOADED",
        metadata={
            "file_name": filename,
            "file_size": file_size,
            "is_scanned": scanned_detected,
            "skills_found": len(parsed_dict.get("technical_skills", []))
        },
        user_jwt=current_user.jwt_token
    )

    return ResumeResponse(
        id=str(record.get("id")),
        user_id=current_user.id,
        file_name=filename,
        file_path=storage_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        processing_status=record.get("processing_status", "completed"),
        extracted_text=raw_text[:2500],
        parsed_data=ExtractedResumeData(**parsed_dict),
        created_at=record.get("created_at", ""),
        download_url=download_url
    )

@router.get("", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    List all resumes uploaded by the authenticated user.
    Enforces user isolation via user_id derived from JWT.
    """
    records = await supabase_service.get_user_resumes(
        user_id=current_user.id,
        user_jwt=current_user.jwt_token
    )
    result = []
    for r in records:
        parsed = r.get("parsed_data") or {}
        result.append(ResumeResponse(
            id=str(r.get("id")),
            user_id=current_user.id,
            file_name=r.get("file_name", ""),
            file_path=r.get("file_path", ""),
            file_size_bytes=r.get("file_size_bytes"),
            mime_type=r.get("mime_type"),
            processing_status=r.get("processing_status", "completed"),
            extracted_text=(r.get("extracted_text") or "")[:500],
            parsed_data=ExtractedResumeData(**parsed) if parsed else None,
            created_at=r.get("created_at", "")
        ))
    return result

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retrieve details and structured parsed information for a specific resume.
    Prevents unauthorized access by verifying ownership (user_id).
    """
    record = await supabase_service.get_resume_by_id(
        resume_id=resume_id,
        user_id=current_user.id,
        user_jwt=current_user.jwt_token
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or unauthorized access."
        )

    parsed = record.get("parsed_data") or {}
    download_url = await supabase_service.create_signed_download_url(
        file_path=record.get("file_path", ""),
        user_jwt=current_user.jwt_token
    )

    return ResumeResponse(
        id=str(record.get("id")),
        user_id=current_user.id,
        file_name=record.get("file_name", ""),
        file_path=record.get("file_path", ""),
        file_size_bytes=record.get("file_size_bytes"),
        mime_type=record.get("mime_type"),
        processing_status=record.get("processing_status", "completed"),
        extracted_text=(record.get("extracted_text") or "")[:2500],
        parsed_data=ExtractedResumeData(**parsed) if parsed else None,
        created_at=record.get("created_at", ""),
        download_url=download_url
    )

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    update_data: ResumeUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Allow users to review and correct incorrectly extracted skills or details.
    Persists corrected parsed information in PostgreSQL.
    """
    updated_record = await supabase_service.update_resume_parsed_data(
        resume_id=resume_id,
        user_id=current_user.id,
        parsed_data=update_data.parsed_data.model_dump(),
        user_jwt=current_user.jwt_token
    )
    if not updated_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or update unauthorized."
        )

    await supabase_service.log_activity(
        user_id=current_user.id,
        activity_type="RESUME_PARSED_DATA_EDITED",
        metadata={"resume_id": resume_id},
        user_jwt=current_user.jwt_token
    )

    parsed = updated_record.get("parsed_data") or {}
    return ResumeResponse(
        id=str(updated_record.get("id")),
        user_id=current_user.id,
        file_name=updated_record.get("file_name", ""),
        file_path=updated_record.get("file_path", ""),
        file_size_bytes=updated_record.get("file_size_bytes"),
        mime_type=updated_record.get("mime_type"),
        processing_status=updated_record.get("processing_status", "completed"),
        extracted_text=(updated_record.get("extracted_text") or "")[:2500],
        parsed_data=ExtractedResumeData(**parsed) if parsed else None,
        created_at=updated_record.get("created_at", "")
    )

@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
async def delete_resume(
    resume_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Delete a resume from Supabase Storage and PostgreSQL database.
    Prevents unauthorized deletion by enforcing ownership check.
    """
    deleted = await supabase_service.delete_resume(
        resume_id=resume_id,
        user_id=current_user.id,
        user_jwt=current_user.jwt_token
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or already deleted."
        )

    await supabase_service.log_activity(
        user_id=current_user.id,
        activity_type="RESUME_DELETED",
        metadata={"resume_id": resume_id},
        user_jwt=current_user.jwt_token
    )

    return {"success": True, "message": "Resume successfully deleted from storage and database."}

@router.get("/{resume_id}/signed-url", response_model=SignedUrlResponse)
async def get_signed_url(
    resume_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Generate a secure, time-limited signed URL to privately view or download
    the resume file. Prevents unauthorized access to private storage files.
    """
    record = await supabase_service.get_resume_by_id(
        resume_id=resume_id,
        user_id=current_user.id,
        user_jwt=current_user.jwt_token
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found or unauthorized access."
        )

    file_path = record.get("file_path", "")
    signed_url = await supabase_service.create_signed_download_url(
        file_path=file_path,
        user_jwt=current_user.jwt_token
    )

    return SignedUrlResponse(
        file_path=file_path,
        signed_url=signed_url,
        expires_in_seconds=3600
    )
