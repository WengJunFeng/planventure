import bcrypt


def hash_password(plaintext: str) -> str:
    """Hash a plaintext password with a fresh bcrypt salt.

    Returns the hash as a UTF-8 string suitable for storing in the database.
    """
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plaintext.encode("utf-8"), salt).decode("utf-8")


def verify_password(plaintext: str, hashed: str) -> bool:
    """Return True if *plaintext* matches the stored bcrypt *hashed* value."""
    return bcrypt.checkpw(plaintext.encode("utf-8"), hashed.encode("utf-8"))
