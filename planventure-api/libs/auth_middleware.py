from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException


def jwt_required(fn):
    """Route decorator that enforces a valid Bearer token.

    Returns 401 if the token is missing, expired, or invalid.
    Injects nothing — use get_current_user() inside the route to load the user.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
        except JWTExtendedException as exc:
            return jsonify({"error": str(exc)}), 401
        return fn(*args, **kwargs)
    return wrapper


def jwt_refresh_required(fn):
    """Route decorator that enforces a valid refresh token."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request(refresh=True)
        except JWTExtendedException as exc:
            return jsonify({"error": str(exc)}), 401
        return fn(*args, **kwargs)
    return wrapper


def get_current_user():
    """Return the User row for the authenticated request, or None.

    Must be called inside a route protected by @jwt_required().
    """
    from models.user import User  # local import avoids circular dependency

    user_id = get_jwt_identity()
    if user_id is None:
        return None
    return User.query.get(int(user_id))
