from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
    verify_jwt_in_request,
)
from flask_jwt_extended.exceptions import JWTExtendedException
from jwt.exceptions import PyJWTError


def generate_tokens(user_id: int) -> dict:
    """Return a fresh access + refresh token pair for *user_id*."""
    return {
        "access_token": create_access_token(identity=str(user_id)),
        "refresh_token": create_refresh_token(identity=str(user_id)),
    }


def generate_access_token(user_id: int) -> str:
    """Return a single access token for *user_id*."""
    return create_access_token(identity=str(user_id))


def generate_refresh_token(user_id: int) -> str:
    """Return a single refresh token for *user_id*."""
    return create_refresh_token(identity=str(user_id))


def get_current_user_id() -> int:
    """Return the integer user ID from the active request's JWT.

    Must be called from within a route protected by @jwt_required().
    """
    return int(get_jwt_identity())


def decode_token_payload(token: str) -> dict | None:
    """Decode *token* and return its payload dict, or None if invalid."""
    try:
        return decode_token(token)
    except (JWTExtendedException, PyJWTError):
        return None


def validate_token(token: str) -> bool:
    """Return True if *token* is a valid, non-expired JWT."""
    return decode_token_payload(token) is not None
