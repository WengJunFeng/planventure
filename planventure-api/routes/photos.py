import os
import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename

from libs.auth_middleware import get_current_user, jwt_required
from libs.database import db
from models.trip import Trip
from models.trip_photo import TripPhoto

photos_bp = Blueprint("photos", __name__, url_prefix="/api/trips")
uploads_bp = Blueprint("uploads", __name__, url_prefix="/uploads")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic"}
THUMB_SIZE = (400, 400)
_UPLOADS_URL_PREFIX = "/uploads/"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_owned_trip(trip_id: int, user_id: int):
    return Trip.query.filter_by(id=trip_id, user_id=user_id).first()


def _serialize_photo(photo: TripPhoto) -> dict:
    return {
        "pict_id": photo.pict_id,
        "trip_id": photo.trip_id,
        "pict_name": photo.pict_name,
        "pict_time": photo.pict_time.isoformat() if photo.pict_time else None,
        "pict_small_url": photo.pict_small_url,
        "pict_origin_url": photo.pict_origin_url,
        "comment": photo.comment,
        "access_flag": photo.access_flag,
        "created_at": photo.created_at.isoformat(),
        "updated_at": photo.updated_at.isoformat(),
    }


def _delete_file_from_url(upload_folder: str, url: str | None) -> None:
    """Remove a stored file from disk given its public URL. Silently ignores missing files."""
    if not url:
        return
    rel = url[len(_UPLOADS_URL_PREFIX):]          # e.g. "trips/5/abc123.jpg"
    file_path = os.path.join(upload_folder, rel)
    try:
        os.remove(file_path)
    except OSError:
        pass  # already removed or never existed


# ---------------------------------------------------------------------------
# Upload a photo  POST /api/trips/<trip_id>/photos
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos", methods=["POST"])
@jwt_required
def upload_photo(trip_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    if "file" not in request.files:
        return jsonify({"error": "No file provided."}), 422

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "No file selected."}), 422

    if not _allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Accepted: jpg, jpeg, png, gif, webp, heic."}), 422

    # Build safe unique filenames
    ext = secure_filename(file.filename).rsplit(".", 1)[1].lower()
    uid = uuid.uuid4().hex
    origin_filename = f"{uid}.{ext}"
    small_filename = f"{uid}_small.{ext}"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    trip_folder = os.path.join(upload_folder, "trips", str(trip_id))
    os.makedirs(trip_folder, exist_ok=True)

    origin_path = os.path.join(trip_folder, origin_filename)
    small_path = os.path.join(trip_folder, small_filename)

    file.save(origin_path)

    # Generate thumbnail via Pillow (optional — gracefully skipped if unavailable)
    small_url: str | None = None
    try:
        from PIL import Image  # type: ignore
        with Image.open(origin_path) as img:
            img.thumbnail(THUMB_SIZE)
            img.save(small_path)
        small_url = f"{_UPLOADS_URL_PREFIX}trips/{trip_id}/{small_filename}"
    except Exception:
        pass  # Pillow not installed or unsupported format — thumbnail skipped

    origin_url = f"{_UPLOADS_URL_PREFIX}trips/{trip_id}/{origin_filename}"

    # Optional metadata from form fields
    pict_name = (request.form.get("pict_name") or "").strip() or secure_filename(file.filename)
    comment = (request.form.get("comment") or "").strip() or None

    pict_time: datetime | None = None
    raw_time = request.form.get("pict_time")
    if raw_time:
        try:
            pict_time = datetime.fromisoformat(raw_time)
        except ValueError:
            return jsonify({"error": "'pict_time' must be a valid ISO datetime string."}), 422

    photo = TripPhoto(
        trip_id=trip_id,
        pict_name=pict_name,
        pict_time=pict_time,
        pict_small_url=small_url,
        pict_origin_url=origin_url,
        comment=comment,
        access_flag=1 if request.form.get("access_flag") == "1" else 0,
    )
    db.session.add(photo)
    db.session.commit()

    return jsonify(_serialize_photo(photo)), 201


# ---------------------------------------------------------------------------
# List photos  GET /api/trips/<trip_id>/photos
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos", methods=["GET"])
@jwt_required
def list_photos(trip_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    photos = (
        TripPhoto.query
        .filter_by(trip_id=trip_id)
        .order_by(TripPhoto.pict_time.asc().nullslast(), TripPhoto.created_at.asc())
        .all()
    )
    return jsonify([_serialize_photo(p) for p in photos]), 200


# ---------------------------------------------------------------------------
# Get a single photo  GET /api/trips/<trip_id>/photos/<pict_id>
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos/<int:pict_id>", methods=["GET"])
@jwt_required
def get_photo(trip_id: int, pict_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    photo = TripPhoto.query.filter_by(pict_id=pict_id, trip_id=trip_id).first()
    if not photo:
        return jsonify({"error": "Photo not found."}), 404

    return jsonify(_serialize_photo(photo)), 200


# ---------------------------------------------------------------------------
# Update photo metadata  PATCH /api/trips/<trip_id>/photos/<pict_id>
# Allows updating pict_name, pict_time, and comment
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos/<int:pict_id>", methods=["PATCH"])
@jwt_required
def update_photo(trip_id: int, pict_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    photo = TripPhoto.query.filter_by(pict_id=pict_id, trip_id=trip_id).first()
    if not photo:
        return jsonify({"error": "Photo not found."}), 404

    data = request.get_json(silent=True) or {}

    if "pict_name" in data:
        pict_name = (data["pict_name"] or "").strip()
        if not pict_name:
            return jsonify({"error": "'pict_name' cannot be empty."}), 422
        photo.pict_name = pict_name

    if "comment" in data:
        photo.comment = (data["comment"] or "").strip() or None

    if "access_flag" in data:
        if data["access_flag"] not in (0, 1):
            return jsonify({"error": "'access_flag' must be 0 (private) or 1 (public)."}), 422
        photo.access_flag = data["access_flag"]

    if "pict_time" in data:
        raw_time = data["pict_time"]
        if raw_time is None:
            photo.pict_time = None
        else:
            try:
                photo.pict_time = datetime.fromisoformat(raw_time)
            except (ValueError, TypeError):
                return jsonify({"error": "'pict_time' must be a valid ISO datetime string."}), 422

    db.session.commit()
    return jsonify(_serialize_photo(photo)), 200


# ---------------------------------------------------------------------------
# Delete a photo  DELETE /api/trips/<trip_id>/photos/<pict_id>
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos/<int:pict_id>", methods=["DELETE"])
@jwt_required
def delete_photo(trip_id: int, pict_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    photo = TripPhoto.query.filter_by(pict_id=pict_id, trip_id=trip_id).first()
    if not photo:
        return jsonify({"error": "Photo not found."}), 404

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    _delete_file_from_url(upload_folder, photo.pict_origin_url)
    _delete_file_from_url(upload_folder, photo.pict_small_url)

    db.session.delete(photo)
    db.session.commit()

    return jsonify({"message": "Photo deleted successfully."}), 200


# ---------------------------------------------------------------------------
# Serve uploaded files  GET /uploads/trips/<trip_id>/<filename>
# UUID-based filenames make URLs practically unguessable
# ---------------------------------------------------------------------------

@uploads_bp.route("/trips/<int:trip_id>/<path:filename>")
@jwt_required
def serve_upload(trip_id: int, filename: str):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    trip_folder = os.path.join(upload_folder, "trips", str(trip_id))
    safe_name = secure_filename(filename)
    return send_from_directory(trip_folder, safe_name)
