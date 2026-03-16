import io
import uuid
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from libs.auth_middleware import get_current_user, jwt_required
from libs.database import db
from models.trip import Trip
from models.trip_photo import TripPhoto
from utils.minio_storage import delete_file_from_minio, get_presigned_url, upload_file_to_minio

photos_bp = Blueprint("photos", __name__, url_prefix="/api/trips")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic"}
THUMB_SIZE = (400, 400)
MAX_PHOTOS_PER_UPLOAD = 9


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _get_owned_trip(trip_id: int, user_id: int):
    return Trip.query.filter_by(id=trip_id, user_id=user_id).first()


def _serialize_photo(photo: TripPhoto, user) -> dict:
    return {
        "pict_id": photo.pict_id,
        "trip_id": photo.trip_id,
        "pict_name": photo.pict_name,
        "pict_time": photo.pict_time.isoformat() if photo.pict_time else None,
        "pict_small_url": get_presigned_url(user, photo.pict_small_url),
        "pict_origin_url": get_presigned_url(user, photo.pict_origin_url),
        "pict_size_kb": photo.pict_size_kb,
        "comment": photo.comment,
        "access_flag": photo.access_flag,
        "created_at": photo.created_at.isoformat(),
        "updated_at": photo.updated_at.isoformat(),
    }


def _make_thumbnail(data: bytes, ext: str) -> bytes | None:
    """Return thumbnail bytes for the given image data, or None on failure."""
    fmt_map = {
        "jpg": "JPEG", "jpeg": "JPEG", "png": "PNG",
        "gif": "GIF", "webp": "WEBP", "heic": "JPEG",
    }
    try:
        from PIL import Image  # type: ignore
        with Image.open(io.BytesIO(data)) as img:
            img.thumbnail(THUMB_SIZE)
            out = io.BytesIO()
            img.save(out, format=fmt_map.get(ext, "JPEG"))
            return out.getvalue()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Upload photos (up to 9)  POST /api/trips/<trip_id>/photos
# Request: multipart/form-data
#   files        – 1–9 image files (field name "files")
#   pict_name    – optional shared name; defaults to each file's original name
#   pict_time    – optional ISO datetime (shared across all files)
#   comment      – optional shared comment
#   access_flag  – "0" (private, default) or "1" (public)
# ---------------------------------------------------------------------------

@photos_bp.route("/<int:trip_id>/photos", methods=["POST"])
@jwt_required
def upload_photos(trip_id: int):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    if not user.minio_bucket:
        return jsonify({"error": "Storage not provisioned for this account."}), 503

    files = request.files.getlist("files")
    if not files or all(not f.filename for f in files):
        return jsonify({"error": "No files provided. Send image files under the 'files' field."}), 422

    if len(files) > MAX_PHOTOS_PER_UPLOAD:
        return jsonify({"error": f"A maximum of {MAX_PHOTOS_PER_UPLOAD} photos can be uploaded at once."}), 422

    # Validate extensions before reading any data
    for f in files:
        if not _allowed_file(f.filename):
            return jsonify({
                "error": f"'{f.filename}' is not allowed. Accepted types: jpg, jpeg, png, gif, webp, heic."
            }), 422

    # Read all files into memory so we can quota-check before touching MinIO
    files_data: list[tuple[str, str, str, bytes]] = []  # (safe_name, ext, content_type, data)
    for f in files:
        data = f.read()
        safe = secure_filename(f.filename)
        ext = safe.rsplit(".", 1)[1].lower()
        content_type = f.content_type or f"image/{ext}"
        files_data.append((safe, ext, content_type, data))

    total_estimate_kb = sum(max(1, (len(d) + 1023) // 1024) for *_, d in files_data)
    if (user.user_storage_usage or 0) + total_estimate_kb > (user.user_cloud_storage_quota or 0):
        return jsonify({"error": "Storage quota exceeded."}), 413

    # Shared metadata
    shared_pict_name = (request.form.get("pict_name") or "").strip()
    comment = (request.form.get("comment") or "").strip() or None
    access_flag = 1 if request.form.get("access_flag") == "1" else 0

    pict_time: datetime | None = None
    raw_time = request.form.get("pict_time")
    if raw_time:
        try:
            pict_time = datetime.fromisoformat(raw_time)
        except ValueError:
            return jsonify({"error": "'pict_time' must be a valid ISO datetime string."}), 422

    created_photos: list[TripPhoto] = []
    total_used_kb = 0

    for safe_name, ext, content_type, data in files_data:
        uid = uuid.uuid4().hex
        origin_key = f"trips/{trip_id}/{uid}.{ext}"
        small_key = f"trips/{trip_id}/{uid}_small.{ext}"

        origin_kb = upload_file_to_minio(user, origin_key, data, content_type)
        total_used_kb += origin_kb

        small_stored_key: str | None = None
        small_kb = 0
        thumb_data = _make_thumbnail(data, ext)
        if thumb_data:
            small_kb = upload_file_to_minio(user, small_key, thumb_data, content_type)
            total_used_kb += small_kb
            small_stored_key = small_key

        photo = TripPhoto(
            trip_id=trip_id,
            pict_name=shared_pict_name or safe_name,
            pict_time=pict_time,
            pict_small_url=small_stored_key,   # MinIO object key
            pict_origin_url=origin_key,         # MinIO object key
            pict_size_kb=origin_kb + small_kb,
            comment=comment,
            access_flag=access_flag,
        )
        db.session.add(photo)
        created_photos.append(photo)

    user.user_storage_usage = (user.user_storage_usage or 0) + total_used_kb
    db.session.commit()

    return jsonify([_serialize_photo(p, user) for p in created_photos]), 201


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
    return jsonify([_serialize_photo(p, user) for p in photos]), 200


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

    return jsonify(_serialize_photo(photo, user)), 200


# ---------------------------------------------------------------------------
# Update photo metadata  PATCH /api/trips/<trip_id>/photos/<pict_id>
# Updatable fields: pict_name, pict_time, comment, access_flag
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
    return jsonify(_serialize_photo(photo, user)), 200


# ---------------------------------------------------------------------------
# Delete a photo  DELETE /api/trips/<trip_id>/photos/<pict_id>
# Removes both MinIO objects and decrements user storage usage
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

    delete_file_from_minio(user, photo.pict_origin_url)
    delete_file_from_minio(user, photo.pict_small_url)

    freed_kb = photo.pict_size_kb or 0
    db.session.delete(photo)

    user.user_storage_usage = max(0, (user.user_storage_usage or 0) - freed_kb)
    db.session.commit()

    return jsonify({"message": "Photo deleted successfully."}), 200
