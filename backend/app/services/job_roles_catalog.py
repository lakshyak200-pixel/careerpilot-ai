"""
CareerPilot AI - Curated Entry-Level Job Roles Catalog
Provides editable, configurable benchmarks for entry-level tech roles with
required skills, preferred skills, skill categories, and importance weights.
"""

from typing import Dict, List, Any, Optional
import copy

# Importance multipliers for scoring
IMPORTANCE_WEIGHTS = {
    "critical": 1.5,
    "high": 1.2,
    "medium": 1.0,
    "low": 0.7,
}

CURATED_JOB_ROLES: Dict[str, Dict[str, Any]] = {
    "software-developer": {
        "id": "role-swe-01",
        "slug": "software-developer",
        "title": "Software Developer",
        "category": "Software Engineering",
        "experience_level": "entry_level",
        "description": "Designs, writes, tests, and debugs scalable software applications across system architectures.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Core Programming Languages",
            "Data Structures & Algorithms",
            "Databases",
            "Version Control & Tools",
            "Software Architecture & Testing",
        ],
        "required_skills": [
            {"name": "Python", "canonical": "python", "category": "Core Programming Languages", "importance": "critical", "weight": 1.5, "aliases": ["py", "python3"]},
            {"name": "Data Structures & Algorithms", "canonical": "data structures & algorithms", "category": "Data Structures & Algorithms", "importance": "critical", "weight": 1.5, "aliases": ["dsa", "data structures", "algorithms"]},
            {"name": "Object-Oriented Programming", "canonical": "object-oriented programming", "category": "Software Architecture & Testing", "importance": "critical", "weight": 1.5, "aliases": ["oop", "oops", "object oriented design"]},
            {"name": "SQL", "canonical": "sql", "category": "Databases", "importance": "high", "weight": 1.2, "aliases": ["structured query language", "relational database"]},
            {"name": "Git", "canonical": "git", "category": "Version Control & Tools", "importance": "high", "weight": 1.2, "aliases": ["github", "gitlab", "version control"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "Software Architecture & Testing", "importance": "high", "weight": 1.2, "aliases": ["rest api", "rest", "api development", "restful web services"]},
        ],
        "preferred_skills": [
            {"name": "Docker", "canonical": "docker", "category": "Version Control & Tools", "importance": "medium", "weight": 1.0, "aliases": ["containerization", "containers"]},
            {"name": "Linux", "canonical": "linux", "category": "Version Control & Tools", "importance": "medium", "weight": 1.0, "aliases": ["unix", "bash", "shell scripting"]},
            {"name": "Unit Testing", "canonical": "unit testing", "category": "Software Architecture & Testing", "importance": "medium", "weight": 1.0, "aliases": ["pytest", "junit", "tdd", "jest"]},
            {"name": "CI/CD", "canonical": "ci/cd", "category": "Version Control & Tools", "importance": "low", "weight": 0.7, "aliases": ["continuous integration", "github actions"]},
        ]
    },

    "full-stack-developer": {
        "id": "role-fullstack-02",
        "slug": "full-stack-developer",
        "title": "Full Stack Developer",
        "category": "Web & Cloud Development",
        "experience_level": "entry_level",
        "description": "Bridges responsive web client interfaces with robust server-side APIs, business logic, and databases.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Frontend Technologies",
            "Backend Technologies",
            "Databases",
            "DevOps & Tools",
        ],
        "required_skills": [
            {"name": "JavaScript", "canonical": "javascript", "category": "Frontend Technologies", "importance": "critical", "weight": 1.5, "aliases": ["js", "es6", "ecmascript"]},
            {"name": "React.js", "canonical": "react.js", "category": "Frontend Technologies", "importance": "critical", "weight": 1.5, "aliases": ["react", "reactjs"]},
            {"name": "Node.js", "canonical": "node.js", "category": "Backend Technologies", "importance": "critical", "weight": 1.5, "aliases": ["node", "nodejs"]},
            {"name": "HTML5 & CSS3", "canonical": "html5 & css3", "category": "Frontend Technologies", "importance": "high", "weight": 1.2, "aliases": ["html", "css", "html5", "css3"]},
            {"name": "PostgreSQL", "canonical": "postgresql", "category": "Databases", "importance": "high", "weight": 1.2, "aliases": ["postgres", "postgresql", "pg"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "Backend Technologies", "importance": "high", "weight": 1.2, "aliases": ["rest", "rest api", "web apis"]},
            {"name": "Git", "canonical": "git", "category": "DevOps & Tools", "importance": "high", "weight": 1.2, "aliases": ["github", "version control"]},
        ],
        "preferred_skills": [
            {"name": "TypeScript", "canonical": "typescript", "category": "Frontend Technologies", "importance": "high", "weight": 1.2, "aliases": ["ts"]},
            {"name": "Tailwind CSS", "canonical": "tailwind css", "category": "Frontend Technologies", "importance": "medium", "weight": 1.0, "aliases": ["tailwind"]},
            {"name": "Docker", "canonical": "docker", "category": "DevOps & Tools", "importance": "medium", "weight": 1.0, "aliases": ["containers", "containerization"]},
            {"name": "MongoDB", "canonical": "mongodb", "category": "Databases", "importance": "medium", "weight": 1.0, "aliases": ["mongo", "nosql"]},
            {"name": "Next.js", "canonical": "next.js", "category": "Frontend Technologies", "importance": "low", "weight": 0.7, "aliases": ["nextjs", "next"]},
        ]
    },

    "data-analyst": {
        "id": "role-da-03",
        "slug": "data-analyst",
        "title": "Data Analyst",
        "category": "Data & Analytics",
        "experience_level": "entry_level",
        "description": "Transforms structured and unstructured business datasets into actionable operational dashboards and insights.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Querying & Data Manipulation",
            "Statistical Analysis & Programming",
            "Business Intelligence & Visualization",
            "Data Storytelling",
        ],
        "required_skills": [
            {"name": "SQL", "canonical": "sql", "category": "Querying & Data Manipulation", "importance": "critical", "weight": 1.5, "aliases": ["mysql", "postgresql", "t-sql", "complex queries"]},
            {"name": "Python", "canonical": "python", "category": "Statistical Analysis & Programming", "importance": "critical", "weight": 1.5, "aliases": ["py", "python3"]},
            {"name": "Pandas", "canonical": "pandas", "category": "Statistical Analysis & Programming", "importance": "critical", "weight": 1.5, "aliases": ["dataframes", "pandas library"]},
            {"name": "Microsoft Excel", "canonical": "microsoft excel", "category": "Querying & Data Manipulation", "importance": "high", "weight": 1.2, "aliases": ["excel", "vlookup", "pivot tables", "spreadsheet"]},
            {"name": "Data Visualization", "canonical": "data visualization", "category": "Business Intelligence & Visualization", "importance": "high", "weight": 1.2, "aliases": ["matplotlib", "seaborn", "charts", "visual dashboards"]},
        ],
        "preferred_skills": [
            {"name": "Power BI", "canonical": "power bi", "category": "Business Intelligence & Visualization", "importance": "high", "weight": 1.2, "aliases": ["powerbi", "dax"]},
            {"name": "Tableau", "canonical": "tableau", "category": "Business Intelligence & Visualization", "importance": "high", "weight": 1.2, "aliases": ["tableau desktop"]},
            {"name": "NumPy", "canonical": "numpy", "category": "Statistical Analysis & Programming", "importance": "medium", "weight": 1.0, "aliases": ["numeric python"]},
            {"name": "Statistical Analysis", "canonical": "statistical analysis", "category": "Statistical Analysis & Programming", "importance": "medium", "weight": 1.0, "aliases": ["statistics", "hypothesis testing", "ab testing"]},
        ]
    },

    "data-scientist": {
        "id": "role-ds-04",
        "slug": "data-scientist",
        "title": "Data Scientist",
        "category": "Data & Artificial Intelligence",
        "experience_level": "entry_level",
        "description": "Applies statistical modeling, exploratory data analysis, and predictive machine learning models to solve business challenges.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Programming & Mathematics",
            "Data Wrangling & Exploration",
            "Machine Learning Algorithms",
            "Model Evaluation",
        ],
        "required_skills": [
            {"name": "Python", "canonical": "python", "category": "Programming & Mathematics", "importance": "critical", "weight": 1.5, "aliases": ["py"]},
            {"name": "Pandas", "canonical": "pandas", "category": "Data Wrangling & Exploration", "importance": "critical", "weight": 1.5, "aliases": ["data wrangling"]},
            {"name": "Scikit-Learn", "canonical": "scikit-learn", "category": "Machine Learning Algorithms", "importance": "critical", "weight": 1.5, "aliases": ["sklearn", "scikit learn"]},
            {"name": "SQL", "canonical": "sql", "category": "Data Wrangling & Exploration", "importance": "high", "weight": 1.2, "aliases": ["database queries"]},
            {"name": "Statistics & Probability", "canonical": "statistics & probability", "category": "Programming & Mathematics", "importance": "high", "weight": 1.2, "aliases": ["statistics", "probabilistic modeling", "hypothesis testing"]},
            {"name": "NumPy", "canonical": "numpy", "category": "Programming & Mathematics", "importance": "high", "weight": 1.2, "aliases": ["linear algebra"]},
        ],
        "preferred_skills": [
            {"name": "Data Visualization", "canonical": "data visualization", "category": "Data Wrangling & Exploration", "importance": "medium", "weight": 1.0, "aliases": ["seaborn", "matplotlib", "plotly"]},
            {"name": "Feature Engineering", "canonical": "feature engineering", "category": "Machine Learning Algorithms", "importance": "medium", "weight": 1.0, "aliases": ["feature selection", "data preprocessing"]},
            {"name": "Jupyter Notebooks", "canonical": "jupyter notebooks", "category": "Programming & Mathematics", "importance": "medium", "weight": 1.0, "aliases": ["jupyter", "colab"]},
            {"name": "Deep Learning Basics", "canonical": "deep learning basics", "category": "Machine Learning Algorithms", "importance": "low", "weight": 0.7, "aliases": ["pytorch", "tensorflow", "neural networks"]},
        ]
    },

    "machine-learning-engineer": {
        "id": "role-mle-05",
        "slug": "machine-learning-engineer",
        "title": "Machine Learning Engineer",
        "category": "Artificial Intelligence",
        "experience_level": "entry_level",
        "description": "Constructs production ML pipelines, feature stores, neural network architectures, and real-time model inference servers.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Core ML & Deep Learning",
            "Model Serving & APIs",
            "Data Pipeline Engineering",
            "MLOps & Deployment",
        ],
        "required_skills": [
            {"name": "Python", "canonical": "python", "category": "Core ML & Deep Learning", "importance": "critical", "weight": 1.5, "aliases": ["py", "python3"]},
            {"name": "Scikit-Learn", "canonical": "scikit-learn", "category": "Core ML & Deep Learning", "importance": "critical", "weight": 1.5, "aliases": ["sklearn"]},
            {"name": "PyTorch", "canonical": "pytorch", "category": "Core ML & Deep Learning", "importance": "critical", "weight": 1.5, "aliases": ["torch"]},
            {"name": "Pandas & NumPy", "canonical": "pandas & numpy", "category": "Data Pipeline Engineering", "importance": "high", "weight": 1.2, "aliases": ["pandas", "numpy", "data manipulation"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "Model Serving & APIs", "importance": "high", "weight": 1.2, "aliases": ["fastapi", "flask", "model serving"]},
            {"name": "Git", "canonical": "git", "category": "MLOps & Deployment", "importance": "high", "weight": 1.2, "aliases": ["github", "version control"]},
        ],
        "preferred_skills": [
            {"name": "Docker", "canonical": "docker", "category": "MLOps & Deployment", "importance": "high", "weight": 1.2, "aliases": ["containerization", "containers"]},
            {"name": "TensorFlow", "canonical": "tensorflow", "category": "Core ML & Deep Learning", "importance": "medium", "weight": 1.0, "aliases": ["tf", "keras"]},
            {"name": "NLP or Computer Vision", "canonical": "nlp or computer vision", "category": "Core ML & Deep Learning", "importance": "medium", "weight": 1.0, "aliases": ["nlp", "huggingface", "transformers", "opencv", "computer vision"]},
            {"name": "MLflow", "canonical": "mlflow", "category": "MLOps & Deployment", "importance": "low", "weight": 0.7, "aliases": ["model tracking", "experiment tracking", "wandb"]},
        ]
    },

    "python-developer": {
        "id": "role-py-06",
        "slug": "python-developer",
        "title": "Python Developer",
        "category": "Backend Engineering",
        "experience_level": "entry_level",
        "description": "Specializes in building Python-based web services, asynchronous microservices, data parsers, and automation scripts.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Python Core & Ecosystem",
            "Web Frameworks",
            "Database Systems",
            "Testing & Automation",
        ],
        "required_skills": [
            {"name": "Python", "canonical": "python", "category": "Python Core & Ecosystem", "importance": "critical", "weight": 1.5, "aliases": ["py", "python3", "python 3"]},
            {"name": "FastAPI", "canonical": "fastapi", "category": "Web Frameworks", "importance": "critical", "weight": 1.5, "aliases": ["fast-api", "django", "flask"]},
            {"name": "SQL", "canonical": "sql", "category": "Database Systems", "importance": "critical", "weight": 1.5, "aliases": ["postgresql", "sqlite", "mysql"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "Web Frameworks", "importance": "high", "weight": 1.2, "aliases": ["api integration", "rest api"]},
            {"name": "Object-Oriented Programming", "canonical": "object-oriented programming", "category": "Python Core & Ecosystem", "importance": "high", "weight": 1.2, "aliases": ["oop", "oops"]},
            {"name": "Git", "canonical": "git", "category": "Testing & Automation", "importance": "high", "weight": 1.2, "aliases": ["github"]},
        ],
        "preferred_skills": [
            {"name": "PostgreSQL", "canonical": "postgresql", "category": "Database Systems", "importance": "high", "weight": 1.2, "aliases": ["postgres", "psql"]},
            {"name": "SQLAlchemy", "canonical": "sqlalchemy", "category": "Database Systems", "importance": "medium", "weight": 1.0, "aliases": ["orm", "alembic"]},
            {"name": "Pytest", "canonical": "pytest", "category": "Testing & Automation", "importance": "medium", "weight": 1.0, "aliases": ["unit testing", "test automation"]},
            {"name": "Docker", "canonical": "docker", "category": "Testing & Automation", "importance": "medium", "weight": 1.0, "aliases": ["containers"]},
            {"name": "Redis", "canonical": "redis", "category": "Database Systems", "importance": "low", "weight": 0.7, "aliases": ["caching", "in-memory cache"]},
        ]
    },

    "java-developer": {
        "id": "role-java-07",
        "slug": "java-developer",
        "title": "Java Developer",
        "category": "Enterprise Software Engineering",
        "experience_level": "entry_level",
        "description": "Constructs enterprise web applications, distributed microservices, and reliable multithreaded systems with Java.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Java Core & OOP",
            "Enterprise Frameworks",
            "Relational Databases",
            "Build Tools & DevOps",
        ],
        "required_skills": [
            {"name": "Java", "canonical": "java", "category": "Java Core & OOP", "importance": "critical", "weight": 1.5, "aliases": ["core java", "java 11", "java 17", "java 8"]},
            {"name": "Object-Oriented Programming", "canonical": "object-oriented programming", "category": "Java Core & OOP", "importance": "critical", "weight": 1.5, "aliases": ["oop", "oops", "design patterns"]},
            {"name": "Spring Boot", "canonical": "spring boot", "category": "Enterprise Frameworks", "importance": "critical", "weight": 1.5, "aliases": ["spring", "springboot", "spring framework"]},
            {"name": "SQL", "canonical": "sql", "category": "Relational Databases", "importance": "high", "weight": 1.2, "aliases": ["mysql", "postgresql", "oracle db"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "Enterprise Frameworks", "importance": "high", "weight": 1.2, "aliases": ["rest", "rest api"]},
            {"name": "Git", "canonical": "git", "category": "Build Tools & DevOps", "importance": "high", "weight": 1.2, "aliases": ["github"]},
        ],
        "preferred_skills": [
            {"name": "Hibernate / JPA", "canonical": "hibernate / jpa", "category": "Relational Databases", "importance": "high", "weight": 1.2, "aliases": ["hibernate", "jpa"]},
            {"name": "Maven or Gradle", "canonical": "maven or gradle", "category": "Build Tools & DevOps", "importance": "medium", "weight": 1.0, "aliases": ["maven", "gradle"]},
            {"name": "JUnit & Mockito", "canonical": "junit & mockito", "category": "Build Tools & DevOps", "importance": "medium", "weight": 1.0, "aliases": ["junit", "mockito", "unit testing"]},
            {"name": "Docker", "canonical": "docker", "category": "Build Tools & DevOps", "importance": "medium", "weight": 1.0, "aliases": ["containers"]},
            {"name": "Microservices", "canonical": "microservices", "category": "Enterprise Frameworks", "importance": "low", "weight": 0.7, "aliases": ["microservice architecture"]},
        ]
    },

    "frontend-developer": {
        "id": "role-fe-08",
        "slug": "frontend-developer",
        "title": "Frontend Developer",
        "category": "User Interface & Experience",
        "experience_level": "entry_level",
        "description": "Builds responsive, high-performance, accessible, and user-friendly web client applications using modern JS frameworks.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Core Web Standards",
            "Modern JavaScript Frameworks",
            "CSS Architecture & Styling",
            "Developer Tooling & Build Systems",
        ],
        "required_skills": [
            {"name": "JavaScript", "canonical": "javascript", "category": "Core Web Standards", "importance": "critical", "weight": 1.5, "aliases": ["js", "es6", "vanilla js"]},
            {"name": "React.js", "canonical": "react.js", "category": "Modern JavaScript Frameworks", "importance": "critical", "weight": 1.5, "aliases": ["react", "reactjs"]},
            {"name": "HTML5 & CSS3", "canonical": "html5 & css3", "category": "Core Web Standards", "importance": "critical", "weight": 1.5, "aliases": ["html", "css", "html5", "css3"]},
            {"name": "Responsive Web Design", "canonical": "responsive web design", "category": "CSS Architecture & Styling", "importance": "high", "weight": 1.2, "aliases": ["responsive design", "mobile first", "flexbox", "css grid"]},
            {"name": "RESTful API Integration", "canonical": "restful apis", "category": "Core Web Standards", "importance": "high", "weight": 1.2, "aliases": ["fetch api", "axios", "api integration"]},
            {"name": "Git", "canonical": "git", "category": "Developer Tooling & Build Systems", "importance": "high", "weight": 1.2, "aliases": ["github"]},
        ],
        "preferred_skills": [
            {"name": "TypeScript", "canonical": "typescript", "category": "Core Web Standards", "importance": "high", "weight": 1.2, "aliases": ["ts"]},
            {"name": "Tailwind CSS", "canonical": "tailwind css", "category": "CSS Architecture & Styling", "importance": "high", "weight": 1.2, "aliases": ["tailwind"]},
            {"name": "State Management (Redux/Zustand)", "canonical": "state management (redux/zustand)", "category": "Modern JavaScript Frameworks", "importance": "medium", "weight": 1.0, "aliases": ["redux", "zustand", "redux toolkit", "context api"]},
            {"name": "Next.js", "canonical": "next.js", "category": "Modern JavaScript Frameworks", "importance": "medium", "weight": 1.0, "aliases": ["nextjs", "ssr"]},
            {"name": "Web Performance & SEO", "canonical": "web performance & seo", "category": "Developer Tooling & Build Systems", "importance": "low", "weight": 0.7, "aliases": ["lighthouse", "web vitals", "performance optimization"]},
        ]
    },

    "backend-developer": {
        "id": "role-be-09",
        "slug": "backend-developer",
        "title": "Backend Developer",
        "category": "Server & Cloud Architecture",
        "experience_level": "entry_level",
        "description": "Architects server-side logic, database queries, authentication pipelines, and high-throughput REST/GraphQL APIs.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Server-Side Languages",
            "API Architecture & Protocols",
            "Database Design & Optimization",
            "Authentication & Security",
            "Deployment & Infrastructure",
        ],
        "required_skills": [
            {"name": "Python or Node.js", "canonical": "python or node.js", "category": "Server-Side Languages", "importance": "critical", "weight": 1.5, "aliases": ["python", "node.js", "node", "nodejs", "py"]},
            {"name": "SQL", "canonical": "sql", "category": "Database Design & Optimization", "importance": "critical", "weight": 1.5, "aliases": ["postgresql", "mysql", "queries"]},
            {"name": "RESTful APIs", "canonical": "restful apis", "category": "API Architecture & Protocols", "importance": "critical", "weight": 1.5, "aliases": ["rest", "api design", "rest api"]},
            {"name": "PostgreSQL", "canonical": "postgresql", "category": "Database Design & Optimization", "importance": "high", "weight": 1.2, "aliases": ["postgres", "pg"]},
            {"name": "Authentication (JWT / OAuth)", "canonical": "authentication (jwt / oauth)", "category": "Authentication & Security", "importance": "high", "weight": 1.2, "aliases": ["jwt", "oauth", "oauth2", "session auth"]},
            {"name": "Git", "canonical": "git", "category": "Deployment & Infrastructure", "importance": "high", "weight": 1.2, "aliases": ["github"]},
        ],
        "preferred_skills": [
            {"name": "Docker", "canonical": "docker", "category": "Deployment & Infrastructure", "importance": "high", "weight": 1.2, "aliases": ["containers", "dockerfile"]},
            {"name": "FastAPI or Express.js", "canonical": "fastapi or express.js", "category": "Server-Side Languages", "importance": "high", "weight": 1.2, "aliases": ["fastapi", "express", "express.js"]},
            {"name": "Redis", "canonical": "redis", "category": "Database Design & Optimization", "importance": "medium", "weight": 1.0, "aliases": ["caching", "in-memory"]},
            {"name": "Linux & Bash", "canonical": "linux & bash", "category": "Deployment & Infrastructure", "importance": "medium", "weight": 1.0, "aliases": ["linux", "bash", "shell"]},
            {"name": "Microservices", "canonical": "microservices", "category": "API Architecture & Protocols", "importance": "low", "weight": 0.7, "aliases": ["distributed systems"]},
        ]
    },

    "cloud-engineer": {
        "id": "role-cloud-10",
        "slug": "cloud-engineer",
        "title": "Cloud Engineer",
        "category": "Infrastructure & Cloud Platforms",
        "experience_level": "entry_level",
        "description": "Deploys, monitors, and optimizes cloud computing infrastructure, containerized workloads, and CI/CD automation pipelines.",
        "scoring_weights": {
            "required_percentage": 0.70,
            "preferred_percentage": 0.30,
        },
        "skill_categories": [
            "Cloud Platforms",
            "Containers & Orchestration",
            "Operating Systems & Scripting",
            "Infrastructure as Code & CI/CD",
            "Networking & Security",
        ],
        "required_skills": [
            {"name": "Linux", "canonical": "linux", "category": "Operating Systems & Scripting", "importance": "critical", "weight": 1.5, "aliases": ["ubuntu", "bash", "shell scripting", "unix"]},
            {"name": "Docker", "canonical": "docker", "category": "Containers & Orchestration", "importance": "critical", "weight": 1.5, "aliases": ["containers", "docker-compose"]},
            {"name": "Cloud Platform (AWS / GCP / Azure)", "canonical": "cloud platform (aws / gcp / azure)", "category": "Cloud Platforms", "importance": "critical", "weight": 1.5, "aliases": ["aws", "gcp", "azure", "amazon web services", "google cloud"]},
            {"name": "Python or Bash Scripting", "canonical": "python or bash scripting", "category": "Operating Systems & Scripting", "importance": "high", "weight": 1.2, "aliases": ["python", "bash", "automation scripts"]},
            {"name": "Networking Fundamentals", "canonical": "networking fundamentals", "category": "Networking & Security", "importance": "high", "weight": 1.2, "aliases": ["tcp/ip", "dns", "http/https", "vpc", "subnet"]},
            {"name": "Git", "canonical": "git", "category": "Infrastructure as Code & CI/CD", "importance": "high", "weight": 1.2, "aliases": ["github", "gitlab"]},
        ],
        "preferred_skills": [
            {"name": "Kubernetes", "canonical": "kubernetes", "category": "Containers & Orchestration", "importance": "high", "weight": 1.2, "aliases": ["k8s", "cluster management"]},
            {"name": "CI/CD (GitHub Actions / Jenkins)", "canonical": "ci/cd (github actions / jenkins)", "category": "Infrastructure as Code & CI/CD", "importance": "high", "weight": 1.2, "aliases": ["ci/cd", "github actions", "jenkins", "gitlab ci"]},
            {"name": "Terraform / IaC", "canonical": "terraform / iac", "category": "Infrastructure as Code & CI/CD", "importance": "medium", "weight": 1.0, "aliases": ["terraform", "iac", "infrastructure as code"]},
            {"name": "Cloud Security & IAM", "canonical": "cloud security & iam", "category": "Networking & Security", "importance": "medium", "weight": 1.0, "aliases": ["iam", "cloud security", "least privilege"]},
            {"name": "Cloud Monitoring (Prometheus/Grafana/CloudWatch)", "canonical": "cloud monitoring", "category": "Infrastructure as Code & CI/CD", "importance": "low", "weight": 0.7, "aliases": ["cloudwatch", "prometheus", "grafana"]},
        ]
    }
}

