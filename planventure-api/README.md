# PlanVenture API

A RESTful Flask API for planning and managing travel itineraries. Supports user authentication with JWT, trip management, and day-by-day activity planning.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Management](#database-management)
- [API Reference](#api-reference)
  - [Health](#health)
  - [Auth](#auth)
  - [Trips](#trips)
  - [Trip Plans](#trip-plans)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

---

## Tech Stack

| Package            | Version | Purpose                                            |
| ------------------ | ------- | -------------------------------------------------- |
| Flask              | 2.3.3   | Web framework                                      |
| Flask-SQLAlchemy   | 3.1.1   | ORM                                                |
| SQLAlchemy         | 2.0.36  | Database engine (≥2.0.36 required for Python 3.13) |
| Flask-Migrate      | 4.0.7   | Alembic-based schema migrations                    |
| Flask-JWT-Extended | 4.6.0   | JWT authentication                                 |
| bcrypt             | 4.1.2   | Password hashing                                   |
| Flask-CORS         | 4.0.0   | Cross-origin resource sharing                      |
| gunicorn           | 21.2.0  | Production WSGI server                             |

---

## Project Structure

```
planventure-api/
├── app.py                  # App factory and entry point
├── manage.py               # DB CLI (init, migrate, upgrade, downgrade)
├── requirements.txt
├── .sample.env             # Environment variable template
│
├── libs/
│   ├── config.py           # Config class (all settings from env)
│   ├── database.py         # Shared db + migrate instances
│   └── auth_middleware.py  # @jwt_required decorator + get_current_user()
│
├── models/
│   ├── __init__.py
│   ├── user.py             # User model (email, bcrypt password, JWT methods)
│   ├── trip.py             # Trip model (destination, dates, coordinates)
│   └── trip_plan.py        # TripPlan model (activities, locations, sequence)
│
├── routes/
│   ├── auth.py             # /auth/register, /auth/login
│   └── trips.py            # /api/trips + /api/trips/<id>/plans
│
└── utils/
    ├── validators.py       # Email + password validation
    ├── jwt.py              # Token generation and decoding helpers
    ├── password.py         # hash_password() / verify_password()
    └── itinerary.py        # generate_default_plans() template generator
```

---

## Getting Started

### Prerequisites

- Python 3.13+
- conda or virtualenv

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/planventure.git
cd planventure/planventure-api

# Create and activate conda environment
conda create -n planventure python=3.13
conda activate planventure

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .sample.env .env
# Edit .env and fill in SECRET_KEY, JWT_SECRET_KEY etc.
```

### Run — Development

```bash
flask run --debug
```

### Run — Production

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## Environment Variables

All settings are read from .sample.env (rename to `.env` for production).

```ini
FLASK_APP=app.py
FLASK_DEBUG=true
PORT=5000

# Security
SECRET_KEY=your-secret-key-here

# JWT
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30
JWT_TOKEN_LOCATION=headers
JWT_HEADER_NAME=Authorization
JWT_HEADER_TYPE=Bearer

# Database
DATABASE_URL=sqlite:///planventure.db

# CORS
CORS_ORIGINS=http://localhost:3000
CORS_SUPPORTS_CREDENTIALS=false
CORS_MAX_AGE=600
```

---

## Database Management

```bash
# Initialise migrations folder (first time only)
python manage.py init

# Generate a new migration after model changes
python manage.py migrate -m "description"

# Apply pending migrations
python manage.py upgrade

# Roll back one migration
python manage.py downgrade
```

---

## API Reference

### Health

| Method | Endpoint     | Auth | Description                 |
| ------ | ------------ | ---- | --------------------------- |
| GET    | `/`          | No   | Welcome message             |
| GET    | `/health`    | No   | API liveness check          |
| GET    | `/health/db` | No   | Database connectivity check |

---

### Auth

#### `POST /auth/register`

Create a new user account. Returns JWT tokens on success.

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1!"
}
```

**Response `201`**

```json
{
  "message": "Account created successfully.",
  "user": { "id": 1, "email": "jane@example.com" },
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

---

#### `POST /auth/login`

Authenticate and retrieve JWT tokens.

**Request body**

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1!"
}
```

**Response `200`**

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>"
}
```

---

### Trips

All trip endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint          | Description                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/api/trips`      | List all trips for the current user |
| POST   | `/api/trips`      | Create a new trip                   |
| GET    | `/api/trips/<id>` | Get a single trip                   |
| PUT    | `/api/trips/<id>` | Full replace of a trip              |
| PATCH  | `/api/trips/<id>` | Partial update of a trip            |
| DELETE | `/api/trips/<id>` | Delete a trip                       |

#### `POST /api/trips` — Request body

```json
{
  "destination": "Tokyo, Japan",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "start_date": "2026-04-10",
  "end_date": "2026-04-17"
}
```

> `destination`, `start_date`, `end_date` are required. `latitude` and `longitude` are optional.

#### Trip response object

```json
{
  "id": 1,
  "destination": "Tokyo, Japan",
  "latitude": 35.6762,
  "longitude": 139.6503,
  "start_date": "2026-04-10",
  "end_date": "2026-04-17",
  "created_at": "2026-03-15T10:00:00+00:00",
  "updated_at": "2026-03-15T10:00:00+00:00"
}
```

---

### Trip Plans

All plan endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint                               | Description                                       |
| ------ | -------------------------------------- | ------------------------------------------------- |
| GET    | `/api/trips/<trip_id>/plans`           | List all plans for a trip (sorted by `plan_time`) |
| POST   | `/api/trips/<trip_id>/plans`           | Create a new plan                                 |
| GET    | `/api/trips/<trip_id>/plans/<plan_id>` | Get a single plan                                 |
| PUT    | `/api/trips/<trip_id>/plans/<plan_id>` | Full replace of a plan                            |
| PATCH  | `/api/trips/<trip_id>/plans/<plan_id>` | Partial update of a plan                          |
| DELETE | `/api/trips/<trip_id>/plans/<plan_id>` | Delete a plan                                     |
| POST   | `/api/trips/<trip_id>/plans/generate`  | Generate default itinerary template               |

#### `POST /api/trips/<trip_id>/plans` — Request body

```json
{
  "plan_seq": 1,
  "activity_id": 101,
  "plan_time": "09:00",
  "plan_activity": "Visit Senso-ji Temple",
  "plan_traffic": "Metro",
  "plan_note": "Arrive early to avoid crowds",
  "plan_location_from": "Shinjuku Station",
  "plan_loc_frm_latitude": 35.6896,
  "plan_loc_frm_longitude": 139.7006,
  "plan_location_to": "Senso-ji Temple, Asakusa",
  "plan_loc_to_latitude": 35.7148,
  "plan_loc_to_longitude": 139.7967
}
```

> Only `plan_activity` is required. All other fields are optional.

#### `POST /api/trips/<trip_id>/plans/generate`

Generates a default 6-slot daily schedule (Breakfast, Morning activity, Lunch, Afternoon activity, Evening walk, Dinner) for every day of the trip.

| Query param | Type | Default | Description                                             |
| ----------- | ---- | ------- | ------------------------------------------------------- |
| `replace`   | bool | `false` | If `true`, deletes all existing plans before generating |

```bash
# Generate and append
POST /api/trips/1/plans/generate

# Wipe and regenerate
POST /api/trips/1/plans/generate?replace=true
```

#### Plan response object

```json
{
  "id": 1,
  "trip_id": 1,
  "activity_id": 101,
  "plan_seq": 1,
  "plan_time": "09:00",
  "plan_activity": "Visit Senso-ji Temple",
  "plan_traffic": "Metro",
  "plan_note": "Arrive early to avoid crowds",
  "plan_location_from": "Shinjuku Station",
  "plan_loc_frm_latitude": 35.6896,
  "plan_loc_frm_longitude": 139.7006,
  "plan_location_to": "Senso-ji Temple, Asakusa",
  "plan_loc_to_latitude": 35.7148,
  "plan_loc_to_longitude": 139.7967,
  "created_at": "2026-03-15T10:00:00+00:00",
  "updated_at": "2026-03-15T10:00:00+00:00"
}
```

---

## Authentication

The API uses **JWT Bearer tokens**. Include the access token in every protected request:

```
Authorization: Bearer <access_token>
```

- Access tokens expire after **15 minutes** (configurable via `JWT_ACCESS_TOKEN_EXPIRES_MINUTES`)
- Refresh tokens expire after **30 days** (configurable via `JWT_REFRESH_TOKEN_EXPIRES_DAYS`)

---

## Error Handling

All errors return a consistent JSON body:

```json
{ "error": "Description of the error." }
```

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| `400`  | Bad request / malformed JSON             |
| `401`  | Missing, invalid, or expired token       |
| `404`  | Resource not found                       |
| `409`  | Conflict (e.g. email already registered) |
| `422`  | Validation error                         |
| `500`  | Internal server error                    |
