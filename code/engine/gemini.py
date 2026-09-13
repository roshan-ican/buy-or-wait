"""Minimal Gemini client (standard library only) with a response cache and token accounting.

Used only where deterministic rules run out:
- a message whose wording none of the phrase rules recognise (``facts.py``);
- an image whose SHA-256 is not in the reviewed amount cache (``images.py``).

Every response is cached on disk by a hash of (model, prompt, inputs), so a rerun is reproducible
and spends no tokens. The key is read from ``GEMINI_API_KEY`` (environment or the repo-root ``.env``)
and is never logged or written to the cache.
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[1]
CACHE_DIR = HERE / "cache" / "gemini"
# Flash-Lite: the free tier allows only ~20 requests/day on the larger Flash models.
DEFAULT_MODEL = "gemini-3.1-flash-lite"
ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _api_key() -> str | None:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key.strip()
    env_file = REPO_ROOT / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            name, _, value = line.partition("=")
            if name.strip() == "GEMINI_API_KEY" and value.strip():
                return value.strip().strip("'\"")
    return None


@dataclass
class Usage:
    calls: int = 0
    cache_hits: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    by_task: dict[str, int] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {"model": model_name(), "calls": self.calls, "cache_hits": self.cache_hits,
                "input_tokens": self.input_tokens, "output_tokens": self.output_tokens,
                "total_tokens": self.input_tokens + self.output_tokens, "calls_by_task": self.by_task}


USAGE = Usage()
LAST_ERROR: list[str] = [""]


def model_name() -> str:
    return os.environ.get("GEMINI_MODEL", DEFAULT_MODEL)


def enabled() -> bool:
    return os.environ.get("GEMINI_DISABLED", "").lower() not in ("1", "true", "yes") and _api_key() is not None


def generate_json(task: str, prompt: str, schema: dict[str, Any], image_png: bytes | None = None) -> dict[str, Any] | None:
    """Ask Gemini for JSON matching ``schema``. Returns None when disabled or on failure (callers fall back)."""
    model = model_name()
    digest = hashlib.sha256()
    for part in (model, task, prompt, json.dumps(schema, sort_keys=True)):
        digest.update(part.encode("utf-8"))
    if image_png is not None:
        digest.update(image_png)
    cache_file = CACHE_DIR / f"{task}-{digest.hexdigest()[:24]}.json"
    if cache_file.exists():
        USAGE.cache_hits += 1
        return json.loads(cache_file.read_text(encoding="utf-8"))["result"]
    if not enabled():
        return None

    parts: list[dict[str, Any]] = [{"text": prompt}]
    if image_png is not None:
        parts.append({"inline_data": {"mime_type": "image/png", "data": base64.b64encode(image_png).decode("ascii")}})
    body = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {"temperature": 0, "responseMimeType": "application/json", "responseSchema": schema},
    }
    request = urllib.request.Request(
        ENDPOINT.format(model=model), data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": _api_key() or ""},
    )
    payload = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                payload = json.load(response)
            break
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")
            if error.code not in (429, 500, 503) or "PerDay" in detail or attempt == 2:
                LAST_ERROR[0] = f"HTTP {error.code}: {detail[:200]}"
                return None
        except (urllib.error.URLError, TimeoutError):
            if attempt == 2:
                return None
        time.sleep(5 * (attempt + 1))
    if payload is None:
        return None

    usage = payload.get("usageMetadata", {})
    USAGE.calls += 1
    USAGE.by_task[task] = USAGE.by_task.get(task, 0) + 1
    USAGE.input_tokens += int(usage.get("promptTokenCount", 0))
    USAGE.output_tokens += int(usage.get("candidatesTokenCount", 0)) + int(usage.get("thoughtsTokenCount", 0))
    try:
        text = payload["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError):
        return None
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps({"task": task, "model": model, "result": result,
                                      "usage": usage}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return result
