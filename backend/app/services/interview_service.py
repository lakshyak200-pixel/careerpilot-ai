"""
CareerPilot AI - AI Mock Interview Engine & Question Generator
Generates personalized interview sequences from resume context, projects, and skill gaps.
Evaluates student responses using a multi-dimensional rubric (technical correctness,
relevance, clarity, completeness, problem-solving), triggers follow-ups, and builds final reports.
"""

import uuid
import json
import time
import re
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple
import httpx

from app.config import settings
from app.services.supabase_service import supabase_service, FAST_CONNECT_TIMEOUT
from app.services.job_roles_catalog import get_role_by_slug, CURATED_JOB_ROLES

# In-memory storage for offline / sandboxed environments
_LOCAL_INTERVIEW_SESSIONS_DB: Dict[str, Dict[str, Any]] = {}
_LOCAL_INTERVIEW_QUESTIONS_DB: Dict[str, List[Dict[str, Any]]] = {}
_LOCAL_INTERVIEW_ANSWERS_DB: Dict[str, List[Dict[str, Any]]] = {}

# Question Banks & Templates for Entry-Level Tech Roles
TECHNICAL_QUESTION_BANK: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "full-stack-developer": {
        "Beginner": [
            {
                "question": "Can you explain the difference between client-side state in React and server-side state in a database like PostgreSQL?",
                "category": "Architecture & State",
                "key_competencies": ["React State", "PostgreSQL", "Client vs Server Architecture"],
                "expected_answer": "Client state handles ephemeral UI interactions (hooks like useState/useReducer), whereas server state in PostgreSQL represents persistent, transactional business data shared across all users."
            },
            {
                "question": "How do HTTP GET and POST requests differ in terms of idempotency, payload body, and browser caching?",
                "category": "HTTP Protocols & REST",
                "key_competencies": ["REST APIs", "HTTP Methods", "Idempotency"],
                "expected_answer": "GET requests are idempotent, safe, can be cached by browsers, and parameters are passed via query strings without a request body. POST requests create new resources, are not idempotent, and pass data in the request body."
            },
            {
                "question": "What is the purpose of database indexing, and how does a B-Tree index speed up SELECT queries?",
                "category": "Databases & Query Optimization",
                "key_competencies": ["Database Indexing", "B-Tree", "SQL Optimization"],
                "expected_answer": "Indexes avoid full table sequential scans by creating a balanced search tree (B-Tree) that allows O(log N) lookup time for indexed columns."
            }
        ],
        "Intermediate": [
            {
                "question": "How do you protect a REST API endpoint against common web vulnerabilities like SQL injection, Cross-Site Scripting (XSS), and unauthorized JWT forgery?",
                "category": "Security & Authentication",
                "key_competencies": ["JWT Security", "SQL Injection", "XSS Mitigation", "Parameterized Queries"],
                "expected_answer": "Prevent SQL injection using parameterized queries/ORMs, sanitize HTML outputs and use HTTP-only cookies to thwart XSS, and sign/verify JWTs using secure cryptographic secrets with expiration claims."
            },
            {
                "question": "In React, how does the Virtual DOM reconciliation algorithm work, and when should you use useCallback vs useMemo to prevent performance bottlenecks?",
                "category": "Frontend Performance",
                "key_competencies": ["React Virtual DOM", "useCallback", "useMemo", "Render Optimization"],
                "expected_answer": "React diffs the Virtual DOM tree against the actual DOM to minimize layout repaints. useMemo memoizes computed values, while useCallback memoizes function instances to avoid re-rendering memoized child components."
            },
            {
                "question": "Explain database transactions using the ACID properties. What happens during a deadlock, and how would you resolve it?",
                "category": "Databases & Transactions",
                "key_competencies": ["ACID Properties", "PostgreSQL Deadlocks", "Concurrency Control"],
                "expected_answer": "ACID stands for Atomicity, Consistency, Isolation, and Durability. A deadlock occurs when two transactions hold locks and wait on each other; it is resolved by ordering lock acquisition, row-level locking, and transaction timeouts."
            }
        ],
        "Advanced": [
            {
                "question": "Design a distributed real-time notification service capable of broadcasting push updates to 100,000 concurrent web users. What message queue and transport protocol would you choose?",
                "category": "System Design & Distributed Systems",
                "key_competencies": ["System Design", "WebSockets", "Redis Pub/Sub", "Scalability"],
                "expected_answer": "Utilize WebSockets for bidirectional low-latency delivery, backed by a horizontal fleet of connection servers synchronized via a Redis Pub/Sub or Kafka cluster to route events to the correct user socket connection."
            },
            {
                "question": "How would you optimize a high-traffic database table with 50 million records where query latency has degraded? Discuss partitioning, read-replicas, and connection pooling.",
                "category": "Database Engineering",
                "key_competencies": ["Table Partitioning", "Read Replicas", "PgBouncer", "Query Optimization"],
                "expected_answer": "Implement range or hash partitioning on timestamp/user_id, route read queries to read-replicas, use a connection pooler like PgBouncer, and review EXPLAIN ANALYZE execution plans to prune unindexed table scans."
            }
        ]
    },
    "software-developer": {
        "Beginner": [
            {
                "question": "Explain the four core principles of Object-Oriented Programming (OOP) and give an example of Polymorphism in Python or Java.",
                "category": "OOP & CS Fundamentals",
                "key_competencies": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
                "expected_answer": "The four pillars are Encapsulation (data hiding), Abstraction (hiding implementation details), Inheritance (reusing code), and Polymorphism (overriding methods to allow different classes to respond to the same interface)."
            },
            {
                "question": "What is the time and space complexity of searching for an element in an unsorted array vs a hash map?",
                "category": "Data Structures & Algorithms",
                "key_competencies": ["Time Complexity", "Hash Maps", "Big O Notation"],
                "expected_answer": "Searching an unsorted array requires O(N) linear time and O(1) space, whereas a hash map provides average-case O(1) constant time lookup via hash functions, requiring O(N) space."
            }
        ],
        "Intermediate": [
            {
                "question": "Can you explain the difference between a process and a thread? How do you prevent race conditions when multiple threads access shared memory?",
                "category": "Operating Systems & Concurrency",
                "key_competencies": ["Concurrency", "Multithreading", "Mutex Locks", "Race Conditions"],
                "expected_answer": "A process has its own isolated address space, while threads within a process share memory and heap space. Prevent race conditions by using synchronization primitives such as mutexes, semaphores, or atomic operations."
            },
            {
                "question": "Explain how Git handles merge conflicts under the hood. What is the difference between git merge and git rebase?",
                "category": "Tooling & Version Control",
                "key_competencies": ["Git Workflow", "Rebase vs Merge", "Commit History"],
                "expected_answer": "Git merge creates a dedicated 3-way merge commit preserving history branch geometry, whereas git rebase rewrites the commit history by replaying local commits on top of the base branch for a linear log."
            }
        ],
        "Advanced": [
            {
                "question": "How would you design a rate limiter for an API that limits each client IP to 100 requests per minute? Compare Token Bucket with Leaky Bucket algorithms.",
                "category": "System Design",
                "key_competencies": ["Rate Limiting", "Token Bucket", "Redis", "Distributed Throttling"],
                "expected_answer": "Token bucket refills tokens at a constant rate allowing bursts up to bucket capacity, while leaky bucket processes requests at a strictly constant rate. In production, Redis with atomic Lua scripts or sliding window logs provides distributed enforcement."
            }
        ]
    }
}

