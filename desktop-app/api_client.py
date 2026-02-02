from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import requests


@dataclass
class ApiError(Exception):
    message: str
    status_code: Optional[int] = None
    details: Optional[Dict[str, Any]] = None

    def __str__(self) -> str:  # pragma: no cover
        base = self.message
        if self.status_code:
            base = f"{base} (HTTP {self.status_code})"
        return base


class ApiClient:
    """Small REST client for the existing Django backend.

    Backend routes (relative to base_url):
      - POST login/   -> {token}
      - POST upload/  -> {dataset_id, summary}
      - GET  history/ -> [{id,file_name,uploaded_at,summary}]
      - GET  summary/<id>/ -> {dataset_id, summary}
      - GET  report/<id>/  -> PDF bytes

    Token is stored in memory only.
    """

    def __init__(self, base_url: Optional[str] = None, timeout_s: int = 30):
        self.base_url = (base_url or os.getenv("CHEMVIZ_API_BASE") or "http://127.0.0.1:8000/api").rstrip("/")
        self.timeout_s = int(timeout_s)
        self.session = requests.Session()
        self._token: Optional[str] = None

    @property
    def token(self) -> Optional[str]:
        return self._token

    def set_token(self, token: Optional[str]) -> None:
        self._token = token

    def _headers(self) -> Dict[str, str]:
        headers: Dict[str, str] = {}
        if self._token:
            headers["Authorization"] = f"Token {self._token}"
        return headers

    def _url(self, path: str) -> str:
        path = path.lstrip("/")
        return f"{self.base_url}/{path}"

    def _raise_for_json_error(self, resp: requests.Response) -> None:
        status_code = resp.status_code
        try:
            data = resp.json()
        except Exception:
            raise ApiError(resp.text or "Request failed.", status_code=status_code)

        message = None
        if isinstance(data, dict):
            message = data.get("detail")
        if not message:
            message = "Request failed."
        raise ApiError(message, status_code=status_code, details=data if isinstance(data, dict) else None)

    def login(self, email_or_username: str, password: str) -> str:
        value = (email_or_username or "").strip()
        if not value or not password:
            raise ApiError("Email/username and password are required.")

        payload = {"password": password}
        if "@" in value:
            payload["email"] = value
        else:
            payload["username"] = value

        resp = self.session.post(
            self._url("login/"),
            json=payload,
            timeout=self.timeout_s,
            headers={"Content-Type": "application/json"},
        )
        if resp.status_code >= 400:
            self._raise_for_json_error(resp)

        token = resp.json().get("token")
        if not token:
            raise ApiError("Login succeeded but token missing in response.")
        self._token = token
        return token

    def signup(self, name: str, email: str, password: str, confirm_password: str) -> str:
        name = (name or "").strip()
        email = (email or "").strip()
        if not name or not email or not password or not confirm_password:
            raise ApiError("Name, email, password, and confirm password are required.")

        payload = {
            "name": name,
            "email": email,
            "password": password,
            "confirm_password": confirm_password,
        }

        resp = self.session.post(
            self._url("signup/"),
            json=payload,
            timeout=self.timeout_s,
            headers={"Content-Type": "application/json"},
        )
        if resp.status_code >= 400:
            self._raise_for_json_error(resp)

        data = resp.json()
        token = data.get("token")
        if not token:
            raise ApiError("Signup succeeded but token missing in response.")
        self._token = token
        return token

    def logout(self) -> None:
        self._token = None

    def upload_csv(self, file_path: str) -> Tuple[int, Dict[str, Any]]:
        if not self._token:
            raise ApiError("Not authenticated.")

        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, "text/csv")}
            resp = self.session.post(
                self._url("upload/"),
                files=files,
                timeout=self.timeout_s,
                headers=self._headers(),
            )

        if resp.status_code >= 400:
            self._raise_for_json_error(resp)

        data = resp.json()
        dataset_id = int(data.get("dataset_id"))
        summary = data.get("summary") or {}
        return dataset_id, summary

    def get_history(self) -> List[Dict[str, Any]]:
        if not self._token:
            raise ApiError("Not authenticated.")

        resp = self.session.get(self._url("history/"), timeout=self.timeout_s, headers=self._headers())
        if resp.status_code >= 400:
            self._raise_for_json_error(resp)
        data = resp.json()
        if not isinstance(data, list):
            raise ApiError("Unexpected history response.")
        return data

    def get_summary(self, dataset_id: int) -> Dict[str, Any]:
        if not self._token:
            raise ApiError("Not authenticated.")

        resp = self.session.get(self._url(f"summary/{int(dataset_id)}/"), timeout=self.timeout_s, headers=self._headers())
        if resp.status_code >= 400:
            self._raise_for_json_error(resp)
        data = resp.json()
        summary = data.get("summary") or {}
        return summary

    def download_report(self, dataset_id: int) -> Tuple[bytes, str]:
        if not self._token:
            raise ApiError("Not authenticated.")

        resp = self.session.get(self._url(f"report/{int(dataset_id)}/"), timeout=self.timeout_s, headers=self._headers())
        if resp.status_code >= 400:
            # report view may return json on errors
            self._raise_for_json_error(resp)

        filename = f"Report {dataset_id}.pdf"
        cd = resp.headers.get("Content-Disposition") or resp.headers.get("content-disposition")
        if cd and "filename=" in cd:
            # best effort parsing
            part = cd.split("filename=", 1)[1].strip()
            if part.startswith('"'):
                part = part.split('"', 2)[1]
            else:
                part = part.split(";", 1)[0]
            if part:
                filename = part

        return resp.content, filename
