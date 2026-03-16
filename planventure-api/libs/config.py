import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "15")))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30")))
    JWT_TOKEN_LOCATION = os.getenv("JWT_TOKEN_LOCATION", "headers").split(",")
    JWT_HEADER_NAME = os.getenv("JWT_HEADER_NAME", "Authorization")
    JWT_HEADER_TYPE = os.getenv("JWT_HEADER_TYPE", "Bearer")

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///planventure.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]
    CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]
    CORS_SUPPORTS_CREDENTIALS = os.getenv("CORS_SUPPORTS_CREDENTIALS", "false").lower() == "true"
    CORS_MAX_AGE = int(os.getenv("CORS_MAX_AGE", "600"))  # preflight cache seconds

    # File uploads
    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")), "instance", "uploads"),
    )
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_UPLOAD_SIZE_MB", "16")) * 1024 * 1024  # default 16 MB

    # General
    JSON_SORT_KEYS = False
