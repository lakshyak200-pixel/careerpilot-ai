-- ==============================================================================
-- CareerPilot AI - Complete Scalable PostgreSQL Production Database Schema
-- Compatible with Supabase Auth, PostgreSQL 15+, and Supabase Storage
-- ==============================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Helper Functions (Automatic Timestamp Updating)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. Tables Definition
-- ==============================================================================

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    college TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year TEXT,
    target_job_role TEXT DEFAULT 'Frontend Developer',
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 2: resumes
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT DEFAULT 'application/pdf',
    extracted_text TEXT,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 3: job_roles
CREATE TABLE IF NOT EXISTS public.job_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'Engineering',
    description TEXT NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    experience_level TEXT DEFAULT 'entry_level' CHECK (experience_level IN ('internship', 'entry_level', 'junior', 'mid')),
    salary_range_min INTEGER,
    salary_range_max INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 4: resume_analyses
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
    job_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    content_score INTEGER CHECK (content_score >= 0 AND content_score <= 100),
    formatting_score INTEGER CHECK (formatting_score >= 0 AND formatting_score <= 100),
    keywords_score INTEGER CHECK (keywords_score >= 0 AND keywords_score <= 100),
    impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
    matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    critical_issues JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_ai_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 5: interview_sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'behavioral', 'mixed', 'system_design')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'abandoned')),
    overall_score NUMERIC(5, 2) CHECK (overall_score >= 0 AND overall_score <= 100),
    summary_feedback TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Table 6: interview_questions
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    expected_answer TEXT,
    question_type TEXT DEFAULT 'technical' CHECK (question_type IN ('technical', 'behavioral', 'system_design')),
    question_order INTEGER NOT NULL,
    key_competencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 7: interview_answers
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE NOT NULL,
    user_answer TEXT NOT NULL,
    score NUMERIC(4, 2) CHECK (score >= 0 AND score <= 10),
    feedback TEXT,
    strengths TEXT,
    areas_for_improvement TEXT,
    audio_recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 8: learning_roadmaps
CREATE TABLE IF NOT EXISTS public.learning_roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_role_id UUID REFERENCES public.job_roles(id) ON DELETE SET NULL,
    skill_name TEXT NOT NULL,
    phase_number INTEGER DEFAULT 1,
    priority TEXT DEFAULT 'high' CHECK (priority IN ('critical', 'high', 'medium', 'optional')),
    estimated_hours INTEGER DEFAULT 10,
    resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    completion_status TEXT DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table 9: user_activity
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Safely drop user_activity_logs if it was previously created as a table, then recreate as view
DROP TABLE IF EXISTS public.user_activity_logs CASCADE;
DROP VIEW IF EXISTS public.user_activity_logs CASCADE;
CREATE VIEW public.user_activity_logs AS SELECT * FROM public.user_activity;

