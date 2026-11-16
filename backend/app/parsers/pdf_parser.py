import io
from typing import Tuple

def is_scanned_pdf(text: str) -> bool:
    """
    Helper to detect scanned, image-based, or unreadable PDFs with minimal extracted text.
    Resumes typically contain hundreds of words; fewer than 60 characters indicates
    a scanned image or non-extractable layout.
    """
    cleaned = (text or "").strip()
    return len(cleaned) < 60

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool, int]:
    """
    Extracts raw text from PDF bytes using PyMuPDF (pymupdf / fitz).
    Validates PDF magic signature.
    Detects scanned or unreadable image-based PDFs.
    
    Returns:
        (extracted_text: str, is_scanned: bool, page_count: int)
    """
    # 1. Validate PDF magic signature (must start with %PDF)
    if not file_bytes.startswith(b"%PDF"):
        raise ValueError("Invalid PDF format. File signature does not match %PDF header.")

    text_parts = []
    page_count = 0
    total_images_found = 0

    # 2. Primary engine: PyMuPDF
    try:
        try:
            import pymupdf as fitz
        except ImportError:
            import fitz

        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            page_count = len(doc)
            for page in doc:
                page_text = page.get_text("text")
                if page_text:
                    text_parts.append(page_text.strip())
                # Track embedded images
                try:
                    images = page.get_images()
                    total_images_found += len(images)
                except Exception:
                    pass

    except Exception as pymupdf_err:
        # Fallback engine: pypdf
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            page_count = len(reader.pages)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted.strip())
        except Exception as pypdf_err:
            raise ValueError(f"Could not parse PDF content: {str(pymupdf_err)} / {str(pypdf_err)}")

    combined_text = "\n\n".join(text_parts).strip()

    # 3. Scanned PDF detection:
    # If the document has pages but extracted text has fewer than 60 characters,
    # or text-to-page ratio is extremely low while images exist.
    is_scanned = (len(combined_text) < 60) or (page_count > 0 and len(combined_text) / page_count < 30 and total_images_found > 0)

    return combined_text, is_scanned, page_count
