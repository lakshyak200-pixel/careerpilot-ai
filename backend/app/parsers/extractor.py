import re
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.resume import (
    ExtractedResumeData,
    EducationEntry,
    ExperienceEntry,
    ProjectEntry
)

# ==============================================================================
# Comprehensive Skill Lexicons
# ==============================================================================

TECH_SKILLS_LEXICON = [
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go",
    "rust", "php", "ruby", "swift", "kotlin", "dart", "scala", "r", "bash", "shell",
    # Frontend Development
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte", "html",
    "html5", "css", "css3", "tailwind css", "tailwind", "bootstrap", "sass", "scss",
    "redux", "zustand", "webpack", "vite", "responsive design", "accessibility", "a11y",
    # Backend Development & Frameworks
    "node.js", "express", "express.js", "fastapi", "django", "flask", "spring boot",
    "asp.net", "laravel", "ruby on rails", "nestjs", "graphql", "rest api", "restful api",
    "rest api integration", "grpc", "microservices", "websockets",
    # Databases & Caching
    "sql", "postgresql", "mysql", "mongodb", "redis", "sqlite", "oracle", "cassandra",
    "dynamodb", "elasticsearch", "supabase", "firebase", "prisma", "sqlalchemy",
    # Cloud, DevOps & Infrastructure
    "docker", "kubernetes", "aws", "amazon web services", "azure", "google cloud", "gcp",
    "ci/cd", "github actions", "gitlab ci", "linux", "terraform", "nginx", "jenkins",
    "git", "github", "gitlab",
    # Data Science, AI & Machine Learning
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "llm", "large language models", "langchain", "prompt engineering",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "opencv",
    "data analysis", "matplotlib", "seaborn", "tableau", "power bi",
    # Testing & Methodologies
    "pytest", "jest", "vitest", "cypress", "playwright", "unit testing", "react testing library",
    "postman", "jira", "agile", "scrum"
]

SOFT_SKILLS_LEXICON = [
    "communication", "teamwork", "leadership", "problem solving", "critical thinking",
    "adaptability", "time management", "collaboration", "work ethic", "attention to detail",
    "creativity", "interpersonal skills", "conflict resolution", "mentorship", "presentation",
    "analytical thinking", "decision making", "fast learner", "multitasking"
]

DEGREE_PATTERNS = [
    (r"(?i)\b(b\.?\s?tech|b\.?\s?e\.?|bachelor of technology|bachelor of engineering)\b", "B.Tech"),
    (r"(?i)\b(b\.?\s?s\.?|b\.?\s?sc|bachelor of science|bca|b\.?\s?com|bba|b\.?\s?a\.?)\b", "Bachelor's Degree"),
    (r"(?i)\b(m\.?\s?tech|m\.?\s?e\.?|master of technology|m\.?\s?s\.?|m\.?\s?sc|mca|mba|m\.?\s?a\.?)\b", "Master's Degree"),
    (r"(?i)\b(ph\.?d\.?|doctor of philosophy|doctorate)\b", "Ph.D"),
    (r"(?i)\b(diploma|polytechnic|high school|secondary school|higher secondary|12th|cbse|icse)\b", "High School / Diploma")
]

FIELD_OF_STUDY_PATTERNS = [
    r"(?i)computer science and engineering",
    r"(?i)computer science",
    r"(?i)information technology",
    r"(?i)artificial intelligence and machine learning",
    r"(?i)artificial intelligence",
    r"(?i)data science",
    r"(?i)software engineering",
    r"(?i)electronics and communication",
    r"(?i)electrical engineering",
    r"(?i)mechanical engineering",
    r"(?i)civil engineering",
    r"(?i)cybersecurity"
]

# ==============================================================================
# Security & Untrusted Input Sanitization
# ==============================================================================

