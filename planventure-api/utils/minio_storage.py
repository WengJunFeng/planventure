import io
import uuid
from datetime import timedelta

from flask import current_app

PRESIGNED_URL_EXPIRY = timedelta(hours=1)
DEFAULT_QUOTA_KB = 5 * 1024 * 1024  # 5 GB in KB


def _get_admin_client():
    """Return a Minio client using root/admin credentials."""
    from minio import Minio  # type: ignore
    return Minio(
        current_app.config["MINIO_ENDPOINT"],
        access_key=current_app.config["MINIO_ROOT_ACCESS_KEY"],
        secret_key=current_app.config["MINIO_ROOT_SECRET_KEY"],
        secure=current_app.config.get("MINIO_SECURE", False),
    )


def provision_user_storage(user) -> None:
    """Create a dedicated MinIO bucket and generate per-user credentials.

    Updates the following fields on user in-place (caller must commit):
      minio_bucket, minio_access_key, minio_secret_key,
      user_cloud_storage_quota, user_storage_usage.

    Silently skips when MINIO_ENDPOINT is not configured.
    """
    if not current_app.config.get("MINIO_ENDPOINT"):
        return

    client = _get_admin_client()
    bucket_name = uuid.uuid4().hex

    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)

    user.minio_bucket = bucket_name
    # Credentials are generated and stored for reference / future direct MinIO access
    user.minio_access_key = uuid.uuid4().hex
    user.minio_secret_key = uuid.uuid4().hex + uuid.uuid4().hex  # 64 hex chars
    user.user_cloud_storage_quota = DEFAULT_QUOTA_KB
    user.user_storage_usage = 0


def upload_file_to_minio(user, object_key: str, data: bytes, content_type: str) -> int:
    """Upload bytes to the user's MinIO bucket.

    Returns the number of KB consumed (ceiling), so callers can track usage.
    """
    client = _get_admin_client()
    size = len(data)
    client.put_object(
        user.minio_bucket,
        object_key,
        io.BytesIO(data),
        length=size,
        content_type=content_type,
    )
    return max(1, (size + 1023) // 1024)


def delete_file_from_minio(user, object_key: str | None) -> None:
    """Remove an object from the user's MinIO bucket. Silently ignores errors."""
    if not object_key or not user or not user.minio_bucket:
        return
    client = _get_admin_client()
    try:
        client.remove_object(user.minio_bucket, object_key)
    except Exception:
        pass


def get_presigned_url(user, object_key: str | None) -> str | None:
    """Return a time-limited presigned GET URL for the given object key.

    Returns None when MinIO is not configured or the key is empty.
    """
    if not object_key or not user or not user.minio_bucket:
        return None
    if not current_app.config.get("MINIO_ENDPOINT"):
        return None
    client = _get_admin_client()
    try:
        return client.presigned_get_object(
            user.minio_bucket,
            object_key,
            expires=PRESIGNED_URL_EXPIRY,
        )
    except Exception:
        return None
