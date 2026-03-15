from datetime import datetime, timezone

from libs.database import db
from utils.jwt import generate_access_token, generate_refresh_token, generate_tokens
from utils.password import hash_password, verify_password


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def set_password(self, password: str) -> None:
        self.password_hash = hash_password(password)

    def check_password(self, password: str) -> bool:
        return verify_password(password, self.password_hash)

    def get_tokens(self) -> dict:
        """Return a fresh access + refresh token pair for this user."""
        return generate_tokens(self.id)

    def get_access_token(self) -> str:
        """Return a fresh access token for this user."""
        return generate_access_token(self.id)

    def get_refresh_token(self) -> str:
        """Return a fresh refresh token for this user."""
        return generate_refresh_token(self.id)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