BEHAVIORAL_QUESTION_BANK = [
    {
        "question": "Tell me about a challenging technical bug or problem you encountered during a project. Walk me through how you diagnosed it and arrived at the solution.",
        "category": "Problem Solving & Debugging",
        "key_competencies": ["Root Cause Analysis", "Debugging Methodology", "Resilience"],
        "expected_answer": "The candidate should clearly frame the situation, tools used to diagnose (logs, profiler, breakpoints), isolation of root cause, verification of fix, and preventative testing."
    },
    {
        "question": "Describe a situation where you had to work with a teammate whose coding style or opinions differed from yours. How did you resolve the disagreement?",
        "category": "Collaboration & Conflict Resolution",
        "key_competencies": ["Constructive Feedback", "Empathy", "Team Alignment"],
        "expected_answer": "Demonstrates focus on objective facts, benchmarks, and project goals rather than personal pride, seeking consensus or consulting established team standards."
    },
    {
        "question": "Tell me about a time you had to learn a completely new framework or tool within a tight deadline. How did you organize your learning?",
        "category": "Adaptability & Growth Mindset",
        "key_competencies": ["Fast Learner", "Prioritization", "Resourcefulness"],
        "expected_answer": "Candidate highlights reading official documentation, building a quick minimal proof of concept, understanding core architecture before edge cases, and meeting the delivery goal."
    },
    {
        "question": "Can you give an example of when a project requirements or scope changed abruptly? How did you prioritize your deliverables?",
        "category": "Agility & Communication",
        "key_competencies": ["Agile Flexibility", "Expectation Management", "Time Management"],
        "expected_answer": "Candidate demonstrates calm prioritization, breaking new scope into MVP milestones, and maintaining proactive communication with stakeholders."
    }
]

