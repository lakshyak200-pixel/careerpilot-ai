
import os
import re
import json
import glob
from pathlib import Path

import pymupdf
import spacy

BASE_DIR = Path(__file__).resolve().parent

# Load trained Model V2
MODEL_PATH_V2 = BASE_DIR / "models" / "resume_ner_model_v2"

trained_nlp_v2 = spacy.load(MODEL_PATH_V2)

# Use V2 for skill extraction too
trained_nlp = trained_nlp_v2

# Load skill dictionary
with open(
    BASE_DIR / "data" / "skills.json",
    encoding="utf-8"
) as f:
    skills_list = json.load(f)

# Load job roles
with open(
    BASE_DIR / "data" / "job_roles.json",
    encoding="utf-8"
) as f:
    job_roles = json.load(f)

# OCR configuration
TESSDATA = os.environ.get("TESSDATA_PREFIX")

if not TESSDATA:
    candidates = (
        glob.glob("/usr/share/tesseract-ocr/*/tessdata/eng.traineddata")
        + glob.glob(r"C:\Program Files\Tesseract-OCR\tessdata\eng.traineddata")
        + glob.glob(r"C:\Program Files (x86)\Tesseract-OCR\tessdata\eng.traineddata")
    )

    TESSDATA = (
        os.path.dirname(candidates[0])
        if candidates else None
    )


skill_aliases = {'ml': 'machine learning', 'js': 'javascript', 'react.js': 'react', 'reactjs': 'react', 'postgres': 'postgresql', 'rest api': 'rest apis', 'object oriented programming': 'oop', 'object-oriented programming': 'oop', 'sklearn': 'scikit-learn', 'dsa': 'data structures and algorithms'}

def pdf_to_text(pdf_path):

    extracted_pages = []

    with pymupdf.open(pdf_path) as doc:

        for page in doc:

            # Extract normal PDF text
            text = page.get_text(sort=True)

            # OCR fallback for scanned pages
            if len(text.strip()) < 10 and TESSDATA:
                try:
                    ocr_page = page.get_textpage_ocr(
                        language="eng",
                        dpi=300,
                        full=True,
                        tessdata=TESSDATA
                    )

                    text = page.get_text(
                        textpage=ocr_page,
                        sort=True
                    )
                except Exception:
                    pass

            extracted_pages.append(text)

    return "\n".join(extracted_pages)


def extract_skills_section(text):

    pattern = (
        r"(?im)^\s*(?:TECHNICAL SKILLS|"
        r"SKILLS AND TECHNOLOGIES|"
        r"PROGRAMMING SKILLS|"
        r"SKILLS)\s*:?[ \t]*"
        r"([\s\S]*?)"
        r"(?=^[ \t]*(?:EDUCATION|"
        r"EXPERIENCE|PROJECTS|"
        r"CERTIFICATIONS|"
        r"ACHIEVEMENTS|"
        r"ADDITIONAL INFORMATION|"
        r"WORK EXPERIENCE)\s*:?[ \t]*$|\Z)"
    )

    match = re.search(pattern, text)

    if match:
        return match.group(1).strip()

    return ""


def extract_accurate_skills(text):

    skills_section = extract_skills_section(text)

    if not skills_section:
        skills_section = text

    found_skills = []

    # Use trained NLP model
    doc = trained_nlp(skills_section)

    valid_skills = {
        skill.lower(): skill
        for skill in skills_list
    }

    # Verify model predictions
    for ent in doc.ents:

        if ent.label_ == "SKILL":

            skill = ent.text.strip().lower()

            if skill in valid_skills:

                found_skills.append(
                    valid_skills[skill]
                )

    # Dictionary matching to recover missed skills
    for skill in skills_list:

        pattern = (
            r"(?<![\w+#])"
            + re.escape(skill)
            + r"(?![\w+#])"
        )

        if re.search(
            pattern,
            skills_section,
            re.IGNORECASE
        ):

            found_skills.append(skill)

    # Normalize duplicate skill aliases
    found_skills = [
        "REST APIs" if s == "REST API" else s
        for s in found_skills
    ]

    # Remove duplicates
    return list(dict.fromkeys(found_skills))


def extract_resume_sections(text):

    heading_map = {
        "PROFESSIONAL SUMMARY": "summary",
        "SUMMARY": "summary",
        "CAREER OBJECTIVE": "summary",

        "TECHNICAL SKILLS": "skills",
        "SKILLS": "skills",
        "CORE COMPETENCIES": "skills",
        "PROGRAMMING & TOOLS": "skills",
        "TECHNOLOGIES": "skills",

        "EDUCATION": "education",
        "ACADEMIC BACKGROUND": "education",
        "ACADEMIC DETAILS": "education",
        "QUALIFICATIONS": "education",

        "EXPERIENCE": "experience",
        "WORK EXPERIENCE": "experience",
        "INTERNSHIPS": "experience",
        "PROFESSIONAL HISTORY": "experience",

        "PROJECTS": "projects",
        "ACADEMIC PROJECTS": "projects",
        "PERSONAL PROJECTS": "projects",
        "SELECTED PROJECTS": "projects",

        "CERTIFICATIONS": "certifications",
        "CREDENTIALS": "certifications",
        "PROFESSIONAL CERTIFICATES": "certifications",

        "ADDITIONAL INFORMATION": "additional",
        "ACHIEVEMENTS": "additional"
    }

    sections = {}
    current_section = "personal"

    for line in text.splitlines():

        line = line.strip()

        if not line:
            continue

        heading = line.upper().rstrip(":")

        if heading in heading_map:

            current_section = heading_map[heading]
            sections.setdefault(current_section, [])

        else:

            sections.setdefault(
                current_section, []
            ).append(line)

    return sections