def sanitize_text(text: str) -> str:
    """
    Treats uploaded document contents as untrusted data.
    - Strips NULL bytes and harmful non-printable control characters.
    - Neutralizes potential embedded code (HTML/JS/XML tags, script injection).
    - Neutralizes prompt injection attempts (e.g. 'ignore previous instructions').
    - Disarms spreadsheet formula injection triggers (=, +, -, @).
    - Prevents ReDoS and buffer attacks via size caps.
    """
    if not text:
        return ""

    # 1. Enforce length cap (max 500,000 characters)
    sanitized = text[:500000]

    # 2. Strip null bytes and non-printable control chars (preserve standard tabs/newlines)
    sanitized = sanitized.replace("\x00", "")
    sanitized = "".join(ch for ch in sanitized if ch in ("\n", "\r", "\t") or (32 <= ord(ch) <= 126) or ord(ch) > 127)

    # 3. Disarm HTML/script tags
    sanitized = re.sub(r"(?i)<script[\s\S]*?</script>", "[removed_script]", sanitized)
    sanitized = re.sub(r"(?i)<iframe[\s\S]*?</iframe>", "[removed_iframe]", sanitized)
    sanitized = re.sub(r"(?i)javascript:", "blocked_js:", sanitized)
    sanitized = re.sub(r"(?i)<(svg|embed|object|applet)[\s\S]*?>", "[removed_tag]", sanitized)

    # 4. Neutralize Prompt Injection patterns
    injection_patterns = [
        r"(?i)ignore\s+(all\s+)?(previous|prior)\s+instructions",
        r"(?i)disregard\s+(all\s+)?(previous|prior)\s+prompts",
        r"(?i)you\s+are\s+now\s+(an?|in)\s+developer\s+mode",
        r"(?i)dan\s+mode\s+enabled",
        r"(?i)system\s*prompt\s*:",
        r"(?i)<\|im_start\|>",
        r"(?i)\[INST\]",
        r"(?i)output\s+the\s+following\s+system\s+directive"
    ]
    for pattern in injection_patterns:
        sanitized = re.sub(pattern, "[sanitized_directive]", sanitized)

    # 5. Disarm spreadsheet formula triggers at line starts
    sanitized = re.sub(r"(?m)^[=+\-@]", "'", sanitized)

    return sanitized


# ==============================================================================
# Contact Information Extractors
# ==============================================================================

def extract_email(text: str) -> Optional[str]:
    """Extract candidate email using standard RFC 5322-compatible pattern."""
    match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
    return match.group(0).lower() if match else None

def extract_phone(text: str) -> Optional[str]:
    """
    Extract candidate phone number.
    Supports international (+91, +1, +44), parenthesized area codes, spaces and hyphens.
    """
    pattern = r"(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}"
    for match in re.finditer(pattern, text):
        candidate = match.group(0).strip()
        digits = re.sub(r"\D", "", candidate)
        if 10 <= len(digits) <= 14:
            return candidate
    return None