# Runtime editable store allowing users/admins to reconfigure skills & weights
_RUNTIME_ROLES_STORE: Dict[str, Dict[str, Any]] = copy.deepcopy(CURATED_JOB_ROLES)

def get_all_roles() -> List[Dict[str, Any]]:
    """Returns a list of all active curated job roles."""
    return list(_RUNTIME_ROLES_STORE.values())

def get_role_by_slug(slug_or_name: str) -> Optional[Dict[str, Any]]:
    """Finds a role by slug, id, or normalized name."""
    target = slug_or_name.strip().lower().replace(" ", "-").replace("_", "-")
    for role in _RUNTIME_ROLES_STORE.values():
        if (
            role["slug"] == target
            or role["id"] == slug_or_name
            or role["title"].lower() == slug_or_name.strip().lower()
        ):
            return copy.deepcopy(role)
    return None

def update_role_config(slug: str, new_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates a role's configuration, required skills, preferred skills, or weights.
    Maintains editability as requested in the specifications.
    """
    target = slug.strip().lower().replace(" ", "-")
    for key, role in _RUNTIME_ROLES_STORE.items():
        if role["slug"] == target or key == target:
            if "required_skills" in new_config:
                role["required_skills"] = new_config["required_skills"]
            if "preferred_skills" in new_config:
                role["preferred_skills"] = new_config["preferred_skills"]
            if "scoring_weights" in new_config:
                role["scoring_weights"].update(new_config["scoring_weights"])
            if "description" in new_config:
                role["description"] = new_config["description"]
            return copy.deepcopy(role)
    return None

