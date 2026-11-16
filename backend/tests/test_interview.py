"""
CareerPilot AI - Test Suite for AI Mock Interview Module
Verifies question generation from resume context & skill gaps,
multi-dimensional rubric evaluation, follow-up questions, security
(no expected answer leaked), and final report generation.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.interview_service import interview_service

def run_tests():
    print("=================================================================")
    print("CareerPilot AI - AI Mock Interview Module Verification")
    print("=================================================================\n")

    passed_count = 0

    # Mock resume and analysis
    sample_resume = {
        "id": "resume-mock-1",
        "parsed_data": {
            "technical_skills": ["Python", "FastAPI", "PostgreSQL", "React.js"],
            "projects": [
                {
                    "title": "E-Commerce Microservices",
                    "technologies": ["Python", "FastAPI", "PostgreSQL"],
                    "description": "Engineered REST APIs with JWT authentication."
                }
            ]
        }
    }

    sample_analysis = {
        "missing_required_skills": [
            {"name": "Docker", "category": "DevOps"},
            {"name": "TypeScript", "category": "Frontend"}
        ]
    }

    # 1. Test Question Generation (Resume-Based + Skill Gap Probing)
    questions = asyncio.run(interview_service.generate_interview_sequence(
        job_role="Full Stack Developer",
        interview_type="Mixed",
        difficulty="Intermediate",
        question_count=5,
        resume_record=sample_resume,
        resume_analysis=sample_analysis
    ))

    assert len(questions) == 5, f"Expected 5 questions, got {len(questions)}"
    # Check if project or skill gap is mentioned in questions
    has_project_q = any("E-Commerce Microservices" in q["question_text"] for q in questions)
    has_gap_q = any("Docker" in q["question_text"] or "TypeScript" in q["question_text"] for q in questions)
    assert has_project_q, "Expected a question tailored to the student's project 'E-Commerce Microservices'"
    assert has_gap_q, "Expected a question probing the student's skill gap (Docker / TypeScript)"
    print(" [TEST 1 PASSED] Generated interview questions customized to resume projects and detected skill gaps.")
    passed_count += 1

    # 2. Test Session Creation
    session = asyncio.run(interview_service.create_session(
        user_id="user-test-1",
        job_role="Full Stack Developer",
        interview_type="Mixed",
        difficulty="Intermediate",
        question_count=5,
        user_jwt="fake-jwt",
        resume_record=sample_resume,
        resume_analysis=sample_analysis
    ))
    session_id = session["id"]
    assert session_id is not None
    assert session["status"] == "in_progress"
    print(f" [TEST 2 PASSED] Interview session created with ID: {session_id}")
    passed_count += 1

    # 3. Test Security Check (Expected Answer Hidden from Student Pre-Submission)
    session_qs = asyncio.run(interview_service.get_questions_for_session(session_id))
    first_q = session_qs[0]
    # In public API schemas, expected_answer is not returned in QuestionResponse
    from app.schemas.interview import QuestionResponse
    public_q = QuestionResponse(
        session_id=session_id,
        question_id=first_q["id"],
        question_text=first_q["question_text"],
        question_type=first_q["question_type"],
        question_number=1,
        total_questions=len(session_qs),
        difficulty=session["difficulty"],
        category=first_q.get("category", "General"),
        key_competencies=first_q.get("key_competencies", [])
    )
    assert not hasattr(public_q, "expected_answer"), "Security violation: expected_answer exposed in QuestionResponse schema!"
    print(" [TEST 3 PASSED] Expected answer securely withheld prior to answer submission.")
    passed_count += 1

    # 4. Test Multi-Dimensional Rubric Evaluation (Good Answer)
    good_answer = (
        "In the E-Commerce Microservices project, I designed a modular layered architecture using FastAPI and PostgreSQL. "
        "For data flow, requests authenticated via JWT are validated with Pydantic schemas, processed by service modules, "
        "and written to PostgreSQL using connection pooling with SQLAlchemy. The hardest decision was balancing async endpoints "
        "with transactional consistency, which we solved using scoped sessions."
    )
    eval_result = asyncio.run(interview_service.record_answer(
        session_id=session_id,
        question_id=first_q["id"],
        user_answer=good_answer,
        user_id="user-test-1",
        user_jwt="fake-jwt",
        time_spent_seconds=45
    ))

    assert eval_result["score"] >= 7.5, f"Expected score >= 7.5 for thorough answer, got {eval_result['score']}"
    assert eval_result["technical_score"] > 7.0
    assert eval_result["clarity_score"] > 7.0
    assert eval_result["suggested_improved_answer"] is not None
    print(f" [TEST 4 PASSED] Answer evaluated: Overall Score={eval_result['score']}/10, Tech={eval_result['technical_score']}/10, Clarity={eval_result['clarity_score']}/10")
    passed_count += 1

    # 5. Test Brief Answer & Follow-up Question Trigger
    second_q = session_qs[1]
    brief_answer = "I just wrote the code in Python."
    eval_brief = asyncio.run(interview_service.record_answer(
        session_id=session_id,
        question_id=second_q["id"],
        user_answer=brief_answer,
        user_id="user-test-1",
        user_jwt="fake-jwt",
        time_spent_seconds=10
    ))
    assert eval_brief["score"] <= 6.0, f"Expected low score for brief answer, got {eval_brief['score']}"
    assert eval_brief["follow_up_question"] is not None, "Expected follow-up question triggered for brief answer"
    print(f" [TEST 5 PASSED] Dynamic follow-up triggered for shallow response: \"{eval_brief['follow_up_question']}\"")
    passed_count += 1

    # 6. Answer remaining questions to complete interview
    for q in session_qs[2:]:
        asyncio.run(interview_service.record_answer(
            session_id=session_id,
            question_id=q["id"],
            user_answer="We followed best practices for testing, modular design, and team code reviews to guarantee reliability.",
            user_id="user-test-1",
            user_jwt="fake-jwt",
            time_spent_seconds=25
        ))

    # 7. Test Final Report Generation
    report = asyncio.run(interview_service.generate_final_report(
        session_id=session_id,
        user_id="user-test-1",
        user_jwt="fake-jwt"
    ))

    assert "overall_score" in report
    assert "technical_knowledge_score" in report
    assert "communication_clarity_score" in report
    assert len(report["questions_feedback"]) == 5
    assert len(report["strong_answers"]) > 0
    assert len(report["topics_to_revise"]) > 0
    assert "recommended_next_interview" in report
    print(f" [TEST 6 PASSED] Final Report Generated: Overall Score={report['overall_score']}/100, Tech={report['technical_knowledge_score']}/100, Clarity={report['communication_clarity_score']}/100")
    passed_count += 1

    # 8. Test User History Retrieval
    history = asyncio.run(interview_service.list_user_sessions("user-test-1", "fake-jwt"))
    assert len(history) >= 1
    assert history[0]["status"] == "completed"
    print(f" [TEST 7 PASSED] Interview session history verified (Found {len(history)} session(s)).")
    passed_count += 1

    print("\n-----------------------------------------------------------------")
    print(f"ALL {passed_count}/{passed_count} MOCK INTERVIEW TESTS PASSED SUCCESSFULLY!")
    print("-----------------------------------------------------------------\n")

if __name__ == "__main__":
    run_tests()