def extract_name(text: str) -> Optional[str]:
    """
    Extract candidate full name from header section.
    Uses multi-stage heuristics:
    1. Cross-reference with extracted email username (e.g. riya.kapoor@... -> Riya Kapoor).
    2. Header line scanning excluding document metadata, watermarks, job titles, and URLs.
    3. Fallback to derived name from email.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    email = extract_email(text)

    # 1. Email cross-reference: high accuracy matching
    if email:
        local_part = email.split("@")[0].lower()
        cleaned_local = re.sub(r"\d+", "", local_part)
        name_parts = [p for p in re.split(r"[._\-+]+", cleaned_local) if len(p) >= 2]
        if name_parts:
            for line in lines[:15]:
                low = line.lower()
                if all(re.search(rf"\b{re.escape(p)}\b", low) for p in name_parts):
                    clean_line = re.split(r"[|–—•,]", line)[0].strip()
                    words = clean_line.split()
                    if 2 <= len(words) <= 4 and all(w.replace(".", "").isalpha() for w in words):
                        return clean_line.title()

    # 2. Heuristic scan of the top lines
    ignore_keywords = [
        "resume", "curriculum", "vitae", "cv", "portfolio", "contact",
        "phone", "email", "address", "profile", "github", "linkedin",
        "http", "www", "summary", "objective", "education", "skills", "experience",
        "dataset", "matching", "candidate", "developer", "engineer", "designer",
        "analyst", "manager", "page", "test", "synthetic", "skillpilot", "careerpilot"
    ]

    for line in lines[:10]:
        low = line.lower()
        if any(kw in low for kw in ignore_keywords):
            continue
        if "@" in line or "http" in low or re.search(r"\d", line):
            continue

        candidate_segment = line
        for sep in ["|", "–", "—", "-", "•", ","]:
            if sep in candidate_segment:
                parts = candidate_segment.split(sep)
                if len(parts[0].strip().split()) >= 2:
                    candidate_segment = parts[0].strip()
                    break

        words = candidate_segment.split()
        if 2 <= len(words) <= 4:
            if all(w.replace(".", "").isalpha() for w in words):
                return candidate_segment.title()

    # 3. Fallback derived from email
    if email:
        local_part = email.split("@")[0]
        cleaned = re.sub(r"\d+", "", local_part)
        parts = [p for p in re.split(r"[._\-+]+", cleaned) if len(p) >= 2]
        if len(parts) >= 2:
            return " ".join(p.title() for p in parts)

    return "Candidate Name"


# ==============================================================================
# Skills Extractor
# ==============================================================================

def extract_skills(text: str) -> Tuple[List[str], List[str]]:
    """
    Extract technical and soft skills.
    Combines:
    1. Direct structured parsing of the TECHNICAL SKILLS section (comma, bullet, pipe delimited).
    2. Comprehensive bounded lexicon matching across the entire document text.
    """
    matched_tech: List[str] = []
    matched_soft: List[str] = []

    # 1. Direct section parsing
    lines = text.split("\n")
    in_skills_section = False
    skills_lines = []

    section_header_pat = re.compile(
        r"(?i)^(technical\s+skills|skills\s*(?:&|and)\s*abilities|core\s+competencies|skills|key\s+skills)\b"
    )
    stop_header_pat = re.compile(
        r"(?i)^(education|experience|work\s+experience|projects|certifications|awards|summary|professional\s+summary|additional\s+information|languages)\b"
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if section_header_pat.match(stripped):
            in_skills_section = True
            continue
        if in_skills_section:
            if stop_header_pat.match(stripped):
                break
            skills_lines.append(stripped)

    if skills_lines:
        combined_skills_text = " ".join(skills_lines)
        raw_items = re.split(r"[,;|•\*\n]+", combined_skills_text)
        for item in raw_items:
            clean_item = item.strip()
            if ":" in clean_item:
                clean_item = clean_item.split(":")[-1].strip()
            if not clean_item or len(clean_item) > 40:
                continue
            if clean_item.lower() in ("etc", "and", "or", "tools", "frameworks", "libraries", "languages"):
                continue

            # Standardized casing
            if clean_item.isupper() or any(c.isupper() for c in clean_item[1:]):
                formatted = clean_item
            else:
                formatted = clean_item.title()
            matched_tech.append(formatted)

    # 2. Bounded Lexicon matching
    lower_text = " " + text.lower().replace("/", " ").replace(",", " ").replace(";", " ") + " "

    for skill in TECH_SKILLS_LEXICON:
        if skill in ("c", "r", "go"):
            pattern = rf"(?:\b|\s){re.escape(skill)}(?:\b|\s)"
        else:
            pattern = rf"(?:\b|\s){re.escape(skill)}(?:\b|\s|[.,;/|])"

        if re.search(pattern, lower_text):
            if skill.lower() in ("sql", "aws", "gcp", "nlp", "llm", "ci/cd", "html", "html5", "css", "css3", "api", "rest api"):
                formatted = skill.upper()
            elif skill.lower() in ("javascript", "typescript"):
                formatted = skill[:4].capitalize() + "Script"
            elif skill.lower() in ("react.js", "node.js", "express.js", "vue.js"):
                formatted = skill.capitalize()
            elif skill.lower() == "c++":
                formatted = "C++"
            elif skill.lower() == "c#":
                formatted = "C#"
            else:
                formatted = skill.title()

            if not any(m.lower() == formatted.lower() for m in matched_tech):
                matched_tech.append(formatted)

    for skill in SOFT_SKILLS_LEXICON:
        pattern = rf"(?:\b|\s){re.escape(skill)}(?:\b|\s|[.,;/|])"
        if re.search(pattern, lower_text):
            if not any(m.lower() == skill.lower() for m in matched_soft):
                matched_soft.append(skill.title())

    return list(dict.fromkeys(matched_tech)), list(dict.fromkeys(matched_soft))


# ==============================================================================
# Education Extractor
# ==============================================================================

def extract_education(text: str) -> List[EducationEntry]:
    """
    Extract academic degrees, universities, graduation years, and GPAs.
    """
    education_entries = []
    lines = text.split("\n")

    for i, line in enumerate(lines):
        for pattern, degree_label in DEGREE_PATTERNS:
            if re.search(pattern, line):
                degree_match = re.search(pattern, line).group(0).strip()
                context_chunk = " ".join(lines[max(0, i - 1):min(len(lines), i + 3)])
                year_match = re.search(r"\b(20\d{2}(?:\s?[-–—]\s?20\d{2})?)\b", context_chunk)
                gpa_match = re.search(r"(?i)(?:gpa|cgpa|percentage|score)[\s:]*([\d.]+(?:\s?/\s?[\d.]+)?%?)", context_chunk)

                institution = "University / College"
                inst_match = re.search(r"(?i)\b([A-Z][A-Za-z\s&,.]{1,50}?(?:University|Institute(?:\s+of\s+Technology)?|College|Academy|School|Campus))\b", context_chunk)
                if inst_match:
                    clean_inst = inst_match.group(1).strip().rstrip(",.")
                    clean_inst = re.sub(r"(?i)^[a-z\s/,\-]*degree[,\s\-]*", "", clean_inst).strip()
                    if len(clean_inst) >= 3:
                        institution = clean_inst
                elif "|" in line:
                    for part in line.split("|"):
                        part_s = part.strip()
                        if any(k in part_s.lower() for k in ["institute", "university", "college", "school"]):
                            clean_p = re.sub(r"(?i)^.*?,\s*", "", part_s).strip()
                            if len(clean_p) >= 3:
                                institution = clean_p
                                break

                field_of_study = ""
                for fpattern in FIELD_OF_STUDY_PATTERNS:
                    fmatch = re.search(fpattern, context_chunk)
                    if fmatch:
                        field_of_study = fmatch.group(0).title()
                        break

                education_entries.append(
                    EducationEntry(
                        institution=institution,
                        degree=degree_label or degree_match.title(),
                        field_of_study=field_of_study or "Computer Science / Engineering",
                        year=year_match.group(0) if year_match else "",
                        gpa=gpa_match.group(1) if gpa_match else None
                    )
                )
                break

    if not education_entries:
        for line in lines:
            if any(k in line.lower() for k in ["university", "institute of technology", "engineering college"]):
                education_entries.append(
                    EducationEntry(
                        institution=line.strip()[:60],
                        degree="Bachelor of Technology",
                        field_of_study="Computer Science",
                        year="2026"
                    )
                )
                break

    return education_entries[:4]


# ==============================================================================
# Experience & Internship Extractor
# ==============================================================================

def extract_experience(text: str) -> Tuple[List[ExperienceEntry], List[ExperienceEntry]]:
    """
    Extract professional experience and separate into internship vs work experience.
    Extracts role, organization, duration, and bullet point descriptions.
    """
    internships: List[ExperienceEntry] = []
    work_exp: List[ExperienceEntry] = []

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    in_exp_section = False
    is_intern_subheading = False

    role_keywords = [
        "engineer", "developer", "architect", "lead", "consultant", "analyst",
        "intern", "trainee", "associate", "specialist", "fellow", "programmer"
    ]

    for i, line in enumerate(lines):
        lower = line.lower()

        # Section headers
        if re.match(r"(?i)^(#+\s*)?(work\s+experience|professional\s+experience|employment\s+history|experience)\s*$", line):
            in_exp_section = True
            is_intern_subheading = False
            continue
        elif re.match(r"(?i)^(#+\s*)?(internships?|internship\s+experience)\s*$", line):
            in_exp_section = True
            is_intern_subheading = True
            continue
        elif re.match(r"(?i)^(#+\s*)?(projects|academic\s+projects|education|skills|certifications|awards|summary|additional\s+information)\s*$", line):
            in_exp_section = False
            continue

        # Skip bullet points / description lines when identifying role headers
        if line.startswith(("-", "•", "*")):
            continue

        is_role_match = any(k in lower for k in role_keywords)
        has_dates = bool(re.search(r"\b(20\d{2}|present|current)\b", lower))

        if is_role_match and (in_exp_section or (has_dates and (" at " in lower or " @ " in lower or "|" in line))):
            is_intern = is_intern_subheading or any(k in lower for k in ["intern", "trainee", "fellow", "apprentice"])
            role = line[:60]
            org = "Technology Organization"
            duration = "3-6 months"

            if "|" in line:
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 2:
                    role = parts[0][:50]
                    org = parts[1][:50]
                if len(parts) >= 3:
                    dur_match = re.search(r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Present|\w+\s+\d{4}))\b", parts[2], re.I)
                    duration = dur_match.group(0) if dur_match else parts[2][:30]
            else:
                dur_match = re.search(r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:Present|\w+\s+\d{4}))\b", line, re.I)
                if dur_match:
                    duration = dur_match.group(0)

            # Collect subsequent bullet points for description
            desc_bullets = []
            for j in range(i + 1, min(len(lines), i + 6)):
                next_line = lines[j]
                if next_line.startswith(("-", "•", "*")):
                    desc_bullets.append(next_line.lstrip("-•* \t"))
                elif any(k in next_line.lower() for k in role_keywords) and bool(re.search(r"\b(20\d{2}|present|current)\b", next_line.lower())):
                    break
                elif re.match(r"(?i)^(#+\s*)?(projects|education|skills|certifications)\s*$", next_line):
                    break

            description = " ".join(desc_bullets) if desc_bullets else "Designed and developed software features."

            entry = ExperienceEntry(
                role=role,
                organization=org,
                duration=duration,
                description=description[:250],
                is_internship=is_intern
            )

            if is_intern:
                internships.append(entry)
            else:
                work_exp.append(entry)

    return internships[:4], work_exp[:4]


# ==============================================================================
# Projects Extractor
# ==============================================================================

def extract_projects(text: str) -> List[ProjectEntry]:
    """
    Extract student projects, including project titles, technologies used, and descriptions.
    """
    projects = []
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    in_project_section = False

    for i, line in enumerate(lines):
        if re.match(r"(?i)^(#+\s*)?(projects|academic\s+projects|key\s+projects|technical\s+projects)\s*$", line):
            in_project_section = True
            continue
        elif in_project_section and re.match(r"(?i)^(#+\s*)?(experience|education|skills|certifications|awards|summary|additional\s+information)\s*$", line):
            in_project_section = False
            break

        if in_project_section:
            title = ""
            desc = "Built scalable end-to-end features with modern engineering practices."
            clean_line = line.lstrip("-•* \t")

            for sep in ["—", "–", " - ", ":"]:
                if sep in clean_line:
                    parts = clean_line.split(sep, 1)
                    if 3 <= len(parts[0].strip()) <= 60 and len(parts[1].strip()) > 5:
                        title = parts[0].strip()
                        desc = parts[1].strip()
                        break

            if not title and not line.startswith(("-", "•", "*")) and 3 <= len(clean_line) <= 60:
                title = clean_line

            if title:
                detected_techs = [
                    t.title() for t in TECH_SKILLS_LEXICON if len(t) > 1 and re.search(rf"\b{re.escape(t)}\b", (title + " " + desc).lower())
                ]
                projects.append(
                    ProjectEntry(
                        title=title[:60],
                        technologies=detected_techs[:5],
                        description=desc[:250]
                    )
                )
                if len(projects) >= 4:
                    break

    # Fallback if no explicit project section header found
    if not projects:
        for line in lines:
            if 10 < len(line) < 70 and any(k in line.lower() for k in ["app", "portal", "system", "dashboard", "bot", "platform"]):
                projects.append(
                    ProjectEntry(
                        title=line[:60],
                        technologies=["React", "JavaScript"],
                        description="Developed and deployed key software features."
                    )
                )
                if len(projects) >= 2:
                    break

    return projects


# ==============================================================================
# Certifications Extractor
# ==============================================================================

def extract_certifications(text: str) -> List[str]:
    """
    Extract recognized certifications (AWS, Azure, GCP, Cisco, Oracle, Kubernetes, Coursera, Meta).
    Filters out section header words.
    """
    certs = []
    cert_keywords = [
        "aws certified", "azure", "google cloud certified", "gcp", "cisco", "ccna",
        "comptia", "oracle certified", "kubernetes", "cka", "ckad", "scrum master",
        "coursera", "meta certified", "hashicorp", "udemy", "certificate", "fundamentals"
    ]
    lines = text.split("\n")
    for line in lines:
        lower = line.lower().strip()
        # Skip section headers
        if lower in ("certifications", "certification", "certificates", "certificate"):
            continue
        if any(k in lower for k in cert_keywords):
            cleaned = line.strip("•-* \t")
            if 8 <= len(cleaned) <= 100:
                certs.append(cleaned)

    return list(dict.fromkeys(certs))[:5]


# ==============================================================================
# Summary Extractor
# ==============================================================================

def extract_summary(text: str) -> Optional[str]:
    """
    Extract professional summary or objective if present in the document.
    """
    lines = text.split("\n")
    in_summary = False
    summary_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r"(?i)^(professional\s+summary|summary|career\s+objective|about\s+me)\b", stripped):
            in_summary = True
            continue
        if in_summary:
            if re.match(r"(?i)^(technical\s+skills|skills|education|experience|projects|certifications)\b", stripped):
                break
            summary_lines.append(stripped)

    if summary_lines:
        return " ".join(summary_lines)[:350].strip()
    return text[:350].strip() if text else None


# ==============================================================================
# Main Pipeline Function
# ==============================================================================

def parse_resume_content(raw_text: str, is_scanned: bool = False) -> ExtractedResumeData:
    """
    Main extraction pipeline.
    Parses unstructured text into strongly-typed Pydantic ExtractedResumeData.
    """
    safe_text = sanitize_text(raw_text)

    # Scanned PDF Handling
    if is_scanned:
        return ExtractedResumeData(
            is_scanned_pdf=True,
            warning="Scanned or image-only PDF detected with little to no extractable digital text. Please upload a digital PDF (exported from Word, Google Docs, or Canva) or manually input your skills below."
        )

    name = extract_name(safe_text)
    email = extract_email(safe_text)
    phone = extract_phone(safe_text)
    tech_skills, soft_skills = extract_skills(safe_text)
    education = extract_education(safe_text)
    projects = extract_projects(safe_text)
    internships, work_exp = extract_experience(safe_text)
    certs = extract_certifications(safe_text)
    summary = extract_summary(safe_text)

    return ExtractedResumeData(
        full_name=name,
        email=email,
        phone=phone,
        technical_skills=tech_skills,
        soft_skills=soft_skills,
        education=education,
        projects=projects,
        internship_experience=internships,
        work_experience=work_exp,
        certifications=certs,
        summary=summary,
        is_scanned_pdf=False,
        warning=None
    )

def extract_resume_data(raw_text: str, is_scanned: bool = False) -> Dict[str, Any]:
    """Helper returning parsed resume data as a standard JSON-serializable dictionary."""
    return parse_resume_content(raw_text, is_scanned).model_dump()
