"""
CareerPilot AI - Skill Normalizer & Canonical Alias Engine
Normalizes abbreviations, acronyms, and variants (e.g. JS -> JavaScript, Postgres -> PostgreSQL).
Identifies exact, alias, and validated equivalent skill matches with evidence extraction.
"""

import re
from typing import Dict, List, Optional, Tuple, Set, Any

# Comprehensive canonical skill mappings and validated synonyms
CANONICAL_SKILL_ALIASES: Dict[str, List[str]] = {
    # Core Languages & Web Fundamentals
    "javascript": ["js", "javascript", "ecmascript", "es6", "es6+", "vanilla js", "modern javascript"],
    "typescript": ["ts", "typescript", "type script"],
    "python": ["py", "python", "python3", "python 3", "python 3.x", "core python"],
    "java": ["java", "core java", "java 8", "java 11", "java 17", "java 21", "j2se"],
    "c++": ["cpp", "c++", "c/c++", "c plus plus"],
    "c#": ["c#", "csharp", "c sharp", ".net c#"],
    "go": ["golang", "go programming", "go language"],
    "html5 & css3": ["html", "html5", "css", "css3", "html/css", "html5/css3", "web markup"],
    "sql": ["sql", "structured query language", "relational queries", "t-sql", "pl/sql", "ansi sql"],

    # Frontend Frameworks & UI
    "react.js": ["react", "reactjs", "react.js", "react js", "react 18", "react native"],
    "next.js": ["nextjs", "next.js", "next js", "next", "ssr"],
    "vue.js": ["vue", "vuejs", "vue.js", "vue 3", "vuex"],
    "angular": ["angular", "angularjs", "angular 2+", "angular.io"],
    "tailwind css": ["tailwind", "tailwindcss", "tailwind-css"],
    "bootstrap": ["bootstrap", "bootstrap 5", "twitter bootstrap"],
    "state management (redux/zustand)": ["redux", "redux toolkit", "rtk", "zustand", "mobx", "recoil", "context api"],
    "responsive web design": ["responsive design", "mobile-first", "flexbox", "css grid", "media queries"],

    # Backend & API Frameworks
    "node.js": ["node", "nodejs", "node.js", "node js"],
    "fastapi": ["fastapi", "fast-api", "fast api", "asgi"],
    "express.js": ["express", "expressjs", "express.js", "express js"],
    "django": ["django", "django rest framework", "drf"],
    "flask": ["flask", "flask-restful"],
    "spring boot": ["spring", "springboot", "spring boot", "spring framework", "spring mvc"],
    "restful apis": [
        "rest", "rest api", "restful api", "restful apis", "restful web services",
        "api integration", "api development", "json api", "http apis", "rest apis"
    ],
    "graphql": ["graphql", "apollo client", "apollo server"],
    "microservices": ["microservices", "microservice architecture", "distributed systems"],

    # Databases & Caching
    "postgresql": ["postgres", "postgresql", "postgre", "psql", "pg database"],
    "mysql": ["mysql", "mariadb"],
    "mongodb": ["mongodb", "mongo", "nosql", "documentdb", "mongoose"],
    "redis": ["redis", "redis cache", "in-memory cache", "key-value store"],
    "sqlite": ["sqlite", "sqlite3"],
    "sqlalchemy": ["sqlalchemy", "python orm", "alembic"],
    "hibernate / jpa": ["hibernate", "jpa", "java persistence api"],

    # Data Science & Machine Learning
    "pandas": ["pandas", "pandas library", "dataframes"],
    "numpy": ["numpy", "numeric python", "array manipulation"],
    "pandas & numpy": ["pandas and numpy", "pandas & numpy", "pandas", "numpy"],
    "scikit-learn": ["sklearn", "scikit-learn", "scikit learn", "classical ml"],
    "pytorch": ["pytorch", "torch", "deep learning pytorch"],
    "tensorflow": ["tensorflow", "tf", "keras"],
    "data visualization": ["matplotlib", "seaborn", "plotly", "d3.js", "visual analytics", "data visualization"],
    "statistics & probability": ["statistics", "probability", "statistical analysis", "hypothesis testing", "ab testing", "bayesian"],
    "feature engineering": ["feature engineering", "feature extraction", "feature selection", "data preprocessing"],
    "power bi": ["powerbi", "power bi", "dax", "power query"],
    "tableau": ["tableau", "tableau desktop", "tableau server"],
    "microsoft excel": ["excel", "ms excel", "microsoft excel", "vlookup", "pivot tables", "advanced excel"],
    "nlp or computer vision": ["nlp", "natural language processing", "spacy", "huggingface", "transformers", "opencv", "computer vision"],
    "mlflow": ["mlflow", "wandb", "weights & biases", "experiment tracking"],

    # Cloud & DevOps & Tooling
    "git": ["git", "github", "gitlab", "bitbucket", "version control", "git workflow"],
    "docker": ["docker", "containerization", "containers", "dockerfile", "docker-compose"],
    "kubernetes": ["kubernetes", "k8s", "container orchestration", "helm"],
    "linux": ["linux", "unix", "ubuntu", "debian", "centos", "bash", "shell scripting", "shell"],
    "cloud platform (aws / gcp / azure)": [
        "aws", "amazon web services", "gcp", "google cloud", "google cloud platform",
        "azure", "microsoft azure", "cloud computing", "ec2", "s3", "lambda"
    ],
    "ci/cd": ["ci/cd", "ci-cd", "continuous integration", "github actions", "jenkins", "gitlab ci", "continuous delivery"],
    "ci/cd (github actions / jenkins)": ["ci/cd", "github actions", "jenkins", "gitlab ci", "automated pipeline"],
    "unit testing": ["unit testing", "pytest", "jest", "junit", "tdd", "test driven development", "vitest", "mocha"],
    "object-oriented programming": ["oop", "oops", "object oriented programming", "solid principles", "design patterns"],
    "data structures & algorithms": ["dsa", "data structures", "algorithms", "problem solving", "competitive programming", "leetcode"],
    "authentication (jwt / oauth)": ["jwt", "oauth", "oauth2", "json web token", "user authentication", "rbac", "session auth"],
    "terraform / iac": ["terraform", "iac", "infrastructure as code", "cloudformation"],
    "networking fundamentals": ["networking", "tcp/ip", "dns", "http/https", "vpc", "subnet", "load balancer"],
}

