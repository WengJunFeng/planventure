import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text

from libs.config import Config
from libs.database import db, init_db
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.photos import photos_bp

load_dotenv(".sample.env")

app = Flask(__name__)
app.config.from_object(Config)

jwt = JWTManager(app)
init_db(app)
CORS(
    app,
    origins=app.config["CORS_ORIGINS"],
    methods=app.config["CORS_METHODS"],
    allow_headers=app.config["CORS_ALLOW_HEADERS"],
    expose_headers=app.config["CORS_EXPOSE_HEADERS"],
    supports_credentials=app.config["CORS_SUPPORTS_CREDENTIALS"],
    max_age=app.config["CORS_MAX_AGE"],
)

app.register_blueprint(auth_bp)
app.register_blueprint(trips_bp)
app.register_blueprint(photos_bp)


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired."}), 401


@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"error": f"Invalid token: {reason}"}), 401


@jwt.unauthorized_loader
def missing_token_callback(reason):
    return jsonify({"error": "Authorization token is required."}), 401

@app.route('/')
def home():
    return jsonify({"message": "Welcome to PlanVenture API"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})


@app.route('/health/db')
def db_health_check():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "healthy", "database": "connected"})
    except Exception as exc:
        return jsonify({"status": "unhealthy", "database": str(exc)}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', '5000')),
        debug=os.getenv('FLASK_DEBUG', 'true').lower() == 'true',
    )