def extract_contact_details(text):

    email_pattern = (
        r"[A-Za-z0-9._%+-]+@"
        r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
    )

    phone_pattern = (
        r"(?<!\d)(?:\+91[\s-]?)?"
        r"[6-9]\d{4}[\s-]?\d{5}(?!\d)"
    )

    cgpa_pattern = (
        r"CGPA\s*[:\-]?\s*"
        r"(\d{1,2}(?:\.\d+)?"
        r"(?:\s*/\s*10)?)"
    )

    emails = re.findall(email_pattern, text)

    phones = re.findall(phone_pattern, text)

    cgpa = re.search(
        cgpa_pattern,
        text,
        re.IGNORECASE
    )

    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "cgpa": cgpa.group(1) if cgpa else None
    }


def extract_resume_final(text):

    # Detect resume sections
    sections = extract_resume_sections(text)

    # Run trained model V2
    doc = trained_nlp_v2(text)

    # Extract contact information
    contact = extract_contact_details(text)

    # Use our previously verified skills function
    skills = extract_accurate_skills(text)

    # Extract name from personal section only
    personal_text = "\n".join(
        sections.get("personal", [])
    )

    personal_doc = trained_nlp_v2(personal_text)

    names = [
        ent.text.strip()
        for ent in personal_doc.ents
        if ent.label_ == "NAME"
    ]

    # Extract project names from project section
    projects_text = "\n".join(
        sections.get("projects", [])
    )

    projects_doc = trained_nlp_v2(projects_text)

    projects = [
        ent.text.strip()
        for ent in projects_doc.ents
        if ent.label_ == "PROJECT"
    ]

    # Extract organizations from education section
    education_text = "\n".join(
        sections.get("education", [])
    )

    education_doc = trained_nlp_v2(education_text)

    organizations = [
        ent.text.strip()
        for ent in education_doc.ents
        if ent.label_ == "ORGANIZATION"
    ]

    result = {
        "name": names[0] if names else None,

        "email": contact["email"],

        "phone": contact["phone"],

        "cgpa": contact["cgpa"],

        "skills": skills,

        "education": sections.get(
            "education", []
        ),

        "college_candidates": organizations,

        "experience": sections.get(
            "experience", []
        ),

        "projects": sections.get(
            "projects", []
        ),

        "project_name_candidates": projects,

        "certifications": sections.get(
            "certifications", []
        ),

        "summary": sections.get(
            "summary", []
        )
    }

    return result


def normalize_skill(skill):

    skill = skill.lower().strip()

    return skill_aliases.get(skill, skill)


def analyze_skill_gap(student_skills, target_role):

    # Check whether job role exists
    if target_role not in job_roles:
        return {"error": "Invalid job role"}

    required_skills = job_roles[target_role]

    # Normalize student skills
    student_set = {
        normalize_skill(skill)
        for skill in student_skills
    }

    # Handle DSA
    if "data structures and algorithms" in student_set:
        student_set.update([
            "data structures",
            "algorithms"
        ])

    matched_skills = []
    missing_skills = []

    # Compare required skills
    for skill in required_skills:

        if normalize_skill(skill) in student_set:
            matched_skills.append(skill)

        else:
            missing_skills.append(skill)

    # Calculate match percentage
    match_score = (
        len(matched_skills) /
        len(required_skills)
    ) * 100

    # Return results
    return {
        "target_role": target_role,
        "total_required_skills": len(required_skills),
        "total_matched_skills": len(matched_skills),
        "match_score": round(match_score, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }


def complete_resume_analysis(pdf_path, target_role):

    # Step 1: Validate job role
    if target_role not in job_roles:
        return {"error": "Invalid job role"}

    # Step 2: Convert PDF into text
    resume_text = pdf_to_text(pdf_path)

    if not resume_text.strip():
        return {"error": "No readable text found"}

    # Step 3: Extract resume information
    resume_info = extract_resume_final(resume_text)

    # Step 4: Analyze skill gaps
    skill_analysis = analyze_skill_gap(
        resume_info["skills"],
        target_role
    )

    # Step 5: Generate recommendations
    recommendations = []

    for skill in skill_analysis["missing_skills"]:

        recommendations.append(
            f"Learn {skill} and build a practice project."
        )

    # Step 6: Combine all results
    final_result = {

        "student_information": resume_info,

        "career_analysis": skill_analysis,

        "recommendations": recommendations

    }

    return final_result


