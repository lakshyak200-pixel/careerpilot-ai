import io
from typing import Tuple
from docx import Document

def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts structured text from Word document (.docx) bytes using python-docx.
    Validates DOCX magic signature (ZIP container PK\\x03\\x04).
    Extracts both paragraphs and table cells (common in modern resume templates).
    
    Returns:
        (extracted_text: str, element_count: int)
    """
    # 1. Validate DOCX magic signature (PK\x03\x04)
    if not file_bytes.startswith(b"PK\x03\x04"):
        raise ValueError("Invalid Word format. File signature does not match DOCX/ZIP header.")

    try:
        doc = Document(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Could not open DOCX file structure: {str(e)}")

    extracted_lines = []

    # 2. Extract regular paragraphs
    for p in doc.paragraphs:
        cleaned = p.text.strip()
        if cleaned:
            extracted_lines.append(cleaned)

    # 3. Extract text inside tables (resumes often use tables for education/skills columns)
    for table in doc.tables:
        for row in table.rows:
            row_cells = []
            for cell in row.cells:
                ctext = cell.text.strip()
                if ctext and (not row_cells or row_cells[-1] != ctext):
                    row_cells.append(ctext)
            if row_cells:
                extracted_lines.append(" | ".join(row_cells))

    combined_text = "\n".join(extracted_lines).strip()
    return combined_text, len(extracted_lines)
