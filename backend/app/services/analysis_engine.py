"""
CareerPilot AI - Resume Analysis & Skill Gap Detection Engine
Executes the full 9-step explainable skill gap audit pipeline:
1. Extract and normalize skills from the uploaded CV.
2. Extract or retrieve required skills for the target role.
3. Normalize aliases (JS -> JavaScript, Postgres -> PostgreSQL).
4. Identify exact and validated equivalent skill matches.
5. Use NLP and Sentence Transformers for contextual matching suggestions.
6. Detect missing required skills and preferred skills.
7. Calculate a transparent weighted skill match score.
8. Identify strengths and areas for improvement.
9. Generate a personalized list of recommended next steps.
"""

import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone

from app.services.job_roles_catalog import (
    get_role_by_slug,
    get_all_roles,
    CURATED_JOB_ROLES,
    IMPORTANCE_WEIGHTS,
)
from app.services.skill_normalizer import (
    match_skill_candidate,
    extract_evidence_snippets,
    get_canonical_skill,
    clean_skill_string,
)
from app.services.nlp_matcher import nlp_engine
from app.services.job_description_parser import parse_custom_job_description

DISCLAIMER_TEXT = (
    "This match score measures documented skill alignment based on resume evidence and does not "
    "guarantee job readiness or hiring eligibility. It serves as an audit of your resume's keyword, "
    "framework, and project alignment against industry benchmarks."
)

