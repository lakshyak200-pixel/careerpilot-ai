"""
CareerPilot AI - Custom Job Description Parser
Extracts required and preferred skills from custom recruiter job descriptions
using rule-based NLP, section segmentation, and the canonical skill catalog.
"""

import re
from typing import Dict, List, Any, Optional
from app.services.skill_normalizer import (
    CANONICAL_SKILL_ALIASES,
    clean_skill_string,
    get_canonical_skill,
)

def parse_custom_job_description(jd_text: str) -> Dict[str, Any]:
    """
    Parses a raw job description text into a structured role specification
    with required_skills, preferred_skills, and importance weights.
    """
    if not jd_text or not jd_text.strip():
        raise ValueError("Job description text cannot be empty.")

    lines = [ln.strip() for ln in jd_text.split("\n") if ln.strip()]

    # Infer or extract role title from first lines
    inferred_title = "Custom Role"
    for line in lines[:5]:
        line_clean = line.strip("#-*• \t")
        if 5 <= len(line_clean) <= 60 and not re.search(r"(about|company|description|overview|requirements)", line_clean, re.I):
            inferred_title = line_clean
            break

    # Segment text into sections (Required vs Preferred)
    required_text_lines: List[str] = []
    preferred_text_lines: List[str] = []
    general_text_lines: List[str] = []

    current_section = "general"
    for line in lines:
        lower = line.lower()
        if re.search(r"\b(preferred|nice to have|plus|bonus|optional|good to have)\b", lower):
            current_section = "preferred"
        elif re.search(r"\b(requirements|must have|qualifications|required skills|what you need|who you are)\b", lower):
            current_section = "required"
        elif re.search(r"\b(benefits|about us|perks|compensation|equal opportunity)\b", lower):
            current_section = "general"

        if current_section == "preferred":
            preferred_text_lines.append(line)
        elif current_section == "required":
            required_text_lines.append(line)
        else:
            general_text_lines.append(line)

    # If no section headings found, treat all lines as required
    if not required_text_lines:
        required_text_lines = general_text_lines

    full_req_text = " ".join(required_text_lines).lower()
    full_pref_text = " ".join(preferred_text_lines).lower()
    full_all_text = jd_text.lower()

    # Search for canonical skills in the text
    detected_required: List[Dict[str, Any]] = []
    detected_preferred: List[Dict[str, Any]] = []
    seen_canonicals = set()

    for canonical, aliases in CANONICAL_SKILL_ALIASES.items():
        # Check if canonical or any alias appears in preferred section
        in_preferred = False
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", full_pref_text):
                in_preferred = True
                break

        # Check if canonical or any alias appears in required section
        in_required = False
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", full_req_text):
                in_required = True
                break

        # Check in whole text if neither matched specifically
        if not in_required and not in_preferred:
            for alias in aliases:
                if re.search(rf"\b{re.escape(alias)}\b", full_all_text):
                    in_required = True
                    break

        if (in_required or in_preferred) and canonical not in seen_canonicals:
            seen_canonicals.add(canonical)
            display_name = canonical.title() if len(canonical) > 3 else canonical.upper()
            skill_def = {
                "name": display_name,
                "canonical": canonical,
                "category": "Extracted Skill",
                "importance": "critical" if in_required else "medium",
                "weight": 1.5 if in_required else 1.0,
                "aliases": aliases
            }
            if in_preferred and not in_required:
                detected_preferred.append(skill_def)
            else:
                detected_required.append(skill_def)

    # Ensure minimum required skills fallback if none detected
    if not detected_required and not detected_preferred:
        detected_required = [
            {"name": "Core Technical Skills", "canonical": "core skills", "category": "General", "importance": "critical", "weight": 1.5, "aliases": []},
            {"name": "Communication & Problem Solving", "canonical": "problem solving", "category": "General", "importance": "high", "weight": 1.2, "aliases": []}
        ]

    return {
        "id": "custom-role-" + str(abs(hash(jd_text)) % 100000),
        "slug": "custom-role",
        "title": inferred_title,
        "category": "Custom Job Description",
        "experience_level": "entry_level",
        "description": jd_text[:280] + ("..." if len(jd_text) > 280 else ""),
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30
        },
        "skill_categories": ["Required Skills", "Preferred Skills"],
        "required_skills": detected_required,
        "preferred_skills": detected_preferred
    }

