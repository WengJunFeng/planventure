"""
Database management CLI.

Usage:
    python manage.py create    # create all tables (dev / first-time setup)
    python manage.py init      # initialise the migrations folder
    python manage.py migrate   # generate a new migration script
    python manage.py upgrade   # apply pending migrations to the database
    python manage.py downgrade # revert the last migration
"""

import sys

from flask_migrate import downgrade, init, migrate, upgrade

import models  # noqa: F401 — registers all models with SQLAlchemy metadata
from app import app, db

COMMANDS = {"create", "init", "migrate", "upgrade", "downgrade"}


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "create"

    if command not in COMMANDS:
        print(f"Unknown command '{command}'. Available: {', '.join(sorted(COMMANDS))}")
        sys.exit(1)

    with app.app_context():
        if command == "create":
            db.create_all()
            print("Database tables created successfully.")
        elif command == "init":
            init()
            print("Migrations folder initialised.")
        elif command == "migrate":
            migrate(message=sys.argv[2] if len(sys.argv) > 2 else None)
            print("Migration script generated.")
        elif command == "upgrade":
            upgrade()
            print("Database upgraded to the latest migration.")
        elif command == "downgrade":
            downgrade()
            print("Database downgraded by one migration.")


if __name__ == "__main__":
    main()

