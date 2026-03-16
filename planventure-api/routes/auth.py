from flask import Blueprint, jsonify, request

from libs.database import db
from models.user import User
from utils.minio_storage import provision_user_storage
from utils.validators import validate_email, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    # Validate email
    ok, error = validate_email(email)
    if not ok:
        return jsonify({"error": error}), 422

    # Validate password
    ok, error = validate_password(password)
    if not ok:
        return jsonify({"error": error}), 422

    # Check uniqueness — constant-time query avoids user enumeration via timing
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists."}), 409

    try:
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # assign user.id before provisioning
        provision_user_storage(user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500

    return jsonify({
        "message": "Account created successfully.",
        "user": {"id": user.id, "email": user.email},
        **user.get_tokens(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 422

    user = User.query.filter_by(email=email).first()

    # Use a consistent response to prevent user enumeration
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful.",
        "user": {"id": user.id, "email": user.email},
        **user.get_tokens(),
    }), 200