-- ==============================================================================
-- 3. Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_status ON public.resumes(processing_status);
CREATE INDEX IF NOT EXISTS idx_job_roles_active ON public.job_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_job_roles_category ON public.job_roles(category);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON public.resume_analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_resume ON public.resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON public.interview_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session ON public.interview_questions(session_id, question_order ASC);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session ON public.interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmaps_user ON public.learning_roadmaps(user_id, phase_number ASC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON public.user_activity(user_id, created_at DESC);

-- ==============================================================================
-- 4. Triggers for updated_at
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_resumes_updated ON public.resumes;
CREATE TRIGGER trg_resumes_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_job_roles_updated ON public.job_roles;
CREATE TRIGGER trg_job_roles_updated BEFORE UPDATE ON public.job_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_learning_roadmaps_updated ON public.learning_roadmaps;
CREATE TRIGGER trg_learning_roadmaps_updated BEFORE UPDATE ON public.learning_roadmaps FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. Automated Signup Profile Creation Trigger
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        college,
        degree,
        branch,
        graduation_year,
        target_job_role,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        NEW.raw_user_meta_data->>'college',
        NEW.raw_user_meta_data->>'degree',
        NEW.raw_user_meta_data->>'branch',
        NEW.raw_user_meta_data->>'graduation_year',
        COALESCE(NEW.raw_user_meta_data->>'target_job_role', 'Frontend Developer'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        college = EXCLUDED.college,
        degree = EXCLUDED.degree,
        branch = EXCLUDED.branch,
        graduation_year = EXCLUDED.graduation_year,
        target_job_role = EXCLUDED.target_job_role,
        updated_at = TIMEZONE('utc'::text, NOW());

    INSERT INTO public.user_activity (user_id, activity_type, metadata)
    VALUES (NEW.id, 'ACCOUNT_CREATED', jsonb_build_object('source', 'email_signup'));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- resumes
DROP POLICY IF EXISTS "resumes_select_own" ON public.resumes;
CREATE POLICY "resumes_select_own" ON public.resumes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_insert_own" ON public.resumes;
CREATE POLICY "resumes_insert_own" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_update_own" ON public.resumes;
CREATE POLICY "resumes_update_own" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_delete_own" ON public.resumes;
CREATE POLICY "resumes_delete_own" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- job_roles (Readable by all students; writable only by service_role)
DROP POLICY IF EXISTS "job_roles_read_all" ON public.job_roles;
CREATE POLICY "job_roles_read_all" ON public.job_roles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "job_roles_read_anon" ON public.job_roles;
CREATE POLICY "job_roles_read_anon" ON public.job_roles FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "job_roles_admin_write" ON public.job_roles;
CREATE POLICY "job_roles_admin_write" ON public.job_roles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- resume_analyses
DROP POLICY IF EXISTS "resume_analyses_select_own" ON public.resume_analyses;
CREATE POLICY "resume_analyses_select_own" ON public.resume_analyses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_analyses_insert_own" ON public.resume_analyses;
CREATE POLICY "resume_analyses_insert_own" ON public.resume_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resume_analyses_delete_own" ON public.resume_analyses;
CREATE POLICY "resume_analyses_delete_own" ON public.resume_analyses FOR DELETE USING (auth.uid() = user_id);

-- interview_sessions
DROP POLICY IF EXISTS "interview_sessions_select_own" ON public.interview_sessions;
CREATE POLICY "interview_sessions_select_own" ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_insert_own" ON public.interview_sessions;
CREATE POLICY "interview_sessions_insert_own" ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_update_own" ON public.interview_sessions;
CREATE POLICY "interview_sessions_update_own" ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "interview_sessions_delete_own" ON public.interview_sessions;
CREATE POLICY "interview_sessions_delete_own" ON public.interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- interview_questions
DROP POLICY IF EXISTS "interview_questions_select_own" ON public.interview_questions;
CREATE POLICY "interview_questions_select_own" ON public.interview_questions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_questions.session_id AND s.user_id = auth.uid()));

DROP POLICY IF EXISTS "interview_questions_insert_own" ON public.interview_questions;
CREATE POLICY "interview_questions_insert_own" ON public.interview_questions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_questions.session_id AND s.user_id = auth.uid()));

-- interview_answers
DROP POLICY IF EXISTS "interview_answers_select_own" ON public.interview_answers;
CREATE POLICY "interview_answers_select_own" ON public.interview_answers FOR SELECT
USING (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_answers.session_id AND s.user_id = auth.uid()));

DROP POLICY IF EXISTS "interview_answers_insert_own" ON public.interview_answers;
CREATE POLICY "interview_answers_insert_own" ON public.interview_answers FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.interview_sessions s WHERE s.id = interview_answers.session_id AND s.user_id = auth.uid()));

-- learning_roadmaps
DROP POLICY IF EXISTS "learning_roadmaps_select_own" ON public.learning_roadmaps;
CREATE POLICY "learning_roadmaps_select_own" ON public.learning_roadmaps FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "learning_roadmaps_insert_own" ON public.learning_roadmaps;
CREATE POLICY "learning_roadmaps_insert_own" ON public.learning_roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "learning_roadmaps_update_own" ON public.learning_roadmaps;
CREATE POLICY "learning_roadmaps_update_own" ON public.learning_roadmaps FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "learning_roadmaps_delete_own" ON public.learning_roadmaps;
CREATE POLICY "learning_roadmaps_delete_own" ON public.learning_roadmaps FOR DELETE USING (auth.uid() = user_id);

-- user_activity
DROP POLICY IF EXISTS "user_activity_select_own" ON public.user_activity;
CREATE POLICY "user_activity_select_own" ON public.user_activity FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_activity_insert_own" ON public.user_activity;
CREATE POLICY "user_activity_insert_own" ON public.user_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 7. Supabase Storage Configuration (Private 'resumes' Bucket)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    5242880,
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880;

DROP POLICY IF EXISTS "resume_storage_select" ON storage.objects;
CREATE POLICY "resume_storage_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "resume_storage_insert" ON storage.objects;
CREATE POLICY "resume_storage_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "resume_storage_update" ON storage.objects;
CREATE POLICY "resume_storage_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "resume_storage_delete" ON storage.objects;
CREATE POLICY "resume_storage_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==============================================================================
-- 8. Seed Job Roles Data
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
