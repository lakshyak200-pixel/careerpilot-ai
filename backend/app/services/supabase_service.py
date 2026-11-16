import time
import re
import uuid
import socket
import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

# In-memory storage cache as resilient local fallback
_LOCAL_RESUMES_DB: Dict[str, Dict[str, Any]] = {}
_LOCAL_STORAGE: Dict[str, bytes] = {}
_LOCAL_ANALYSES_DB: Dict[str, Dict[str, Any]] = {}

FAST_CONNECT_TIMEOUT = httpx.Timeout(4.0, connect=2.0)

class SupabaseService:
    """
    Manages private Supabase Storage uploads and PostgreSQL operations
    with Row-Level Security (RLS) and user-level multi-tenant isolation.
    Includes automated fallback for offline / sandboxed environments.
    """
    def __init__(self):
        self.base_url = settings.SUPABASE_URL.rstrip("/")
        self.anon_key = settings.SUPABASE_ANON_KEY

    def is_remote_available(self) -> bool:
        if not self.base_url.startswith("http"):
            return False
        if "placeholder" in self.base_url or "your-project" in self.base_url:
            return False
        return True

    def _get_headers(self, user_jwt: str) -> Dict[str, str]:
        # If user_jwt is empty or demo-token, fallback to anon_key as bearer token for Supabase PostgREST
        token = user_jwt if (user_jwt and not user_jwt.startswith("demo-") and not user_jwt.startswith("dev-")) else self.anon_key
        return {
            "Authorization": f"Bearer {token}",
            "apikey": self.anon_key,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    async def upload_file_to_storage(
        self,
        user_id: str,
        file_name: str,
        file_bytes: bytes,
        mime_type: str,
        user_jwt: str
    ) -> str:
        """
        Uploads resume bytes to the private 'resumes' bucket in Supabase Storage.
        Enforces user-specific folder path: <user_id>/<timestamp>_<filename>
        Only the user whose auth.uid() matches <user_id> can access the file.
        """
        sanitized_name = re.sub(r"[^a-zA-Z0-9._-]", "_", file_name)
        storage_path = f"{user_id}/{int(time.time())}_{sanitized_name}"

        if self.is_remote_available():
            url = f"{self.base_url}/storage/v1/object/resumes/{storage_path}"
            token = user_jwt if (user_jwt and not user_jwt.startswith("demo-")) else self.anon_key
            headers = {
                "Authorization": f"Bearer {token}",
                "apikey": self.anon_key,
                "Content-Type": mime_type,
                "x-upsert": "true"
            }
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.post(url, content=file_bytes, headers=headers)
                if response.status_code in (200, 201):
                    return storage_path
            except Exception as e:
                print(f"[Supabase Storage] Remote upload notice: {e}")

        # Cache in local storage fallback
        _LOCAL_STORAGE[storage_path] = file_bytes
        return storage_path

    async def create_signed_download_url(
        self,
        file_path: str,
        user_jwt: str,
        expires_in_seconds: int = 3600
    ) -> Optional[str]:
        """
        Generates a time-limited signed URL for private resume access.
        """
        if self.is_remote_available():
            url = f"{self.base_url}/storage/v1/object/sign/resumes/{file_path}"
            headers = self._get_headers(user_jwt)
            payload = {"expiresIn": expires_in_seconds}
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    signed_path = data.get("signedURL")
                    if signed_path:
                        return f"{self.base_url}/storage/v1{signed_path}"
            except Exception:
                pass

        return f"{self.base_url}/storage/v1/object/authenticated/resumes/{file_path}"

    async def insert_resume_record(
        self,
        user_id: str,
        file_name: str,
        file_path: str,
        file_size_bytes: int,
        mime_type: str,
        extracted_text: str,
        parsed_data: Dict[str, Any],
        user_jwt: str
    ) -> Dict[str, Any]:
        """
        Persists resume metadata, extracted raw text, and structured NLP data to PostgreSQL.
        """
        record_id = str(uuid.uuid4())
        created_timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        payload = {
            "id": record_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_path": file_path,
            "file_size_bytes": file_size_bytes,
            "mime_type": mime_type,
            "extracted_text": extracted_text[:15000] if extracted_text else "",
            "parsed_data": parsed_data,
            "processing_status": "completed" if not parsed_data.get("is_scanned_pdf") else "failed",
            "created_at": created_timestamp,
            "updated_at": created_timestamp
        }

        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resumes"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.post(url, json=payload, headers=headers)
                if response.status_code in (200, 201):
                    data = response.json()
                    if isinstance(data, list) and data:
                        _LOCAL_RESUMES_DB[str(data[0].get("id"))] = data[0]
                        return data[0]
            except Exception as e:
                print(f"[Supabase DB] insert_resume_record fallback: {e}")

        # Local cache fallback
        _LOCAL_RESUMES_DB[record_id] = payload
        return payload

    async def get_user_resumes(self, user_id: str, user_jwt: str) -> List[Dict[str, Any]]:
        """
        Retrieves all resumes owned by the authenticated student.
        Enforces tenant isolation by filtering user_id=eq.{user_id}.
        """
        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resumes?user_id=eq.{user_id}&order=created_at.desc"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    for r in data:
                        _LOCAL_RESUMES_DB[str(r.get("id"))] = r
                    return data
            except Exception as e:
                print(f"[Supabase DB] get_user_resumes fallback: {e}")

        return [
            r for r in _LOCAL_RESUMES_DB.values()
            if r.get("user_id") == user_id
        ]

    async def get_resume_by_id(self, resume_id: str, user_id: str, user_jwt: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves a single resume record ensuring tenant isolation (user_id=eq.user_id).
        """
        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resumes?id=eq.{resume_id}&user_id=eq.{user_id}&select=*"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        _LOCAL_RESUMES_DB[str(data[0].get("id"))] = data[0]
                        return data[0]
            except Exception:
                pass

        record = _LOCAL_RESUMES_DB.get(resume_id)
        if record and record.get("user_id") == user_id:
            return record
        return None

    async def update_resume_parsed_data(
        self,
        resume_id: str,
        user_id: str,
        parsed_data: Dict[str, Any],
        user_jwt: str
    ) -> Optional[Dict[str, Any]]:
        """
        Updates student corrections for incorrectly extracted skills or details.
        """
        now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        payload = {
            "parsed_data": parsed_data,
            "updated_at": now_str
        }

        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resumes?id=eq.{resume_id}&user_id=eq.{user_id}"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.patch(url, json=payload, headers=headers)
                if response.status_code in (200, 204):
                    data = response.json()
                    res = data[0] if isinstance(data, list) and data else payload
                    if resume_id in _LOCAL_RESUMES_DB:
                        _LOCAL_RESUMES_DB[resume_id]["parsed_data"] = parsed_data
                        _LOCAL_RESUMES_DB[resume_id]["updated_at"] = now_str
                    return res
            except Exception:
                pass

        if resume_id in _LOCAL_RESUMES_DB:
            record = _LOCAL_RESUMES_DB[resume_id]
            if record.get("user_id") == user_id:
                record["parsed_data"] = parsed_data
                record["updated_at"] = now_str
                return record

        return None

    async def delete_resume(
        self,
        resume_id: str,
        user_id: str,
        user_jwt: str
    ) -> bool:
        """
        Deletes resume file and removes PostgreSQL record.
        """
        record = await self.get_resume_by_id(resume_id, user_id, user_jwt)
        if not record:
            return False

        file_path = record.get("file_path", "")

        if self.is_remote_available():
            headers = self._get_headers(user_jwt)
            if file_path:
                try:
                    storage_url = f"{self.base_url}/storage/v1/object/resumes"
                    async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                        await client.request("DELETE", storage_url, json={"prefixes": [file_path]}, headers=headers)
                except Exception:
                    pass

            try:
                db_url = f"{self.base_url}/rest/v1/resumes?id=eq.{resume_id}&user_id=eq.{user_id}"
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.delete(db_url, headers=headers)
                if response.status_code in (200, 204):
                    _LOCAL_STORAGE.pop(file_path, None)
                    _LOCAL_RESUMES_DB.pop(resume_id, None)
                    return True
            except Exception:
                pass

        _LOCAL_STORAGE.pop(file_path, None)
        if resume_id in _LOCAL_RESUMES_DB:
            _LOCAL_RESUMES_DB.pop(resume_id, None)
            return True

        return False

    async def log_activity(self, user_id: str, activity_type: str, metadata: dict, user_jwt: str):
        """
        Audit log activity in public.user_activity table.
        """
        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/user_activity"
            headers = self._get_headers(user_jwt)
            payload = {
                "user_id": user_id,
                "activity_type": activity_type,
                "metadata": metadata
            }
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    await client.post(url, json=payload, headers=headers)
            except Exception:
                pass

    async def insert_resume_analysis(
        self,
        user_id: str,
        resume_id: Optional[str],
        analysis_data: Dict[str, Any],
        user_jwt: str
    ) -> Dict[str, Any]:
        """
        Stores AI resume analysis and skill gap results in Supabase resume_analyses table.
        """
        analysis_id = analysis_data.get("id") or str(uuid.uuid4())
        created_at = analysis_data.get("created_at") or datetime.now(timezone.utc).isoformat()
        
        payload = {
            "id": analysis_id,
            "user_id": user_id,
            "resume_id": resume_id or analysis_id,
            "match_score": analysis_data.get("match_score", 0),
            "content_score": int(analysis_data.get("scoring_breakdown", {}).get("required_skills_score", 75)),
            "keywords_score": int(analysis_data.get("scoring_breakdown", {}).get("preferred_skills_score", 70)),
            "matched_skills": analysis_data.get("matched_skills", []),
            "missing_skills": analysis_data.get("missing_required_skills", []) + analysis_data.get("missing_preferred_skills", []),
            "strengths": analysis_data.get("strengths", []),
            "improvement_suggestions": analysis_data.get("improvement_suggestions", []),
            "critical_issues": analysis_data.get("missing_required_skills", []),
            "raw_ai_response": analysis_data,
            "created_at": created_at
        }

        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resume_analyses"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.post(url, json=payload, headers=headers)
                if response.status_code in (200, 201):
                    res_data = response.json()
                    saved = res_data[0] if isinstance(res_data, list) and res_data else payload
                    _LOCAL_ANALYSES_DB[analysis_id] = saved
                    return saved
            except Exception as e:
                print(f"[Supabase DB] insert_resume_analysis fallback: {e}")

        # Local cache fallback
        _LOCAL_ANALYSES_DB[analysis_id] = payload
        return payload

    async def get_user_analyses(self, user_id: str, user_jwt: str) -> List[Dict[str, Any]]:
        """
        Retrieves user's previous resume analyses.
        """
        if self.is_remote_available():
            url = f"{self.base_url}/rest/v1/resume_analyses?user_id=eq.{user_id}&order=created_at.desc"
            headers = self._get_headers(user_jwt)
            try:
                async with httpx.AsyncClient(timeout=FAST_CONNECT_TIMEOUT) as client:
                    response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        return data
            except Exception:
                pass

        # Local cache fallback
        results = [
            item for item in _LOCAL_ANALYSES_DB.values()
            if item.get("user_id") == user_id
        ]
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results

supabase_service = SupabaseService()
