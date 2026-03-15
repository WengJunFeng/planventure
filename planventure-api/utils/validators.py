import re

# RFC-5321 compliant email pattern
_EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
)

_PASSWORD_MIN_LENGTH = 8


def validate_email(email: str) -> tuple[bool, str]:
    """Return (True, '') if *email* is valid, else (False, reason)."""
    if not email or not isinstance(email, str):
        return False, "Email is required."
    email = email.strip()
    if len(email) > 255:
        return False, "Email must not exceed 255 characters."
    if not _EMAIL_RE.match(email):
        return False, "Email address is not valid."
    return True, ""


def validate_password(password: str) -> tuple[bool, str]:
    """Return (True, '') if *password* meets requirements, else (False, reason)."""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < _PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {_PASSWORD_MIN_LENGTH} characters."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    return True, ""
