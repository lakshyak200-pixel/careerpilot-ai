-- ==============================================================================
-- CareerPilot AI - Standardized Industry Job Roles Seed Data
-- Realistic skill ontologies, requirements, and salary benchmarks for graduates.
-- Safe to re-run (uses ON CONFLICT (role_name) DO UPDATE).
-- ==============================================================================

INSERT INTO public.job_roles (
    role_name,
    category,
    description,
    experience_level,
    salary_range_min,
    salary_range_max,
    required_skills,
    preferred_skills
)
VALUES
(
    'Junior Frontend Developer',
    'Engineering',
    'Designs and builds responsive, accessible, and high-performance client-side web interfaces using modern component frameworks.',
    'entry_level',
    70000,
    95000,
    '[
        {"name": "JavaScript (ES6+)", "importance": "critical", "category": "Language"},
        {"name": "React.js", "importance": "critical", "category": "Framework"},
        {"name": "HTML5 & Semantic Markup", "importance": "high", "category": "Web Standard"},
        {"name": "CSS3 & Modern Layouts (Flexbox/Grid)", "importance": "high", "category": "Styling"},
        {"name": "Git & GitHub Version Control", "importance": "high", "category": "Tooling"},
        {"name": "RESTful API Integration", "importance": "high", "category": "Networking"}
    ]'::jsonb,
    '[
        {"name": "TypeScript", "importance": "high", "category": "Language"},
        {"name": "Tailwind CSS", "importance": "medium", "category": "Styling"},
        {"name": "Next.js (App Router)", "importance": "medium", "category": "Framework"},
        {"name": "State Management (Zustand / Redux)", "importance": "medium", "category": "Architecture"},
        {"name": "Unit Testing (Vitest / Jest)", "importance": "medium", "category": "Quality"}
    ]'::jsonb
),
(
    'Junior Backend Developer',
    'Engineering',
    'Architects and maintains robust backend microservices, database schemas, and RESTful/GraphQL APIs.',
    'entry_level',
    75000,
    100000,
    '[
        {"name": "Python or Node.js", "importance": "critical", "category": "Language"},
        {"name": "Relational Databases (PostgreSQL / MySQL)", "importance": "critical", "category": "Database"},
        {"name": "REST API Architecture", "importance": "high", "category": "Networking"},
        {"name": "SQL & Query Optimization", "importance": "high", "category": "Database"},
        {"name": "Authentication (JWT / OAuth2)", "importance": "high", "category": "Security"},
        {"name": "Git Collaboration", "importance": "high", "category": "Tooling"}
    ]'::jsonb,
    '[
        {"name": "FastAPI / Express.js", "importance": "high", "category": "Framework"},
        {"name": "Docker & Containerization", "importance": "high", "category": "DevOps"},
        {"name": "Redis In-Memory Caching", "importance": "medium", "category": "Performance"},
        {"name": "Object Relational Mapping (Prisma / SQLAlchemy)", "importance": "medium", "category": "Database"},
        {"name": "Linux Command Line Basics", "importance": "medium", "category": "Operating Systems"}
    ]'::jsonb
),
(
    'Full Stack Software Engineer',
    'Engineering',
    'Bridges frontend user experience with reliable backend services and database pipelines.',
    'entry_level',
    80000,
    110000,
    '[
        {"name": "JavaScript / TypeScript", "importance": "critical", "category": "Language"},
        {"name": "React.js", "importance": "critical", "category": "Frontend"},
        {"name": "Node.js / Python Backend", "importance": "critical", "category": "Backend"},
        {"name": "SQL & Relational Schemas", "importance": "high", "category": "Database"},
        {"name": "API Design & Integration", "importance": "high", "category": "Architecture"},
        {"name": "Git Workflow", "importance": "high", "category": "Tooling"}
    ]'::jsonb,
    '[
        {"name": "Cloud Deployment (Supabase / Vercel / AWS)", "importance": "high", "category": "Cloud"},
        {"name": "Docker", "importance": "medium", "category": "DevOps"},
        {"name": "CI/CD Pipeline Automation", "importance": "medium", "category": "DevOps"},
        {"name": "Database Indexing & Normalization", "importance": "medium", "category": "Database"},
        {"name": "Automated E2E Testing (Playwright / Cypress)", "importance": "medium", "category": "Quality"}
    ]'::jsonb
),
(
    'Graduate Data Scientist',
    'Data',
    'Applies statistical modeling, exploratory data analysis, and predictive machine learning algorithms to solve business problems.',
    'entry_level',
    80000,
    105000,
    '[
        {"name": "Python for Data Science", "importance": "critical", "category": "Language"},
        {"name": "Data Wrangling (Pandas & NumPy)", "importance": "critical", "category": "Data"},
        {"name": "Advanced SQL & Aggregate Queries", "importance": "critical", "category": "Database"},
        {"name": "Classical Machine Learning (Scikit-Learn)", "importance": "high", "category": "ML"},
        {"name": "Statistical Hypothesis Testing", "importance": "high", "category": "Mathematics"},
        {"name": "Data Visualization (Matplotlib / Seaborn)", "importance": "high", "category": "Analytics"}
    ]'::jsonb,
    '[
        {"name": "Jupyter Lab & Git", "importance": "medium", "category": "Tooling"},
        {"name": "Business Intelligence Tools (Tableau / PowerBI)", "importance": "medium", "category": "Analytics"},
        {"name": "Feature Engineering", "importance": "medium", "category": "ML"},
        {"name": "Big Data Basics (PySpark)", "importance": "low", "category": "Data"}
    ]'::jsonb
),
(
    'Junior Machine Learning Engineer',
    'Engineering',
    'Focuses on deploying, fine-tuning, and evaluating production ML models, LLMs, and vector embeddings pipelines.',
    'entry_level',
    85000,
    115000,
    '[
        {"name": "Python (Advanced)", "importance": "critical", "category": "Language"},
        {"name": "Deep Learning Fundamentals (PyTorch / TensorFlow)", "importance": "critical", "category": "Framework"},
        {"name": "Model Evaluation & Metrics", "importance": "high", "category": "ML"},
        {"name": "REST API Model Serving (FastAPI)", "importance": "high", "category": "Serving"},
        {"name": "Linear Algebra & Probability", "importance": "high", "category": "Mathematics"},
        {"name": "Data Pipelines", "importance": "high", "category": "Data"}
    ]'::jsonb,
    '[
        {"name": "Vector Databases (pgvector / Pinecone)", "importance": "high", "category": "AI/LLM"},
        {"name": "RAG (Retrieval-Augmented Generation)", "importance": "high", "category": "AI/LLM"},
        {"name": "Docker for GPU/CUDA Workloads", "importance": "medium", "category": "DevOps"},
        {"name": "HuggingFace Transformers", "importance": "medium", "category": "AI/LLM"}
    ]'::jsonb
),
(
    'Junior Cloud / DevOps Engineer',
    'Cloud',
    'Automates build pipelines, manages cloud infrastructure, and guarantees containerized application reliability.',
    'entry_level',
    75000,
    100000,
    '[
        {"name": "Linux / Unix Shell Scripting", "importance": "critical", "category": "OS"},
        {"name": "Docker & Container Basics", "importance": "critical", "category": "Containers"},
        {"name": "CI/CD Pipelines (GitHub Actions / GitLab)", "importance": "critical", "category": "DevOps"},
        {"name": "Networking Protocols (TCP/IP, DNS, SSL/TLS)", "importance": "high", "category": "Networking"},
        {"name": "Git Version Control", "importance": "high", "category": "Tooling"}
    ]'::jsonb,
    '[
        {"name": "Kubernetes (K8s) Core Concepts", "importance": "high", "category": "Orchestration"},
        {"name": "Cloud Providers (AWS / GCP / Azure)", "importance": "high", "category": "Cloud"},
        {"name": "Infrastructure as Code (Terraform)", "importance": "medium", "category": "IaC"},
        {"name": "Monitoring & Alerting (Prometheus / Grafana)", "importance": "medium", "category": "Observability"}
    ]'::jsonb
)
ON CONFLICT (role_name) DO UPDATE SET
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    experience_level = EXCLUDED.experience_level,
    salary_range_min = EXCLUDED.salary_range_min,
    salary_range_max = EXCLUDED.salary_range_max,
    required_skills = EXCLUDED.required_skills,
    preferred_skills = EXCLUDED.preferred_skills,
    updated_at = TIMEZONE('utc'::text, NOW());

