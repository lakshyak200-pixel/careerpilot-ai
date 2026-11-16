"""
CareerPilot AI - Personalized Career Learning Roadmap Engine
Generates adaptive, weekly milestone-based curriculums based on student's
target job role, resume analysis (missing skills), and mock interview weaknesses.
Includes verified official documentation, hands-on exercises, and CV score comparison.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.services.supabase_service import supabase_service, FAST_CONNECT_TIMEOUT
from app.services.job_roles_catalog import get_role_by_slug, CURATED_JOB_ROLES
from app.services.analysis_engine import analysis_engine

# In-memory storage cache for roadmaps
_LOCAL_ROADMAPS_DB: Dict[str, Dict[str, Any]] = {}

# Verified Official Educational Documentation & Resources
# Rule: Only verified official documentation and trusted non-paywalled portals. No fabricated URLs.
VERIFIED_SKILL_RESOURCES: Dict[str, Dict[str, Any]] = {
    "typescript": {
        "description": "Typed superset of JavaScript providing compile-time type safety, interfaces, and scalable frontend/backend architecture.",
        "why_important": "Over 80% of enterprise production codebases require TypeScript to eliminate runtime bugs and standardize API interfaces.",
        "prerequisites": ["JavaScript ES6+", "Functions & Closures", "Basic OOP"],
        "estimated_hours": "14-18 hours",
        "resources": [
            {"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Official Documentation", "provider": "Microsoft"},
            {"title": "TypeScript for JavaScript Programmers", "url": "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", "type": "Official Guide", "provider": "TypeScript Docs"},
            {"title": "Total TypeScript Tutorials", "url": "https://www.totaltypescript.com/tutorials", "type": "Interactive Guide", "provider": "Matt Pocock / Open Source"}
        ],
        "practice_exercises": [
            "Convert a plain JavaScript utility library (e.g. string & date formatters) to strict TypeScript.",
            "Define generic interfaces for REST API responses including pagination metadata.",
            "Implement utility types (Pick, Omit, Partial, Record) for component prop definitions."
        ],
        "mini_project": "Refactor a multi-component React state machine to 100% strict TypeScript with zero 'any' types."
    },
    "docker": {
        "description": "Open platform for packaging, shipping, and running applications in lightweight, isolated containers.",
        "why_important": "Eliminates the 'works on my machine' issue and forms the baseline standard for microservices deployment and CI/CD pipelines.",
        "prerequisites": ["Basic Linux / Bash Commands", "Client-Server Architecture"],
        "estimated_hours": "12-16 hours",
        "resources": [
            {"title": "Docker Get Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Official Documentation", "provider": "Docker"},
            {"title": "Docker Curriculum for Beginners", "url": "https://docker-curriculum.com/", "type": "Comprehensive Tutorial", "provider": "Open Source Community"},
            {"title": "Compose File Reference", "url": "https://docs.docker.com/compose/compose-file/", "type": "Official Reference", "provider": "Docker"}
        ],
        "practice_exercises": [
            "Write a multi-stage Dockerfile for a Python FastAPI or Node.js application to optimize image size.",
            "Create a docker-compose.yml file linking a backend API container with a PostgreSQL database and persistent volume.",
            "Inspect container logs, execute commands inside running containers, and configure environment variables."
        ],
        "mini_project": "Containerize a full-stack application (React frontend + Python API + PostgreSQL database) with live-reload volume mounts."
    },
    "postgresql": {
        "description": "Powerful, open-source object-relational database system emphasizing extensibility, SQL compliance, and ACID transactions.",
        "why_important": "The industry standard relational database for high-reliability transactional business data and complex analytical queries.",
        "prerequisites": ["Basic SQL SELECT/INSERT syntax", "Relational Data Modeling"],
        "estimated_hours": "14-20 hours",
        "resources": [
            {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/current/", "type": "Official Documentation", "provider": "The PostgreSQL Global Development Group"},
            {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "Interactive Guide", "provider": "PostgreSQL Tutorial"},
            {"title": "Use The Index, Luke (SQL Indexing)", "url": "https://use-the-index-luke.com/", "type": "Optimization Guide", "provider": "Markus Winand"}
        ],
        "practice_exercises": [
            "Design a 3NF normalized schema for an e-commerce platform with Foreign Keys, Cascades, and Constraints.",
            "Write complex aggregate queries using GROUP BY, HAVING, and Window Functions (ROW_NUMBER, RANK).",
            "Use EXPLAIN ANALYZE to identify sequential table scans and create B-Tree indexes to speed up query execution."
        ],
        "mini_project": "Build an analytical SQL dashboard that computes 30-day rolling revenue and customer retention cohorts."
    },
    "fastapi": {
        "description": "Modern, fast (high-performance) web framework for building APIs with Python 3.8+ based on standard Python type hints.",
        "why_important": "Rapidly becoming the top Python backend framework for microservices, machine learning model serving, and asynchronous APIs.",
        "prerequisites": ["Core Python 3", "Type Hints (typing module)", "HTTP & REST Principles"],
        "estimated_hours": "10-15 hours",
        "resources": [
            {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Official Documentation", "provider": "Sebastián Ramírez"},
            {"title": "FastAPI Tutorial - User Guide", "url": "https://fastapi.tiangolo.com/tutorial/", "type": "Step-by-Step Guide", "provider": "FastAPI Docs"},
            {"title": "Pydantic Documentation", "url": "https://docs.pydantic.dev/latest/", "type": "Official Documentation", "provider": "Pydantic"}
        ],
        "practice_exercises": [
            "Build CRUD endpoints with request body validation using Pydantic BaseModel.",
            "Implement JWT authentication middleware with Dependency Injection (Depends).",
            "Write asynchronous route handlers connected to asyncpg or SQLAlchemy AsyncSession."
        ],
        "mini_project": "Develop a secure REST API for task management with role-based access control (RBAC) and automated Swagger documentation."
    },
    "redis": {
        "description": "In-memory data structure store used as a distributed database, cache, message broker, and streaming engine.",
        "why_important": "Crucial for reducing relational database load, handling user sessions, and executing sub-millisecond query responses.",
        "prerequisites": ["Client-Server Architecture", "Key-Value Concept"],
        "estimated_hours": "8-12 hours",
        "resources": [
            {"title": "Redis Official Documentation", "url": "https://redis.io/docs/latest/", "type": "Official Documentation", "provider": "Redis Ltd."},
            {"title": "Redis University - Free Courses", "url": "https://university.redis.com/", "type": "Free Interactive Training", "provider": "Redis"},
            {"title": "Redis Commands Reference", "url": "https://redis.io/commands/", "type": "Official Reference", "provider": "Redis"}
        ],
        "practice_exercises": [
            "Implement a cache-aside pattern where API queries check Redis before querying PostgreSQL.",
            "Build a distributed API rate limiter using Redis INCR and EXPIRE commands.",
            "Publish and subscribe to real-time events using Redis Pub/Sub channels."
        ],
        "mini_project": "Add in-memory caching to an existing API endpoint, measuring the latency drop from 120ms to under 4ms."
    },
    "tailwind css": {
        "description": "Utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
        "why_important": "Accelerates UI development and standardizes spacing, responsive breakpoints, and modern design tokens.",
        "prerequisites": ["HTML5 Semantic Elements", "CSS Box Model & Flexbox"],
        "estimated_hours": "8-12 hours",
        "resources": [
            {"title": "Tailwind CSS Official Documentation", "url": "https://tailwindcss.com/docs", "type": "Official Documentation", "provider": "Tailwind Labs"},
            {"title": "Tailwind CSS Playground", "url": "https://play.tailwindcss.com/", "type": "Interactive Sandboxed Editor", "provider": "Tailwind Labs"}
        ],
        "practice_exercises": [
            "Recreate a responsive pricing card grid adapting smoothly from mobile to desktop.",
            "Build an accessible dark mode toggle using the dark: class variant.",
            "Configure a custom color palette and font family in tailwind.config."
        ],
        "mini_project": "Design a responsive SaaS landing page with mobile hamburger navigation, modal dialogs, and smooth micro-interactions."
    },
    "unit testing": {
        "description": "Methodology for testing individual units or components of software in isolation to ensure correctness and prevent regressions.",
        "why_important": "Essential for CI/CD automation, production stability, and demonstrating engineering rigor to hiring teams.",
        "prerequisites": ["Core Language Syntax (Python/JS)", "Functions & Modularity"],
        "estimated_hours": "10-14 hours",
        "resources": [
            {"title": "Pytest Official Documentation", "url": "https://docs.pytest.org/en/latest/", "type": "Official Documentation", "provider": "Pytest Development Team"},
            {"title": "Vitest Documentation", "url": "https://vitest.dev/guide/", "type": "Official Documentation", "provider": "Vitest Team"},
            {"title": "Testing Library Core Principles", "url": "https://testing-library.com/docs/guiding-principles", "type": "Official Guide", "provider": "Testing Library"}
        ],
        "practice_exercises": [
            "Write parameterized tests covering edge cases (empty lists, null inputs, boundary values).",
            "Mock external network requests using unittest.mock (Python) or vi.fn() (JavaScript).",
            "Generate a code coverage report targeting >= 80% branch coverage."
        ],
        "mini_project": "Write a complete test suite for an authentication and payment processing service using fixtures and mocked APIs."
    },
    "ci/cd": {
        "description": "Continuous Integration & Continuous Delivery practices automating building, testing, and deploying code changes.",
        "why_important": "Modern engineering teams deploy daily; familiarity with GitHub Actions pipelines separates junior coders from production engineers.",
        "prerequisites": ["Git & GitHub Workflows", "Unit Testing", "YAML Syntax"],
        "estimated_hours": "10-14 hours",
        "resources": [
            {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "type": "Official Documentation", "provider": "GitHub"},
            {"title": "Understanding GitHub Actions Workflows", "url": "https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions", "type": "Official Guide", "provider": "GitHub"}
        ],
        "practice_exercises": [
            "Create a workflow triggered on pull requests that runs linter (eslint/flake8) and automated test suite.",
            "Configure repository secrets for deployment tokens and environment variables.",
            "Build an automated release workflow that builds a production bundle on git tag push."
        ],
        "mini_project": "Implement an end-to-end CI/CD pipeline that runs tests, builds Docker image, and triggers staging deployment on push to main."
    },
    "data structures & algorithms": {
        "description": "Foundational computing patterns (Trees, Graphs, Hash Tables, Dynamic Programming) for optimal compute and memory utilization.",
        "why_important": "The core benchmark used in technical interview screens at top tech companies to measure algorithmic problem-solving ability.",
        "prerequisites": ["Basic Programming Loops & Arrays", "Recursion"],
        "estimated_hours": "30-50 hours",
        "resources": [
            {"title": "NeetCode 150 Problem Roadmap", "url": "https://neetcode.io/practice", "type": "Curated Coding Practice", "provider": "NeetCode"},
            {"title": "LeetCode Practice Platform", "url": "https://leetcode.com/problemset/", "type": "Interactive Problem Bank", "provider": "LeetCode"},
            {"title": "Visualgo Algorithm Visualizer", "url": "https://visualgo.net/en", "type": "Interactive Visualization", "provider": "National University of Singapore"}
        ],
        "practice_exercises": [
            "Solve Two Sum, Valid Anagram, and Group Anagrams using Hash Maps in O(N) time.",
            "Implement Invert Binary Tree, Maximum Depth, and Level Order Traversal using BFS/DFS.",
            "Solve standard Two Pointers and Sliding Window problems (Best Time to Buy and Sell Stock)."
        ],
        "mini_project": "Build an algorithmic maze solver utilizing Breadth-First Search (BFS) and Dijkstra's shortest path algorithm."
    },
    "scikit-learn": {
        "description": "Fundamental Python machine learning library providing simple and efficient tools for predictive data analysis.",
        "why_important": "Essential for Machine Learning Engineers and Data Scientists to build regression, classification, and clustering pipelines.",
        "prerequisites": ["Python 3", "NumPy & Pandas", "Basic Linear Algebra & Calculus"],
        "estimated_hours": "16-24 hours",
        "resources": [
            {"title": "Scikit-Learn Official User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Official Documentation", "provider": "Scikit-Learn Developers"},
            {"title": "Scikit-Learn Tutorials", "url": "https://scikit-learn.org/stable/tutorial/index.html", "type": "Hands-on Guide", "provider": "Scikit-Learn"}
        ],
        "practice_exercises": [
            "Build a customer churn prediction classifier using Logistic Regression and Random Forest.",
            "Construct a preprocessing Pipeline with StandardScaler and OneHotEncoder to prevent data leakage.",
            "Evaluate model performance using Confusion Matrix, ROC-AUC curve, and Cross-Validation."
        ],
        "mini_project": "Develop an end-to-end predictive housing price model with automated feature selection and hyperparameter tuning."
    }
}

# Generic fallback for skills not in the curated resource table
def get_skill_metadata(skill_name: str, target_role: str, priority: str = "High") -> Dict[str, Any]:
    cleaned = skill_name.strip().lower()
    if cleaned in VERIFIED_SKILL_RESOURCES:
        info = VERIFIED_SKILL_RESOURCES[cleaned]
        return {
            "skill_name": skill_name,
            "canonical": cleaned,
            "description": info["description"],
            "why_important": info["why_important"],
            "priority": priority,
            "prerequisites": info["prerequisites"],
            "estimated_hours": info["estimated_hours"],
            "resources": info["resources"],
            "practice_exercises": info["practice_exercises"],
            "mini_project": info["mini_project"],
            "status": "not_started"
        }

    # Generate reliable standard guidance
    return {
        "skill_name": skill_name,
        "canonical": cleaned,
        "description": f"Core technical competency in {skill_name} required for modern engineering workflows.",
        "why_important": f"Critical industry requirement for {target_role} roles to ensure reliable architecture and scalable development.",
        "priority": priority,
        "prerequisites": ["Foundational Computer Science Principles", "Basic Programming Syntax"],
        "estimated_hours": "12-16 hours",
        "resources": [
            {"title": f"{skill_name} Official Documentation", "url": f"https://devdocs.io/#q={skill_name.lower().replace(' ', '')}", "type": "Official Documentation", "provider": "DevDocs Open Source"},
            {"title": "freeCodeCamp Technical Curriculum", "url": "https://www.freecodecamp.org/learn", "type": "Free Interactive Training", "provider": "freeCodeCamp.org"}
        ],
        "practice_exercises": [
            f"Set up a local development sandbox and run basic {skill_name} operations.",
            f"Implement a modular script or component applying core {skill_name} patterns.",
            f"Add error handling and automated unit tests for {skill_name} modules."
        ],
        "mini_project": f"Build a scoped showcase project integrating {skill_name} with your existing tech stack.",
        "status": "not_started"
    }

class RoadmapService:
    def __init__(self):
        pass

    async def generate_adaptive_roadmap(
        self,
        user_id: str,
        job_role: str,
        duration_weeks: int = 8,
        user_jwt: str = "",
        resume_analysis: Optional[Dict[str, Any]] = None,
        interview_weaknesses: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes an adaptive learning roadmap organized into weekly milestones
        derived from missing skills, resume analysis, and mock interview performance.
        """
        duration = 8 if duration_weeks not in (4, 8, 12) else duration_weeks
        role_slug = job_role.lower().replace(" ", "-")
        role_spec = get_role_by_slug(role_slug) or CURATED_JOB_ROLES.get("software-developer")

        # 1. Identify missing skills from Resume Analysis
        missing_required = []
        missing_preferred = []
        if resume_analysis:
            missing_required = [
                s.get("name") for s in resume_analysis.get("missing_required_skills", [])
            ]
            missing_preferred = [
                s.get("name") for s in resume_analysis.get("missing_preferred_skills", [])
            ]

        # 2. Identify weak topics from Mock Interview
        interview_topics = interview_weaknesses or []

        # If no resume analysis or all skills matched, pull baseline requirements for role
        if not missing_required and not missing_preferred:
            for s in role_spec.get("required_skills", []):
                missing_required.append(s["name"])
            for s in role_spec.get("preferred_skills", [])[:2]:
                missing_preferred.append(s["name"])

        # Prioritize skills
        high_priority_skills = []
        # Interview weaknesses get top billing!
        for topic in interview_topics:
            if topic not in high_priority_skills:
                high_priority_skills.append((topic, "High"))

        for s in missing_required:
            if s not in [item[0] for item in high_priority_skills]:
                high_priority_skills.append((s, "High"))

        medium_priority_skills = []
        for s in missing_preferred:
            if s not in [item[0] for item in high_priority_skills]:
                medium_priority_skills.append((s, "Medium"))

        all_target_skills = high_priority_skills + medium_priority_skills
        if not all_target_skills:
            all_target_skills = [("System Architecture", "High"), ("Database Optimization", "High"), ("Docker", "Medium")]

        # Build detailed skill items
        skill_items = [
            get_skill_metadata(name, job_role, priority)
            for name, priority in all_target_skills
        ]

        # 3. Distribute across weeks (4, 8, or 12 weeks)
        weekly_milestones: List[Dict[str, Any]] = []
        skills_per_week = max(1, round(len(skill_items) / duration))

        for week_num in range(1, duration + 1):
            start_idx = (week_num - 1) * skills_per_week
            end_idx = start_idx + skills_per_week
            assigned_skills = skill_items[start_idx:end_idx]

            # If last week, include any remaining skills
            if week_num == duration and len(skill_items) > end_idx:
                assigned_skills.extend(skill_items[end_idx:])

            # If an earlier week ended up empty, provide consolidation milestone
            if not assigned_skills:
                assigned_skills = [{
                    "skill_name": f"Comprehensive Project Integration {week_num}",
                    "canonical": f"integration-week-{week_num}",
                    "description": "Synthesizing prior concepts into an end-to-end production architecture.",
                    "why_important": "Reinforces knowledge retention through practical, multi-module execution.",
                    "priority": "Medium",
                    "prerequisites": ["Prior Milestone Concepts"],
                    "estimated_hours": "10-12 hours",
                    "resources": [
                        {"title": "Open Source Capstone Architectures", "url": "https://github.com/topics/fullstack", "type": "Reference Implementations", "provider": "GitHub"}
                    ],
                    "practice_exercises": ["Conduct code review of prior milestone code.", "Add integration test suite."],
                    "mini_project": "Build an integrated end-to-end flow combining all previously studied modules.",
                    "status": "not_started"
                }]

            primary_skill = assigned_skills[0]["skill_name"]
            milestone_title = f"Week {week_num}: Mastering {primary_skill} & Core Architecture"

            weekly_milestones.append({
                "week_number": week_num,
                "title": milestone_title,
                "description": f"Focus on {', '.join(s['skill_name'] for s in assigned_skills)} with hands-on labs and mini-projects.",
                "skills": assigned_skills,
                "completion_percentage": 0,
                "status": "not_started"
            })

        roadmap_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        roadmap_record = {
            "id": roadmap_id,
            "user_id": user_id,
            "job_role": job_role,
            "duration_weeks": duration,
            "overall_completion_percentage": 0,
            "total_skills_count": sum(len(w["skills"]) for w in weekly_milestones),
            "completed_skills_count": 0,
            "weekly_milestones": weekly_milestones,
            "created_at": created_at,
            "updated_at": created_at
        }

        # Cache locally
        _LOCAL_ROADMAPS_DB[user_id] = roadmap_record

        # Store in Supabase
        if supabase_service.is_remote_available():
            headers = supabase_service._get_headers(user_jwt)
            try:
                # Store top milestone records in public.learning_roadmaps
                rows = []
                for w in weekly_milestones:
                    for s in w["skills"]:
                        rows.append({
                            "user_id": user_id,
                            "skill_name": s["skill_name"],
                            "phase_number": w["week_number"],
                            "priority": s["priority"].lower(),
                            "estimated_hours": int(s["estimated_hours"].split("-")[0].strip()) if "-" in s["estimated_hours"] else 10,
                            "resources": s["resources"],
                            "completion_status": s["status"]
                        })
                db_url = f"{supabase_service.base_url}/rest/v1/learning_roadmaps"
                import httpx
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.post(db_url, json=rows, headers=headers)
            except Exception:
                supabase_service.mark_remote_unavailable()

        # Log Activity
        await supabase_service.log_activity(
            user_id=user_id,
            activity_type="ROADMAP_GENERATED",
            metadata={"roadmap_id": roadmap_id, "duration": duration, "role": job_role},
            user_jwt=user_jwt
        )

        return roadmap_record

    async def get_user_roadmap(self, user_id: str, user_jwt: str = "") -> Optional[Dict[str, Any]]:
        """Returns the current active roadmap for the student."""
        return _LOCAL_ROADMAPS_DB.get(user_id)

    async def update_skill_progress(
        self,
        user_id: str,
        skill_canonical: str,
        new_status: str,
        user_jwt: str = ""
    ) -> Dict[str, Any]:
        """
        Updates the completion status (not_started, in_progress, completed)
        of a specific skill and recalculates milestone and overall progress.
        """
        roadmap = _LOCAL_ROADMAPS_DB.get(user_id)
        if not roadmap:
            raise ValueError("No active roadmap found for user.")

        found = False
        target_clean = skill_canonical.strip().lower()

        for week in roadmap["weekly_milestones"]:
            for skill in week["skills"]:
                if (
                    skill.get("canonical") == target_clean
                    or skill.get("skill_name", "").lower() == target_clean
                ):
                    skill["status"] = new_status
                    found = True
                    break

            # Recalculate week completion percentage
            week_skills = week["skills"]
            completed_in_week = sum(1 for s in week_skills if s.get("status") == "completed")
            week["completion_percentage"] = round((completed_in_week / len(week_skills)) * 100) if week_skills else 0
            if week["completion_percentage"] == 100:
                week["status"] = "completed"
            elif week["completion_percentage"] > 0:
                week["status"] = "in_progress"
            else:
                week["status"] = "not_started"

        if not found:
            raise ValueError(f"Skill '{skill_canonical}' not found in active roadmap.")

        # Recalculate overall completion
        all_skills = [s for w in roadmap["weekly_milestones"] for s in w["skills"]]
        total_skills = len(all_skills)
        completed_total = sum(1 for s in all_skills if s.get("status") == "completed")

        roadmap["completed_skills_count"] = completed_total
        roadmap["overall_completion_percentage"] = round((completed_total / total_skills) * 100) if total_skills else 0
        roadmap["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Update in Supabase
        if supabase_service.is_remote_available():
            headers = supabase_service._get_headers(user_jwt)
            try:
                db_url = f"{supabase_service.base_url}/rest/v1/learning_roadmaps?user_id=eq.{user_id}&skill_name=ilike.{skill_canonical}"
                import httpx
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.patch(db_url, json={"completion_status": new_status}, headers=headers)
            except Exception:
                supabase_service.mark_remote_unavailable()

        # Log Activity
        await supabase_service.log_activity(
            user_id=user_id,
            activity_type="ROADMAP_PROGRESS_UPDATED",
            metadata={"skill": skill_canonical, "status": new_status, "overall": roadmap["overall_completion_percentage"]},
            user_jwt=user_jwt
        )

        return roadmap

    async def compare_revised_resume(
        self,
        user_id: str,
        user_jwt: str,
        previous_analysis: Dict[str, Any],
        new_resume_record: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compares previous resume analysis score with a newly revised CV,
        highlighting newly closed skill gaps, score improvements, and adapting roadmap.
        """
        target_role = previous_analysis.get("target_role", "Software Developer")
        prev_score = previous_analysis.get("match_score", 60)

        # Run analysis on the new resume
        new_analysis = analysis_engine.run_analysis(
            resume_record=new_resume_record,
            target_role_name_or_slug=target_role
        )
        new_score = new_analysis.get("match_score", 75)
        score_diff = new_score - prev_score

        # Identify previously missing skills that are now MATCHED in the new analysis!
        prev_missing = {
            s["name"].lower() for s in previous_analysis.get("missing_required_skills", []) + previous_analysis.get("missing_preferred_skills", [])
        }
        new_matched = {
            s["name"].lower(): s["name"] for s in new_analysis.get("matched_skills", [])
        }

        closed_gaps = []
        for miss in prev_missing:
            if miss in new_matched:
                closed_gaps.append(new_matched[miss])

        # Automatically mark newly closed gaps as completed in active roadmap
        roadmap = _LOCAL_ROADMAPS_DB.get(user_id)
        if roadmap and closed_gaps:
            for closed_skill in closed_gaps:
                try:
                    await self.update_skill_progress(user_id, closed_skill, "completed", user_jwt)
                except Exception:
                    pass

        return {
            "target_role": target_role,
            "previous_match_score": prev_score,
            "new_match_score": new_score,
            "score_difference": score_diff,
            "is_improved": score_diff > 0,
            "closed_skill_gaps": closed_gaps,
            "remaining_missing_skills": [s["name"] for s in new_analysis.get("missing_required_skills", [])],
            "summary_feedback": (
                f"Your match score improved by +{score_diff}% (from {prev_score}% to {new_score}%)! "
                f"You successfully addressed {len(closed_gaps)} previously missing skill gap(s): {', '.join(closed_gaps)}."
                if score_diff > 0 else
                f"Your score remained steady at {new_score}%. Review the remaining skill gaps to climb higher."
            )
        }

roadmap_service = RoadmapService()
