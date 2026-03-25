"""
FilePress license management.

State file: ~/.filepress/state.json
  {
    "compressions": 0,        # lifetime compression count
    "license_key": null,      # entered license key, or null
    "validated_at": null      # unix timestamp of last successful validation
  }

Validation flow:
  - App calls validate_license(key) which POSTs to the Vercel API.
  - Vercel API proxies to Lemon Squeezy — API key never ships in the binary.
  - Result is cached for 7 days so the app doesn't phone home constantly.
  - If the network is unreachable and a cached validation exists, the app
    stays unlocked (we don't punish offline users).
"""

import json
import time
import urllib.request
import urllib.error
from pathlib import Path

FREE_LIMIT = 13
VALIDATE_URL = "https://filepressapp.vercel.app/api/validate"
CACHE_TTL = 7 * 24 * 3600  # 7 days

_STATE_DIR = Path.home() / ".filepress"
_STATE_FILE = _STATE_DIR / "state.json"


# ── State I/O ────────────────────────────────────────────────────────────────

def _load() -> dict:
    try:
        if _STATE_FILE.exists():
            return json.loads(_STATE_FILE.read_text())
    except Exception:
        pass
    return {"compressions": 0, "license_key": None, "validated_at": None}


def _save(state: dict) -> None:
    _STATE_DIR.mkdir(parents=True, exist_ok=True)
    _STATE_FILE.write_text(json.dumps(state))


# ── Public API ────────────────────────────────────────────────────────────────

def record_compression() -> dict:
    """Increment the compression counter and persist. Returns updated state."""
    state = _load()
    state["compressions"] = state.get("compressions", 0) + 1
    _save(state)
    return state


def needs_paywall() -> bool:
    """True if the user has hit the free limit and doesn't have a valid license."""
    state = _load()
    if state.get("compressions", 0) < FREE_LIMIT:
        return False
    return not _is_licensed(state)


def compressions_used() -> int:
    return _load().get("compressions", 0)


def activate_license(key: str) -> tuple[bool, str]:
    """
    Validate a license key against the Vercel API.
    Returns (success: bool, message: str).
    Persists the key on success.
    """
    key = key.strip()
    if not key:
        return False, "Please enter a license key."

    ok, msg = _call_validate_api(key)
    if ok:
        state = _load()
        state["license_key"] = key
        state["validated_at"] = time.time()
        _save(state)
    return ok, msg


def revalidate_if_needed() -> None:
    """
    Called on app start. If the cached validation is stale, re-validates
    in the background. Failure does NOT lock the user out (offline grace).
    """
    state = _load()
    key = state.get("license_key")
    if not key:
        return
    validated_at = state.get("validated_at") or 0
    if time.time() - validated_at < CACHE_TTL:
        return  # still fresh

    # Stale — try to refresh
    ok, _ = _call_validate_api(key)
    if ok:
        state["validated_at"] = time.time()
        _save(state)
    # If network fails, leave validated_at as-is so the user stays unlocked


# ── Internal helpers ──────────────────────────────────────────────────────────

def _is_licensed(state: dict) -> bool:
    if not state.get("license_key"):
        return False
    validated_at = state.get("validated_at") or 0
    # Treat as licensed if validation is cached (even if stale — revalidate_if_needed handles refresh)
    return validated_at > 0


def _call_validate_api(key: str) -> tuple[bool, str]:
    """POST to the Vercel validation endpoint. Returns (valid, message)."""
    try:
        payload = json.dumps({"key": key}).encode()
        req = urllib.request.Request(
            VALIDATE_URL,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read())
            if data.get("valid"):
                return True, "License activated. Thank you!"
            return False, data.get("error", "Invalid license key.")
    except urllib.error.HTTPError as e:
        return False, f"Validation failed (HTTP {e.code}). Try again."
    except Exception:
        return False, "Could not reach the validation server. Check your connection."