class AnalysisEngine:
    def __init__(self):
        pass

    def run_analysis(
        self,
        resume_record: Dict[str, Any],
        target_role_name_or_slug: Optional[str] = None,
        custom_job_description: Optional[str] = None,
        weights_override: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Runs the full 9-step analysis pipeline.
        """
        # Step 1: Extract and normalize skills from the uploaded CV
        parsed_data = resume_record.get("parsed_data") or {}
        raw_text = resume_record.get("extracted_text") or ""

        candidate_skills: List[str] = []
        # Pull from technical_skills
        for s in parsed_data.get("technical_skills", []):
            if isinstance(s, str) and s.strip():
                candidate_skills.append(s.strip())
        # Pull from soft_skills
        for s in parsed_data.get("soft_skills", []):
            if isinstance(s, str) and s.strip():
                candidate_skills.append(s.strip())
        # Pull from project technologies
        for proj in parsed_data.get("projects", []):
            if isinstance(proj, dict):
                for tech in proj.get("technologies", []):
                    if isinstance(tech, str) and tech.strip():
                        candidate_skills.append(tech.strip())

        # Step 2: Extract or retrieve target role specification
        if custom_job_description and custom_job_description.strip():
            role_spec = parse_custom_job_description(custom_job_description)
            target_role_title = role_spec.get("title", "Custom Role")
        else:
            slug = target_role_name_or_slug or "software-developer"
            role_spec = get_role_by_slug(slug)
            if not role_spec:
                # Default to software-developer
                role_spec = CURATED_JOB_ROLES["software-developer"]
            target_role_title = role_spec.get("title", "Software Developer")

        # Step 3 & 4: Normalize aliases and identify exact / validated equivalent matches
        required_skills_defs = role_spec.get("required_skills", [])
        preferred_skills_defs = role_spec.get("preferred_skills", [])

        matched_skills: List[Dict[str, Any]] = []
        missing_required_skills: List[Dict[str, Any]] = []
        missing_preferred_skills: List[Dict[str, Any]] = []
        evidence_dict: Dict[str, str] = {}

        # Evaluate Required Skills
        for skill_def in required_skills_defs:
            is_matched, match_type, matched_term, confidence = match_skill_candidate(
                skill_def, candidate_skills, raw_text
            )
            evidence = extract_evidence_snippets(
                skill_def["name"],
                skill_def.get("aliases", []),
                raw_text
            )
            if is_matched:
                matched_item = {
                    "name": skill_def["name"],
                    "canonical": skill_def.get("canonical", skill_def["name"].lower()),
                    "category": skill_def.get("category", "Core Requirements"),
                    "importance": skill_def.get("importance", "critical"),
                    "weight": skill_def.get("weight", 1.5),
                    "match_type": match_type,
                    "matched_candidate_term": matched_term or skill_def["name"],
                    "confidence": confidence,
                    "evidence": evidence or f"Documented in candidate's verified skills list: '{matched_term}'",
                    "is_required": True
                }
                matched_skills.append(matched_item)
                if evidence:
                    evidence_dict[skill_def["name"]] = evidence
            else:
                missing_required_skills.append({
                    "name": skill_def["name"],
                    "canonical": skill_def.get("canonical", skill_def["name"].lower()),
                    "category": skill_def.get("category", "Core Requirements"),
                    "importance": skill_def.get("importance", "critical"),
                    "weight": skill_def.get("weight", 1.5),
                    "is_required": True,
                    "action_tip": f"Add concrete project or coursework demonstrating {skill_def['name']}."
                })

        # Evaluate Preferred Skills
        for skill_def in preferred_skills_defs:
            is_matched, match_type, matched_term, confidence = match_skill_candidate(
                skill_def, candidate_skills, raw_text
            )
            evidence = extract_evidence_snippets(
                skill_def["name"],
                skill_def.get("aliases", []),
                raw_text
            )
            if is_matched:
                matched_item = {
                    "name": skill_def["name"],
                    "canonical": skill_def.get("canonical", skill_def["name"].lower()),
                    "category": skill_def.get("category", "Preferred & Tools"),
                    "importance": skill_def.get("importance", "medium"),
                    "weight": skill_def.get("weight", 1.0),
                    "match_type": match_type,
                    "matched_candidate_term": matched_term or skill_def["name"],
                    "confidence": confidence,
                    "evidence": evidence or f"Documented in candidate's skills list: '{matched_term}'",
                    "is_required": False
                }
                matched_skills.append(matched_item)
                if evidence:
                    evidence_dict[skill_def["name"]] = evidence
            else:
                missing_preferred_skills.append({
                    "name": skill_def["name"],
                    "canonical": skill_def.get("canonical", skill_def["name"].lower()),
                    "category": skill_def.get("category", "Preferred & Tools"),
                    "importance": skill_def.get("importance", "medium"),
                    "weight": skill_def.get("weight", 1.0),
                    "is_required": False,
                    "action_tip": f"Bonus differentiator: Familiarity with {skill_def['name']} will boost applicant ranking."
                })

        # Step 5: Contextual Matching Suggestions via Modular NLP & Sentence Transformers
        # NOTE: Semantic similarity is purely used for suggestions and bridging ideas, NEVER for awarding points.
        all_missing = missing_required_skills + missing_preferred_skills
        contextual_suggestions = nlp_engine.generate_contextual_suggestions(
            raw_text, all_missing, matched_skills
        )

        # Step 6 & 7: Calculate transparent weighted skill match score
        scoring_weights = role_spec.get("scoring_weights", {"required_percentage": 0.70, "preferred_percentage": 0.30})
        if weights_override:
            scoring_weights.update(weights_override)

        req_weight_ratio = scoring_weights.get("required_percentage", 0.70)
        pref_weight_ratio = scoring_weights.get("preferred_percentage", 0.30)

        total_req_points = sum(s.get("weight", 1.0) for s in required_skills_defs) or 1.0
        earned_req_points = sum(
            s.get("weight", 1.0) for s in matched_skills if s.get("is_required")
        )

        total_pref_points = sum(s.get("weight", 1.0) for s in preferred_skills_defs) or 1.0
        earned_pref_points = sum(
            s.get("weight", 1.0) for s in matched_skills if not s.get("is_required")
        )

        required_pct = round((earned_req_points / total_req_points) * 100, 1)
        preferred_pct = round((earned_pref_points / total_pref_points) * 100, 1)

        raw_match_score = (req_weight_ratio * required_pct) + (pref_weight_ratio * preferred_pct)
        match_score = max(0, min(100, int(round(raw_match_score))))

        # Detailed explainable breakdown
        scoring_breakdown = {
            "overall_match_score": match_score,
            "required_skills_score": required_pct,
            "preferred_skills_score": preferred_pct,
            "weights_applied": {
                "required_weight": req_weight_ratio,
                "preferred_weight": pref_weight_ratio
            },
            "points_earned": {
                "required_points": round(earned_req_points, 2),
                "required_total_possible": round(total_req_points, 2),
                "preferred_points": round(earned_pref_points, 2),
                "preferred_total_possible": round(total_pref_points, 2)
            },
            "formula_explanation": (
                f"Score = ({req_weight_ratio * 100}% × Required Skill Match {required_pct}%) + "
                f"({pref_weight_ratio * 100}% × Preferred Skill Match {preferred_pct}%) = {match_score}%."
            )
        }

        # Step 8: Identify Strengths & Areas for Improvement
        strengths: List[Dict[str, str]] = []
        improvements: List[Dict[str, str]] = []

        # Identify verified core strengths
        req_matched_names = [s["name"] for s in matched_skills if s.get("is_required")]
        if req_matched_names:
            strengths.append({
                "title": f"Strong Core Alignment ({len(req_matched_names)} Required Skills Verified)",
                "description": f"Verified critical alignment in: {', '.join(req_matched_names[:4])}.",
                "impact": "High"
            })

        if len(evidence_dict) >= 2:
            strengths.append({
                "title": "Verifiable Project Context",
                "description": f"Direct resume excerpts demonstrate practical application of {len(evidence_dict)} key technical competencies.",
                "impact": "High"
            })

        # Identify Improvement Areas
        if missing_required_skills:
            critical_names = [s["name"] for s in missing_required_skills[:3]]
            improvements.append({
                "title": f"Address Missing Core Skills: {', '.join(critical_names)}",
                "description": (
                    f"Recruiters look for these core skills for {target_role_title}. "
                    "Incorporate them into hands-on projects or coursework if proficient."
                ),
                "priority": "High"
            })

        if missing_preferred_skills:
            pref_names = [s["name"] for s in missing_preferred_skills[:3]]
            improvements.append({
                "title": f"Target Preferred Enhancements: {', '.join(pref_names)}",
                "description": "Including these tools will differentiate your application from other entry-level applicants.",
                "priority": "Medium"
            })

        # Step 9: Personalized Recommended Next Steps
        next_steps: List[str] = []
        if missing_required_skills:
            top_miss = missing_required_skills[0]["name"]
            next_steps.append(
                f"1. Build or expand a project that visibly demonstrates hands-on implementation of {top_miss}."
            )
        else:
            next_steps.append(
                f"1. Highlight quantifiable metrics in your existing projects (e.g., latency reduction or data volumes)."
            )

        if missing_preferred_skills:
            top_pref = missing_preferred_skills[0]["name"]
            next_steps.append(
                f"2. Complete a targeted practical exercise or certification in {top_pref}."
            )
        else:
            next_steps.append(
                "2. Ensure all project repositories have public GitHub links and clear README documentation."
            )

        next_steps.append(
            f"3. Practice an AI Mock Technical Interview tailored to {target_role_title} to test conceptual depth and problem solving."
        )

        analysis_id = str(uuid.uuid4())
        created_timestamp = datetime.now(timezone.utc).isoformat()

        return {
            "id": analysis_id,
            "resume_id": resume_record.get("id"),
            "target_role": target_role_title,
            "match_score": match_score,
            "matched_skills": matched_skills,
            "missing_required_skills": missing_required_skills,
            "missing_preferred_skills": missing_preferred_skills,
            "strengths": strengths,
            "improvement_suggestions": improvements,
            "evidence_from_resume": evidence_dict,
            "scoring_breakdown": scoring_breakdown,
            "contextual_suggestions": contextual_suggestions,
            "next_steps": next_steps,
            "disclaimer": DISCLAIMER_TEXT,
            "created_at": created_timestamp,
            "nlp_model_used": nlp_engine.model_name
        }

analysis_engine = AnalysisEngine()