HR_QUESTION_BANK = [
    {
        "question": "Why are you interested in pursuing a career in this job role, and what motivated you to specialize in software engineering?",
        "category": "Career Motivation & Fit",
        "key_competencies": ["Passion", "Career Vision", "Self-Motivation"],
        "expected_answer": "Coherent narrative connecting coursework, curiosity, hands-on projects, and genuine enthusiasm for building impactful digital products."
    },
    {
        "question": "Where do you see your technical skills progressing over the next two years, and what steps are you actively taking toward that goal?",
        "category": "Professional Development",
        "key_competencies": ["Goal Orientation", "Continuous Learning", "Self-Awareness"],
        "expected_answer": "Specific technical roadmap (e.g., mastering system design, cloud certifications, contributing to open source, or taking ownership of microservices)."
    },
    {
        "question": "How do you handle constructive criticism or harsh code review feedback from seniors?",
        "category": "Receptiveness & Growth",
        "key_competencies": ["Openness to Feedback", "Professionalism", "Continuous Improvement"],
        "expected_answer": "Viewing code reviews as an opportunity for learning, decoupling ego from code, asking clarifying questions, and applying learnings consistently."
    }
]

class MockInterviewService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.model_name = settings.LLM_MODEL

    async def generate_interview_sequence(
        self,
        job_role: str,
        interview_type: str,
        difficulty: str,
        question_count: int,
        resume_record: Optional[Dict[str, Any]] = None,
        resume_analysis: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes a curated list of questions customized to the student's
        resume projects, skills, and detected skill gaps.
        """
        role_slug = job_role.lower().replace(" ", "-")
        questions: List[Dict[str, Any]] = []

        parsed_data = (resume_record or {}).get("parsed_data", {})
        projects = parsed_data.get("projects", [])
        technical_skills = parsed_data.get("technical_skills", [])
        work_exp = parsed_data.get("work_experience", []) + parsed_data.get("internship_experience", [])

        # Retrieve skill gaps from analysis if present
        missing_skills = []
        if resume_analysis:
            missing_skills = [
                s.get("name") for s in resume_analysis.get("missing_required_skills", [])
            ]

        # 1. Generate Resume-Based Questions if requested or Mixed
        if interview_type.lower() in ("resume-based", "mixed", "technical") and (projects or work_exp):
            if projects:
                proj = projects[0]
                title = proj.get("title", "your capstone application")
                techs = ", ".join(proj.get("technologies", [])[:3]) or "your tech stack"
                questions.append({
                    "question_text": (
                        f"In your resume, you highlighted building '{title}' using {techs}. "
                        "Can you walk me through the system architecture, how you structured data flow, "
                        "and what the most challenging technical decision was?"
                    ),
                    "category": "Resume Project Deep-Dive",
                    "question_type": "technical",
                    "key_competencies": ["System Architecture", "Project Ownership", "Engineering Trade-offs"],
                    "expected_answer": (
                        f"Detailed explanation of {title} architecture, component/module breakdown, "
                        f"justification for choosing {techs}, and clear description of trade-offs made during development."
                    )
                })

            if len(projects) > 1:
                proj2 = projects[1]
                title2 = proj2.get("title", "another project")
                questions.append({
                    "question_text": (
                        f"Regarding your project '{title2}', how did you ensure test coverage, handle unexpected errors, "
                        "and what metrics or feedback proved it was successful?"
                    ),
                    "category": "Testing & Project Verification",
                    "question_type": "technical",
                    "key_competencies": ["Unit Testing", "Error Handling", "Validation"],
                    "expected_answer": "Clear articulation of testing strategy, exception handling boundaries, and measurable outcomes."
                })

            # Probing identified skill gaps
            if missing_skills:
                gap = missing_skills[0]
                questions.append({
                    "question_text": (
                        f"While reviewing your technical background, we noticed strong foundations in {', '.join(technical_skills[:3]) or 'software development'}. "
                        f"In modern {job_role} roles, proficiency in {gap} is critical. How would you approach adopting or architecting with {gap}?"
                    ),
                    "category": "Skill Gap & Fast Learning",
                    "question_type": "technical",
                    "key_competencies": [gap, "Technical Adaptability", "System Integration"],
                    "expected_answer": f"Clear conceptual understanding of {gap}, why it is used, and a pragmatic roadmap for incorporating it into real applications."
                })

        # 2. Add Core Technical Questions
        role_bank = TECHNICAL_QUESTION_BANK.get(role_slug, TECHNICAL_QUESTION_BANK["software-developer"])
        diff_questions = role_bank.get(difficulty, role_bank.get("Intermediate", []))
        
        for q in diff_questions:
            if len(questions) < question_count:
                questions.append({
                    "question_text": q["question"],
                    "category": q["category"],
                    "question_type": "technical",
                    "key_competencies": q["key_competencies"],
                    "expected_answer": q["expected_answer"]
                })

        # 3. Add Behavioral / HR Questions if applicable
        if interview_type.lower() in ("behavioral", "mixed", "hr"):
            pool = HR_QUESTION_BANK if interview_type.lower() == "hr" else BEHAVIORAL_QUESTION_BANK
            for b_q in pool:
                if len(questions) < question_count:
                    questions.append({
                        "question_text": b_q["question"],
                        "category": b_q["category"],
                        "question_type": "behavioral",
                        "key_competencies": b_q["key_competencies"],
                        "expected_answer": b_q["expected_answer"]
                    })

        # 4. Fill remaining questions if count is higher (e.g. 10 or 15)
        generic_fillers = [
            {
                "question_text": "How do you approach debugging a high-latency issue when an endpoint takes 4 seconds to respond in production?",
                "category": "Debugging & Performance",
                "question_type": "technical",
                "key_competencies": ["Profiling", "Database Queries", "Logging", "APM Tools"],
                "expected_answer": "Check network waterfall, inspect server logs, check DB query execution times with EXPLAIN, and isolate slow synchronous operations."
            },
            {
                "question_text": "What are the advantages and drawbacks of a microservices architecture compared to a monolithic structure for an early-stage startup?",
                "category": "System Architecture",
                "question_type": "technical",
                "key_competencies": ["Microservices vs Monolith", "Operational Overhead", "Scalability"],
                "expected_answer": "Monoliths offer rapid iteration, simpler deployment, and lower operational overhead. Microservices enable independent scaling and tech stack freedom at the cost of distributed complexity and network latency."
            },
            {
                "question_text": "Can you walk me through your personal process for conducting code reviews? What do you look for beyond formatting and syntax?",
                "category": "Engineering Rigor",
                "question_type": "technical",
                "key_competencies": ["Code Reviews", "Edge Cases", "Maintainability"],
                "expected_answer": "Check architectural fit, security implications, edge case handling, test coverage, readability, and performance."
            }
        ]

        for filler in generic_fillers:
            if len(questions) < question_count:
                questions.append(filler)

        # Truncate to exact requested question count
        return questions[:question_count]

    async def evaluate_answer(
        self,
        question_dict: Dict[str, Any],
        student_answer: str,
        job_role: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """
        Evaluates the student's response across 5 core dimensions:
        - Technical correctness
        - Relevance
        - Clarity
        - Completeness
        - Problem-solving approach
        """
        cleaned_answer = student_answer.strip()
        word_count = len(cleaned_answer.split())
        question_text = question_dict.get("question_text", "")
        expected = question_dict.get("expected_answer", "")
        competencies = question_dict.get("key_competencies", [])

        # Heuristic / Rule-Based Rubric Baseline
        tech_score = 6.0
        clarity_score = 6.0
        relevance_score = 6.0
        completeness_score = 6.0

        matched_comps = []
        lower_ans = cleaned_answer.lower()
        for comp in competencies:
            comp_clean = comp.lower()
            if any(term in lower_ans for term in comp_clean.split()):
                matched_comps.append(comp)

        # Reward length and depth
        if word_count < 15:
            tech_score = 4.0
            clarity_score = 5.0
            completeness_score = 3.5
            relevance_score = 5.0
        elif 15 <= word_count < 45:
            tech_score = 6.5
            clarity_score = 7.0
            completeness_score = 6.0
            relevance_score = 7.0
        elif 45 <= word_count <= 180:
            tech_score = 8.5
            clarity_score = 9.0
            completeness_score = 8.5
            relevance_score = 8.8
        else:
            tech_score = 8.8
            clarity_score = 8.0
            completeness_score = 9.0
            relevance_score = 8.5

        # Reward verified competency mentions
        if competencies:
            comp_ratio = len(matched_comps) / len(competencies)
            tech_score = min(10.0, tech_score + (comp_ratio * 1.5))
            completeness_score = min(10.0, completeness_score + (comp_ratio * 1.5))

        overall_question_score = round(
            (0.35 * tech_score) + (0.25 * completeness_score) + (0.20 * clarity_score) + (0.20 * relevance_score),
            1
        )
        overall_question_score = max(1.0, min(10.0, overall_question_score))

        # Generate strengths & improvement feedback
        strengths = []
        improvements = []

        if len(matched_comps) > 0:
            strengths.append(f"Directly addressed core competencies: {', '.join(matched_comps)}.")
        if word_count >= 40:
            strengths.append("Provided a thorough, structured explanation with practical context.")
        else:
            strengths.append("Addressed the question directly without unnecessary filler.")

        if word_count < 30:
            improvements.append("Expand on your technical reasoning. Mention specific real-world examples or trade-offs.")
        if len(matched_comps) < len(competencies):
            unmentioned = [c for c in competencies if c not in matched_comps]
            if unmentioned:
                improvements.append(f"Consider touching upon {', '.join(unmentioned[:2])} for maximum completeness.")

        # Trigger follow-up if answer is brief or misses critical detail
        follow_up = None
        if word_count < 35 and overall_question_score < 7.5:
            follow_up = (
                f"Could you elaborate on the practical trade-offs or a specific scenario where you implemented this in {job_role}?"
            )

        feedback_summary = (
            f"Score: {overall_question_score}/10. "
            f"Your response demonstrated good foundational understanding. "
            f"{' '.join(improvements) if improvements else 'Excellent clarity and depth.'}"
        )

        return {
            "score": overall_question_score,
            "technical_score": round(tech_score, 1),
            "clarity_score": round(clarity_score, 1),
            "relevance_score": round(relevance_score, 1),
            "completeness_score": round(completeness_score, 1),
            "feedback": feedback_summary,
            "strengths": " ".join(strengths),
            "areas_for_improvement": " ".join(improvements) if improvements else "Keep maintaining this structured answering technique.",
            "suggested_improved_answer": expected or "Structure your answer using: 1) High-level definition, 2) Technical mechanics, 3) Real-world application, and 4) Trade-offs.",
            "follow_up_question": follow_up
        }

    async def create_session(
        self,
        user_id: str,
        job_role: str,
        interview_type: str,
        difficulty: str,
        question_count: int,
        user_jwt: str,
        resume_record: Optional[Dict[str, Any]] = None,
        resume_analysis: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Creates a new mock interview session and pre-generates question sequence.
        """
        session_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        # Generate custom questions based on resume & role
        raw_questions = await self.generate_interview_sequence(
            job_role=job_role,
            interview_type=interview_type,
            difficulty=difficulty,
            question_count=question_count,
            resume_record=resume_record,
            resume_analysis=resume_analysis
        )

        session_record = {
            "id": session_id,
            "user_id": user_id,
            "job_role": job_role,
            "interview_type": interview_type,
            "difficulty": difficulty,
            "status": "in_progress",
            "overall_score": None,
            "duration_seconds": 0,
            "summary_feedback": "",
            "total_questions": len(raw_questions),
            "created_at": created_at
        }

        # Format questions with UUIDs
        formatted_questions = []
        for idx, q in enumerate(raw_questions):
            q_id = str(uuid.uuid4())
            formatted_questions.append({
                "id": q_id,
                "session_id": session_id,
                "question_order": idx + 1,
                "question_text": q["question_text"],
                "question_type": q.get("question_type", "technical"),
                "category": q.get("category", "General"),
                "key_competencies": q.get("key_competencies", []),
                "expected_answer": q.get("expected_answer", "")
            })

        # Save to Supabase
        if supabase_service.is_remote_available():
            headers = supabase_service._get_headers(user_jwt)
            try:
                # Insert session
                db_url = f"{supabase_service.base_url}/rest/v1/interview_sessions"
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.post(db_url, json={
                        "id": session_id,
                        "user_id": user_id,
                        "interview_type": interview_type.lower() if interview_type.lower() in ('technical', 'behavioral', 'mixed') else 'mixed',
                        "difficulty": difficulty.lower() if difficulty.lower() in ('easy', 'medium', 'hard') else 'medium',
                        "status": "in_progress",
                        "summary_feedback": f"Role: {job_role} | Type: {interview_type}"
                    }, headers=headers)

                # Insert questions
                q_url = f"{supabase_service.base_url}/rest/v1/interview_questions"
                q_payload = [
                    {
                        "id": q["id"],
                        "session_id": session_id,
                        "question_text": q["question_text"],
                        "expected_answer": q["expected_answer"],
                        "question_type": q["question_type"],
                        "question_order": q["question_order"],
                        "key_competencies": q["key_competencies"]
                    }
                    for q in formatted_questions
                ]
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.post(q_url, json=q_payload, headers=headers)
            except Exception:
                supabase_service.mark_remote_unavailable()

        # Cache in local storage fallback
        _LOCAL_INTERVIEW_SESSIONS_DB[session_id] = session_record
        _LOCAL_INTERVIEW_QUESTIONS_DB[session_id] = formatted_questions
        _LOCAL_INTERVIEW_ANSWERS_DB[session_id] = []

        return session_record

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        return _LOCAL_INTERVIEW_SESSIONS_DB.get(session_id)

    async def get_questions_for_session(self, session_id: str) -> List[Dict[str, Any]]:
        return _LOCAL_INTERVIEW_QUESTIONS_DB.get(session_id, [])

    async def record_answer(
        self,
        session_id: str,
        question_id: str,
        user_answer: str,
        user_id: str,
        user_jwt: str,
        time_spent_seconds: int = 0
    ) -> Dict[str, Any]:
        """
        Evaluates the student's answer and persists it in Supabase / cache.
        """
        questions = await self.get_questions_for_session(session_id)
        current_q = next((q for q in questions if q["id"] == question_id), None)
        if not current_q:
            raise ValueError(f"Question ID {question_id} not found in session.")

        session_record = await self.get_session(session_id) or {}
        job_role = session_record.get("job_role", "Software Developer")
        difficulty = session_record.get("difficulty", "Intermediate")

        # Run Rubric Evaluation
        evaluation = await self.evaluate_answer(
            question_dict=current_q,
            student_answer=user_answer,
            job_role=job_role,
            difficulty=difficulty
        )

        answer_id = str(uuid.uuid4())
        answer_record = {
            "id": answer_id,
            "session_id": session_id,
            "question_id": question_id,
            "user_answer": user_answer,
            "score": evaluation["score"],
            "technical_score": evaluation["technical_score"],
            "clarity_score": evaluation["clarity_score"],
            "relevance_score": evaluation["relevance_score"],
            "completeness_score": evaluation["completeness_score"],
            "feedback": evaluation["feedback"],
            "strengths": evaluation["strengths"],
            "areas_for_improvement": evaluation["areas_for_improvement"],
            "suggested_improved_answer": evaluation["suggested_improved_answer"],
            "time_spent_seconds": time_spent_seconds,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # Store in Supabase
        if supabase_service.is_remote_available():
            headers = supabase_service._get_headers(user_jwt)
            try:
                db_url = f"{supabase_service.base_url}/rest/v1/interview_answers"
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.post(db_url, json={
                        "id": answer_id,
                        "session_id": session_id,
                        "question_id": question_id,
                        "user_answer": user_answer,
                        "score": evaluation["score"],
                        "feedback": evaluation["feedback"],
                        "strengths": evaluation["strengths"],
                        "areas_for_improvement": evaluation["areas_for_improvement"]
                    }, headers=headers)
            except Exception:
                supabase_service.mark_remote_unavailable()

        # Update Local Cache
        if session_id not in _LOCAL_INTERVIEW_ANSWERS_DB:
            _LOCAL_INTERVIEW_ANSWERS_DB[session_id] = []
        _LOCAL_INTERVIEW_ANSWERS_DB[session_id].append(answer_record)

        # Update Session duration
        if session_id in _LOCAL_INTERVIEW_SESSIONS_DB:
            _LOCAL_INTERVIEW_SESSIONS_DB[session_id]["duration_seconds"] += time_spent_seconds

        answered_count = len(_LOCAL_INTERVIEW_ANSWERS_DB[session_id])
        is_last = answered_count >= len(questions)

        return {
            "answer_id": answer_id,
            "session_id": session_id,
            "question_id": question_id,
            "score": evaluation["score"],
            "technical_score": evaluation["technical_score"],
            "clarity_score": evaluation["clarity_score"],
            "relevance_score": evaluation["relevance_score"],
            "completeness_score": evaluation["completeness_score"],
            "feedback": evaluation["feedback"],
            "strengths": evaluation["strengths"],
            "areas_for_improvement": evaluation["areas_for_improvement"],
            "suggested_improved_answer": evaluation["suggested_improved_answer"],
            "follow_up_question": evaluation.get("follow_up_question"),
            "is_last_question": is_last,
            "next_question_number": (answered_count + 1) if not is_last else None
        }

    async def generate_final_report(
        self,
        session_id: str,
        user_id: str,
        user_jwt: str
    ) -> Dict[str, Any]:
        """
        Synthesizes the comprehensive final interview report.
        """
        session_record = await self.get_session(session_id)
        if not session_record:
            raise ValueError("Session not found.")

        questions = await self.get_questions_for_session(session_id)
        answers = _LOCAL_INTERVIEW_ANSWERS_DB.get(session_id, [])

        # Aggregate scores
        if answers:
            avg_score_10 = sum(a.get("score", 0.0) for a in answers) / len(answers)
            avg_tech_10 = sum(a.get("technical_score", 0.0) for a in answers) / len(answers)
            avg_clarity_10 = sum(a.get("clarity_score", 0.0) for a in answers) / len(answers)
            avg_comp_10 = sum(a.get("completeness_score", 0.0) for a in answers) / len(answers)
        else:
            avg_score_10 = 0.0
            avg_tech_10 = 0.0
            avg_clarity_10 = 0.0
            avg_comp_10 = 0.0

        overall_score_100 = round(avg_score_10 * 10, 1)
        tech_score_100 = round(avg_tech_10 * 10, 1)
        clarity_score_100 = round(avg_clarity_10 * 10, 1)

        # Build question feedback list
        q_feedback_list = []
        strong_answers = []
        weak_answers = []
        topics_to_revise = set()

        for a in answers:
            q_match = next((q for q in questions if q["id"] == a["question_id"]), None)
            q_text = q_match["question_text"] if q_match else "Interview Question"
            q_order = q_match.get("question_order", 1) if q_match else 1
            q_type = q_match.get("question_type", "technical") if q_match else "technical"
            comps = q_match.get("key_competencies", []) if q_match else []

            score = a.get("score", 7.0)
            if score >= 8.0:
                strong_answers.append(f"Q{q_order}: Strong grasp demonstrated on {q_match.get('category', 'core topic')}.")
            elif score < 7.0:
                weak_answers.append(f"Q{q_order}: Shallow explanation on {q_match.get('category', 'technical question')}.")
                for c in comps:
                    topics_to_revise.add(c)

            q_feedback_list.append({
                "question_id": a["question_id"],
                "question_order": q_order,
                "question_text": q_text,
                "question_type": q_type,
                "user_answer": a.get("user_answer", ""),
                "score": score,
                "feedback": a.get("feedback", ""),
                "strengths": a.get("strengths", ""),
                "areas_for_improvement": a.get("areas_for_improvement", ""),
                "suggested_improved_answer": a.get("suggested_improved_answer", "")
            })

        q_feedback_list.sort(key=lambda x: x["question_order"])

        # Fallback topics if none specifically marked weak
        if not topics_to_revise:
            topics_to_revise = {"System Design Trade-offs", "Edge Case Testing", "Query Optimization"}

        # Recommended Next Interview
        current_diff = session_record.get("difficulty", "Intermediate")
        role = session_record.get("job_role", "Software Developer")
        if overall_score_100 >= 80:
            next_diff = "Advanced" if current_diff != "Advanced" else "Advanced"
            next_type = "System Design & Architecture"
            rationale = "You demonstrated strong mastery! Elevate to Advanced System Design to challenge scalability and distributed systems."
        elif overall_score_100 >= 60:
            next_diff = "Intermediate"
            next_type = "Technical Deep-Dive"
            rationale = "Solid performance. Review the flagged improvement topics and practice an Intermediate Technical session."
        else:
            next_diff = "Beginner"
            next_type = "Core Fundamentals"
            rationale = "Focus on reinforcing core CS fundamentals and expanding your project answers using the STAR method."

        report = {
            "session_id": session_id,
            "job_role": role,
            "interview_type": session_record.get("interview_type", "Mixed"),
            "difficulty": current_diff,
            "overall_score": overall_score_100,
            "technical_knowledge_score": tech_score_100,
            "communication_clarity_score": clarity_score_100,
            "duration_seconds": session_record.get("duration_seconds", 0),
            "total_questions": len(questions),
            "questions_feedback": q_feedback_list,
            "strong_answers": strong_answers or ["Consistent, clear communication across questions."],
            "weak_answers": weak_answers or ["No critical failure points detected."],
            "topics_to_revise": sorted(list(topics_to_revise)),
            "recommended_next_interview": {
                "job_role": role,
                "difficulty": next_diff,
                "interview_type": next_type,
                "rationale": rationale
            },
            "summary_feedback": (
                f"Overall Performance: {overall_score_100}/100. "
                f"Technical Score: {tech_score_100}%. Communication Score: {clarity_score_100}%. "
                f"Completed {len(answers)} of {len(questions)} questions."
            ),
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        # Update Session in Supabase
        session_record["status"] = "completed"
        session_record["overall_score"] = overall_score_100
        session_record["completed_at"] = report["created_at"]
        session_record["report"] = report

        if supabase_service.is_remote_available():
            headers = supabase_service._get_headers(user_jwt)
            try:
                db_url = f"{supabase_service.base_url}/rest/v1/interview_sessions?id=eq.{session_id}"
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.patch(db_url, json={
                        "status": "completed",
                        "overall_score": overall_score_100,
                        "duration_seconds": session_record["duration_seconds"],
                        "summary_feedback": report["summary_feedback"],
                        "completed_at": report["created_at"]
                    }, headers=headers)
            except Exception:
                supabase_service.mark_remote_unavailable()

        # Log Activity
        await supabase_service.log_activity(
            user_id=user_id,
            activity_type="INTERVIEW_COMPLETED",
            metadata={"session_id": session_id, "score": overall_score_100, "role": role},
            user_jwt=user_jwt
        )

        return report

    async def list_user_sessions(self, user_id: str, user_jwt: str) -> List[Dict[str, Any]]:
        """
        Retrieves previous interview sessions for the authenticated student.
        """
        results = [
            s for s in _LOCAL_INTERVIEW_SESSIONS_DB.values()
            if s.get("user_id") == user_id
        ]
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

interview_service = MockInterviewService()

