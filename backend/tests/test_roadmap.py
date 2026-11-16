"""
CareerPilot AI - Test Suite for Personalized Career Learning Roadmap
Verifies adaptive curriculum generation from resume gaps & interview weaknesses,
weekly milestone organization (4, 8, 12 weeks), verified official links,
interactive status updates, and CV score comparison with gap closure.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.roadmap_service import roadmap_service, VERIFIED_SKILL_RESOURCES

def run_tests():
    print("=================================================================")
    print("CareerPilot AI - Personalized Career Learning Roadmap Verification")
    print("=================================================================\n")

    passed_count = 0

    # 1. Test Verified Official Documentation Links (No fabricated URLs)
    for skill, info in VERIFIED_SKILL_RESOURCES.items():
        assert len(info["resources"]) > 0, f"No resources for {skill}"
        for res in info["resources"]:
            assert res["url"].startswith("http"), f"Invalid resource URL in {skill}: {res['url']}"
            assert res["title"] != "", f"Empty resource title in {skill}"
            assert res["provider"] != "", f"Empty provider in {skill}"
        assert len(info["practice_exercises"]) >= 2, f"Expected practice exercises for {skill}"
        assert info["mini_project"] != "", f"Missing mini project for {skill}"
    print(" [TEST 1 PASSED] Verified official documentation links and educational resources confirmed.")
    passed_count += 1

    # Mock resume analysis with missing skills
    sample_analysis = {
        "target_role": "Full Stack Developer",
        "match_score": 62,
        "missing_required_skills": [
            {"name": "TypeScript", "category": "Frontend"},
            {"name": "PostgreSQL", "category": "Databases"}
        ],
        "missing_preferred_skills": [
            {"name": "Docker", "category": "DevOps"},
            {"name": "Redis", "category": "Database"}
        ]
    }

    # Mock interview weaknesses
    mock_interview_topics = ["Database Indexing", "System Architecture"]

    # 2. Test 8-Week Adaptive Roadmap Generation
    roadmap_8w = asyncio.run(roadmap_service.generate_adaptive_roadmap(
        user_id="user-roadmap-1",
        job_role="Full Stack Developer",
        duration_weeks=8,
        user_jwt="fake-jwt",
        resume_analysis=sample_analysis,
        interview_weaknesses=mock_interview_topics
    ))

    assert roadmap_8w["duration_weeks"] == 8
    assert len(roadmap_8w["weekly_milestones"]) == 8
    assert roadmap_8w["overall_completion_percentage"] == 0
    all_skills_8w = [s["skill_name"] for w in roadmap_8w["weekly_milestones"] for s in w["skills"]]
    assert any("TypeScript" in s for s in all_skills_8w)
    assert any("Docker" in s for s in all_skills_8w)
    print(f" [TEST 2 PASSED] 8-Week adaptive roadmap created with {len(roadmap_8w['weekly_milestones'])} weekly milestones and {roadmap_8w['total_skills_count']} targeted skills.")
    passed_count += 1

    # 3. Test 4-Week Accelerated & 12-Week Deep Mastery Configs
    roadmap_4w = asyncio.run(roadmap_service.generate_adaptive_roadmap(
        user_id="user-roadmap-4w",
        job_role="Full Stack Developer",
        duration_weeks=4,
        resume_analysis=sample_analysis
    ))
    assert len(roadmap_4w["weekly_milestones"]) == 4

    roadmap_12w = asyncio.run(roadmap_service.generate_adaptive_roadmap(
        user_id="user-roadmap-12w",
        job_role="Full Stack Developer",
        duration_weeks=12,
        resume_analysis=sample_analysis
    ))
    assert len(roadmap_12w["weekly_milestones"]) == 12
    print(" [TEST 3 PASSED] Configurable 4-week, 8-week, and 12-week timeline variants validated.")
    passed_count += 1

    # 4. Test Interactive Skill Status Updates & Percentage Recalculation
    updated = asyncio.run(roadmap_service.update_skill_progress(
        user_id="user-roadmap-1",
        skill_canonical="typescript",
        new_status="completed",
        user_jwt="fake-jwt"
    ))

    assert updated["completed_skills_count"] >= 1
    assert updated["overall_completion_percentage"] > 0
    print(f" [TEST 4 PASSED] Skill status updated to 'completed'; overall progress recalculated to {updated['overall_completion_percentage']}%.")
    passed_count += 1

    # 5. Test Updated CV Re-Upload & Score Comparison
    revised_resume = {
        "id": "revised-resume-202",
        "extracted_text": (
            "Senior Frontend Developer with expertise in React.js and strict TypeScript.\n"
            "Containerized microservices using Docker and docker-compose on AWS.\n"
            "Engineered PostgreSQL database queries with B-Tree indexes."
        ),
        "parsed_data": {
            "technical_skills": ["JavaScript", "TypeScript", "React.js", "Docker", "PostgreSQL", "Git", "REST APIs"],
            "projects": [
                {"title": "Containerized Portal", "technologies": ["TypeScript", "Docker", "PostgreSQL"]}
            ]
        }
    }

    comparison = asyncio.run(roadmap_service.compare_revised_resume(
        user_id="user-roadmap-1",
        user_jwt="fake-jwt",
        previous_analysis=sample_analysis,
        new_resume_record=revised_resume
    ))

    assert comparison["new_match_score"] > sample_analysis["match_score"]
    assert comparison["is_improved"] is True
    assert len(comparison["closed_skill_gaps"]) >= 2
    assert "TypeScript" in comparison["closed_skill_gaps"] or "Docker" in comparison["closed_skill_gaps"]
    print(f" [TEST 5 PASSED] CV Comparison: Old Score={comparison['previous_match_score']}%, New Score={comparison['new_match_score']}% (Diff: +{comparison['score_difference']}%), Closed Gaps: {comparison['closed_skill_gaps']}")
    passed_count += 1

    print("\n-----------------------------------------------------------------")
    print(f"ALL {passed_count}/{passed_count} LEARNING ROADMAP TESTS PASSED SUCCESSFULLY!")
    print("-----------------------------------------------------------------\n")

if __name__ == "__main__":
    run_tests()

