"""
Shell script to create all database tables defined in the models.

Usage:
    python manage.py
"""

from app import app, db
import models  # noqa: F401 — registers all models with SQLAlchemy metadata

with app.app_context():
    db.create_all()
    print("Database tables created successfully.")
