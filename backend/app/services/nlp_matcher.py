"""
CareerPilot AI - Modular NLP & Sentence Transformers Contextual Matcher
Provides explainable NLP embeddings, semantic similarity, and contextual suggestions.
Modular design allows swapping/fine-tuning models on domain-specific resume & JD datasets.
NOTE: As required, semantic similarity alone is NEVER treated as proof of skill possession.
"""

import math
import re
from typing import List, Dict, Any, Optional, Tuple

class BaseSemanticModel:
    """Abstract interface for swappable semantic embedding models."""
    def encode(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError

    def compute_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        raise NotImplementedError


class SentenceTransformerModel(BaseSemanticModel):
    """Production Sentence Transformers model (e.g. all-MiniLM-L6-v2)."""
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        from sentence_transformers import SentenceTransformer  # type: ignore
        self.model = SentenceTransformer(model_name)

    def encode(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]

    def compute_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a)) or 1e-9
        norm_b = math.sqrt(sum(b * b for b in vec_b)) or 1e-9
        return max(0.0, min(1.0, dot / (norm_a * norm_b)))


class TermFrequencySemanticModel(BaseSemanticModel):
    """
    Modular deterministic vector space model (n-gram TF-IDF & subword tokens).
    Provides rapid, zero-dependency cosine similarity and contextual matching.
    """
    def __init__(self):
        pass

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r"\b[a-zA-Z0-9\+\#\.\-]{2,}\b", text.lower())
        tokens = list(words)
        # Add character 3-grams for typo-resilient subword matching
        for w in words:
            if len(w) >= 3:
                for i in range(len(w) - 2):
                    tokens.append(w[i:i+3])
        return tokens

    def encode(self, texts: List[str]) -> List[List[float]]:
        # Build shared vocabulary
        tokenized = [self._tokenize(t) for t in texts]
        vocab: Dict[str, int] = {}
        for doc in tokenized:
            for token in doc:
                if token not in vocab:
                    vocab[token] = len(vocab)

        vectors = []
        for doc in tokenized:
            vec = [0.0] * len(vocab)
            for token in doc:
                idx = vocab[token]
                vec[idx] += 1.0
            # Normalize vector
            magnitude = math.sqrt(sum(v * v for v in vec)) or 1.0
            vectors.append([v / magnitude for v in vec])
        return vectors

    def compute_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        min_len = min(len(vec_a), len(vec_b))
        if min_len == 0:
            return 0.0
        dot = sum(vec_a[i] * vec_b[i] for i in range(min_len))
        return max(0.0, min(1.0, dot))


class ModularNlpSemanticEngine:
    """
    Engine orchestrator for contextual matching and semantic suggestions.
    Gracefully initializes Sentence Transformers if installed; falls back
    to the modular TF-IDF vector engine without failing.
    """
    def __init__(self):
        self._model: Optional[BaseSemanticModel] = None
        self._model_name: str = "TF-IDF N-Gram Vector Engine"
        self._init_model()

    def _init_model(self):
        try:
            import sentence_transformers  # noqa: F401
            self._model = SentenceTransformerModel()
            self._model_name = "SentenceTransformer (all-MiniLM-L6-v2)"
        except Exception:
            self._model = TermFrequencySemanticModel()
            self._model_name = "Modular TF-IDF Vector Baseline"

    @property
    def model_name(self) -> str:
        return self._model_name

    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """Computes cosine similarity between two text snippets."""
        if not text_a.strip() or not text_b.strip():
            return 0.0
        vectors = self._model.encode([text_a, text_b])
        return self._model.compute_similarity(vectors[0], vectors[1])

    def generate_contextual_suggestions(
        self,
        resume_text: str,
        missing_skills: List[Dict[str, Any]],
        matched_skills: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Analyzes the resume text against missing skills to identify
        contextual overlaps where the student mentions related workflows
        (e.g. mentions FastAPI and PostgreSQL -> suggests adding ORM or Docker).
        """
        if not missing_skills:
            return []

        suggestions = []
        resume_lower = resume_text.lower()

        # Domain contextual pairing heuristics
        RELATED_PAIRS = {
            "docker": ["deployment", "server", "fastapi", "node.js", "backend", "cloud", "aws"],
            "postgresql": ["sql", "database", "crud", "queries", "backend", "fastapi"],
            "typescript": ["javascript", "react", "frontend", "components", "web"],
            "scikit-learn": ["python", "pandas", "machine learning", "regression", "classification"],
            "restful apis": ["fastapi", "express", "backend", "http", "fetch", "endpoints"],
            "unit testing": ["pytest", "jest", "functions", "backend", "test"],
            "tailwind css": ["css", "html", "react", "responsive", "ui"],
            "ci/cd": ["git", "github", "testing", "deployment", "pipeline"],
            "redis": ["caching", "fastapi", "performance", "session", "database"],
            "pandas": ["python", "data", "excel", "analysis", "visualization"],
        }

        for skill in missing_skills:
            skill_name = skill.get("name", "")
            canonical = skill.get("canonical", skill_name.lower())
            related_signals = RELATED_PAIRS.get(canonical, [])

            found_signals = [sig for sig in related_signals if sig in resume_lower]
            if len(found_signals) >= 2:
                suggestions.append({
                    "skill": skill_name,
                    "category": skill.get("category", "General"),
                    "importance": skill.get("importance", "medium"),
                    "confidence_score": round(0.55 + 0.1 * min(len(found_signals), 3), 2),
                    "contextual_rationale": (
                        f"Your resume mentions related competencies ({', '.join(found_signals[:3])}). "
                        f"If you have hands-on experience with {skill_name}, consider explicitly highlighting it in your project bullets."
                    ),
                    "action_item": f"Add a bullet in your project or experience section demonstrating practical use of {skill_name}."
                })

        return suggestions[:5]

nlp_engine = ModularNlpSemanticEngine()

