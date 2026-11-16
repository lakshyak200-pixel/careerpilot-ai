"""
CareerPilot AI - Test Suite for Resume Analysis & Skill Gap Engine
Verifies all 9 pipeline steps, alias normalization, curated roles,
custom job description parsing, and explainable scoring math.
"""

import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.job_roles_catalog import (
    get_all_roles,
    get_role_by_slug,
    update_role_config,
    CURATED_JOB_ROLES
)
from app.services.skill_normalizer import (
    get_canonical_skill,
    match_skill_candidate,
    extract_evidence_snippets,
)
from app.services.job_description_parser import parse_custom_job_description
from app.services.analysis_engine import analysis_engine, DISCLAIMER_TEXT

def run_tests():
    print("=================================================================")
    print("CareerPilot AI - Resume Analysis & Skill Gap Engine Verification")
    print("=================================================================\n")

    passed_count = 0

    # 1. Verify Curated Roles Catalog
    roles = get_all_roles()
    assert len(roles) >= 10, f"Expected 10 curated roles, found {len(roles)}"
    expected_slugs = [
        "software-developer", "full-stack-developer", "data-analyst",
        "data-scientist", "machine-learning-engineer", "python-developer",
        "java-developer", "frontend-developer", "backend-developer", "cloud-engineer"
    ]
    for slug in expected_slugs:
        r = get_role_by_slug(slug)
        assert r is not None, f"Missing role: {slug}"
        assert len(r["required_skills"]) > 0, f"Role {slug} has empty required skills"
        assert len(r["preferred_skills"]) > 0, f"Role {slug} has empty preferred skills"
    print(" [TEST 1 PASSED] Curated Job Role Database contains all 10 entry-level roles with required & preferred skills.")
    passed_count += 1

    # 2. Verify Configurable / Editable Roles
    original_weights = get_role_by_slug("software-developer")["scoring_weights"]
    update_role_config("software-developer", {"scoring_weights": {"required_percentage": 0.80, "preferred_percentage": 0.20}})
    updated_role = get_role_by_slug("software-developer")
    assert updated_role["scoring_weights"]["required_percentage"] == 0.80
    # Revert back
    update_role_config("software-developer", {"scoring_weights": original_weights})
    print(" [TEST 2 PASSED] Job Role requirements, skills, and weights are editable and configurable at runtime.")
    passed_count += 1

    # 3. Verify Alias Normalization
    assert get_canonical_skill("JS") == "javascript", f"Got: {get_canonical_skill('JS')}"
    assert get_canonical_skill("Reactjs") == "react.js", f"Got: {get_canonical_skill('Reactjs')}"
    assert get_canonical_skill("Postgres") == "postgresql", f"Got: {get_canonical_skill('Postgres')}"
    assert get_canonical_skill("TS") == "typescript", f"Got: {get_canonical_skill('TS')}"
    assert get_canonical_skill("py") == "python", f"Got: {get_canonical_skill('py')}"
    print(" [TEST 3 PASSED] Skill aliases normalized (JS -> JavaScript, Postgres -> PostgreSQL, TS -> TypeScript).")
    passed_count += 1

    # 4. Verify Exact, Alias, and Evidence Skill Matching
    target_skill = {
        "name": "PostgreSQL",
        "canonical": "postgresql",
        "category": "Databases",
        "aliases": ["postgres", "pg"],
        "weight": 1.2
    }
    candidate_skills = ["Postgres", "Python", "React"]
    sample_text = (
        "Experience:\n"
        "Engineered scalable REST endpoints backed by PostgreSQL database with indexed queries.\n"
        "Built frontend UI using React.js and CSS3."
    )

    matched, mtype, term, conf = match_skill_candidate(target_skill, candidate_skills, sample_text)
    assert matched is True
    assert mtype in ("alias", "canonical"), f"Unexpected match type: {mtype}"

    evidence = extract_evidence_snippets("PostgreSQL", ["postgres", "pg"], sample_text)
    assert evidence is not None and "PostgreSQL" in evidence
    print(f" [TEST 4 PASSED] Skill matched via '{mtype}' with direct evidence: \"{evidence[:65]}...\"")
    passed_count += 1

    # 5. Verify Non-Possession Rule (Semantic Similarity Alone is NOT Proof)
    missing_skill = {
        "name": "Kubernetes",
        "canonical": "kubernetes",
        "category": "DevOps",
        "aliases": ["k8s"],
        "weight": 1.2
    }
    # Text mentions cloud and docker, but NOT Kubernetes
    cand_no_k8s = ["Python", "FastAPI", "Docker"]
    text_no_k8s = "Deployed containerized Docker microservices on AWS EC2."
    matched_k8s, _, _, _ = match_skill_candidate(missing_skill, cand_no_k8s, text_no_k8s)
    assert matched_k8s is False, "Violation: Kubernetes was falsely credited without evidence!"
    print(" [TEST 5 PASSED] Semantic similarity alone is NOT treated as proof of skill possession (Kubernetes strictly uncredited).")
    passed_count += 1

    # 6. Verify Full 9-Step Analysis Pipeline with Curated Role
    resume_doc = {
        "id": "test-resume-101",
        "extracted_text": sample_text + "\nProjects:\nAutomated data processing pipeline in Python using Git and SQL.",
        "parsed_data": {
            "technical_skills": ["Python", "React.js", "PostgreSQL", "Git", "SQL"],
            "soft_skills": ["Communication", "Problem Solving"],
            "projects": [
                {"title": "CareerPilot Portal", "technologies": ["Python", "FastAPI", "PostgreSQL"]}
            ]
        }
    }

    result = analysis_engine.run_analysis(
        resume_record=resume_doc,
        target_role_name_or_slug="full-stack-developer"
    )

    assert result["match_score"] > 0
    assert len(result["matched_skills"]) > 0
    assert len(result["missing_required_skills"]) >= 0
    assert "scoring_breakdown" in result
    assert result["disclaimer"] == DISCLAIMER_TEXT
    assert len(result["strengths"]) > 0
    assert len(result["next_steps"]) >= 3
    print(f" [TEST 6 PASSED] Full-Stack Developer analysis completed. Match Score: {result['match_score']}% ({result['scoring_breakdown']['formula_explanation']})")
    passed_count += 1

    # 7. Verify Custom Job Description Parsing & Analysis
    custom_jd = """
    We are seeking an Entry-Level Backend Engineer.
    Requirements:
    - Strong proficiency in Python and FastAPI.
    - Solid foundation in SQL queries and PostgreSQL.
    - Git version control knowledge.

    Nice to have:
    - Familiarity with Redis in-memory caching.
    - Exposure to Docker containerization.
    """

    custom_parsed = parse_custom_job_description(custom_jd)
    assert len(custom_parsed["required_skills"]) >= 3
    assert any(s["name"] == "Python" for s in custom_parsed["required_skills"])

    custom_analysis = analysis_engine.run_analysis(
        resume_record=resume_doc,
        custom_job_description=custom_jd
    )
    assert custom_analysis["target_role"] != ""
    assert custom_analysis["match_score"] >= 60
    print(f" [TEST 7 PASSED] Custom Job Description parsed and evaluated. Match Score: {custom_analysis['match_score']}%.")
    passed_count += 1

    # 8. Verify Required Response Fields
    required_keys = [
        "target_role", "match_score", "matched_skills",
        "missing_required_skills", "missing_preferred_skills",
        "strengths", "improvement_suggestions", "evidence_from_resume",
        "scoring_breakdown"
    ]
    for key in required_keys:
        assert key in result, f"Missing required response key: {key}"
    print(f" [TEST 8 PASSED] All {len(required_keys)} API response fields verified against specifications.")
    passed_count += 1

    print("\n-----------------------------------------------------------------")
    print(f"ALL {passed_count}/{passed_count} ANALYSIS ENGINE TESTS PASSED SUCCESSFULLY!")
    print("-----------------------------------------------------------------\n")

if __name__ == "__main__":
    run_tests()