# Reverse lookup mapping from variant -> canonical key
_VARIANT_TO_CANONICAL: Dict[str, str] = {}
for canonical, variants in CANONICAL_SKILL_ALIASES.items():
    _VARIANT_TO_CANONICAL[canonical.lower()] = canonical
    for variant in variants:
        _VARIANT_TO_CANONICAL[variant.lower()] = canonical

def clean_skill_string(s: str) -> str:
    """Cleans punctuation, lowercases, and strips extra spaces from skill string."""
    cleaned = re.sub(r"[^\w\s\+\#\.\/\-]", " ", s.lower())
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def get_canonical_skill(skill: str) -> str:
    """Returns canonical name for a skill, or the cleaned input if not found."""
    cleaned = clean_skill_string(skill)
    if cleaned in _VARIANT_TO_CANONICAL:
        return _VARIANT_TO_CANONICAL[cleaned]

    # Check for direct alias substrings
    for variant, canonical in _VARIANT_TO_CANONICAL.items():
        pattern = rf"\b{re.escape(variant)}\b"
        if re.search(pattern, cleaned):
            return canonical

    return skill.strip()

def match_skill_candidate(
    target_skill_def: Dict[str, Any],
    candidate_skills: List[str],
    resume_full_text: str = ""
) -> Tuple[bool, Optional[str], Optional[str], float]:
    """
    Checks if a target skill is matched against candidate skills or full resume text.
    Enforces that semantic similarity alone is NOT used as proof of skill possession.

    Returns:
        (is_matched, match_type, matched_candidate_term, confidence)
        match_type can be 'exact', 'alias', 'canonical', 'evidence'
    """
    target_name = target_skill_def.get("name", "")
    target_canonical = target_skill_def.get("canonical", get_canonical_skill(target_name)).lower()
    target_aliases = [clean_skill_string(a) for a in target_skill_def.get("aliases", [])]
    target_clean = clean_skill_string(target_name)

    # 1. Exact Match against candidate's extracted skills
    for cand in candidate_skills:
        cand_clean = clean_skill_string(cand)
        if cand_clean == target_clean:
            return (True, "exact", cand, 1.0)

    # 2. Canonical Match against candidate's extracted skills
    for cand in candidate_skills:
        cand_canonical = get_canonical_skill(cand).lower()
        if cand_canonical == target_canonical:
            return (True, "canonical", cand, 0.98)

    # 3. Alias / Variant Match against candidate's extracted skills
    for cand in candidate_skills:
        cand_clean = clean_skill_string(cand)
        if cand_clean in target_aliases:
            return (True, "alias", cand, 0.95)
        # Check reverse aliases
        if cand_clean in _VARIANT_TO_CANONICAL:
            mapped = _VARIANT_TO_CANONICAL[cand_clean].lower()
            if mapped == target_canonical or mapped == target_clean:
                return (True, "alias", cand, 0.95)

    # 4. Direct Evidence in resume full text (Exact / Word Boundary match)
    if resume_full_text:
        text_lower = resume_full_text.lower()
        # Look for target name on word boundary
        pattern = rf"\b{re.escape(target_clean)}\b"
        if re.search(pattern, text_lower):
            return (True, "evidence", target_name, 0.92)

        # Look for target canonical or aliases on word boundaries
        for alias in target_aliases:
            if len(alias) >= 2:
                alias_pattern = rf"\b{re.escape(alias)}\b"
                if re.search(alias_pattern, text_lower):
                    return (True, "evidence_alias", alias, 0.90)

    return (False, None, None, 0.0)

def extract_evidence_snippets(skill_name: str, aliases: List[str], full_text: str) -> Optional[str]:
    """
    Locates the most descriptive sentence or bullet point from the resume
    that demonstrates evidence of the skill or experience.
    """
    if not full_text:
        return None

    # Split text into lines/sentences
    lines = [ln.strip() for ln in full_text.split("\n") if ln.strip()]
    search_terms = [clean_skill_string(skill_name)] + [clean_skill_string(a) for a in aliases if len(a) > 1]

    best_sentence = None
    best_length = 0

    for line in lines:
        line_clean = line.lower()
        for term in search_terms:
            pattern = rf"\b{re.escape(term)}\b"
            if re.search(pattern, line_clean):
                # Clean up bullet characters
                cleaned_line = re.sub(r"^[\-\*\•\d\.\s]+", "", line).strip()
                if 20 <= len(cleaned_line) <= 220:
                    return cleaned_line
                elif len(cleaned_line) > best_length:
                    best_sentence = cleaned_line[:220] + "..." if len(cleaned_line) > 220 else cleaned_line
                    best_length = len(cleaned_line)

    return best_sentence
