from datetime import date

from flask import Blueprint, jsonify, request

from libs.auth_middleware import get_current_user, jwt_required
from libs.database import db
from models.trip import Trip
from models.trip_plan import TripPlan
from utils.itinerary import generate_default_plans

trips_bp = Blueprint("trips", __name__, url_prefix="/api/trips")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_trip(trip: Trip) -> dict:
    return {
        "id": trip.id,
        "destination": trip.destination,
        "latitude": trip.latitude,
        "longitude": trip.longitude,
        "start_date": trip.start_date.isoformat(),
        "end_date": trip.end_date.isoformat(),
        "created_at": trip.created_at.isoformat(),
        "updated_at": trip.updated_at.isoformat(),
    }


def _serialize_plan(plan: TripPlan) -> dict:
    return {
        "id": plan.id,
        "trip_id": plan.trip_id,
        "activity_id": plan.activity_id,
        "plan_seq": plan.plan_seq,
        "plan_time": plan.plan_time,
        "plan_activity": plan.plan_activity,
        "plan_traffic": plan.plan_traffic,
        "plan_note": plan.plan_note,
        "plan_location_from": plan.plan_location_from,
        "plan_loc_frm_latitude": plan.plan_loc_frm_latitude,
        "plan_loc_frm_longitude": plan.plan_loc_frm_longitude,
        "plan_location_to": plan.plan_location_to,
        "plan_loc_to_latitude": plan.plan_loc_to_latitude,
        "plan_loc_to_longitude": plan.plan_loc_to_longitude,
        "created_at": plan.created_at.isoformat(),
        "updated_at": plan.updated_at.isoformat(),
    }


def _parse_date(value: str, field: str):
    try:
        return date.fromisoformat(value), None
    except (ValueError, TypeError):
        return None, f"'{field}' must be a valid ISO date (YYYY-MM-DD)."


def _get_owned_trip(trip_id: int, user_id: int):
    return Trip.query.filter_by(id=trip_id, user_id=user_id).first()


# ---------------------------------------------------------------------------
# Trip CRUD
# ---------------------------------------------------------------------------

@trips_bp.route("", methods=["GET"])
@jwt_required
def list_trips():
    user = get_current_user()
    trips = Trip.query.filter_by(user_id=user.id).order_by(Trip.start_date).all()
    return jsonify([_serialize_trip(t) for t in trips]), 200


@trips_bp.route("", methods=["POST"])
@jwt_required
def create_trip():
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    destination = (data.get("destination") or "").strip()
    if not destination:
        return jsonify({"error": "destination is required."}), 422

    start_date, err = _parse_date(data.get("start_date"), "start_date")
    if err:
        return jsonify({"error": err}), 422

    end_date, err = _parse_date(data.get("end_date"), "end_date")
    if err:
        return jsonify({"error": err}), 422

    if end_date < start_date:
        return jsonify({"error": "end_date must be on or after start_date."}), 422

    trip = Trip(
        user_id=user.id,
        destination=destination,
        latitude=data.get("latitude"),
        longitude=data.get("longitude"),
        start_date=start_date,
        end_date=end_date,
    )
    try:
        db.session.add(trip)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to create trip. Please try again."}), 500

    return jsonify(_serialize_trip(trip)), 201


@trips_bp.route("/<int:trip_id>", methods=["GET"])
@jwt_required
def get_trip(trip_id):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404
    return jsonify(_serialize_trip(trip)), 200


@trips_bp.route("/<int:trip_id>", methods=["PUT"])
@jwt_required
def update_trip(trip_id):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    data = request.get_json(silent=True) or {}

    destination = (data.get("destination") or "").strip()
    if not destination:
        return jsonify({"error": "destination is required."}), 422

    start_date, err = _parse_date(data.get("start_date"), "start_date")
    if err:
        return jsonify({"error": err}), 422

    end_date, err = _parse_date(data.get("end_date"), "end_date")
    if err:
        return jsonify({"error": err}), 422

    if end_date < start_date:
        return jsonify({"error": "end_date must be on or after start_date."}), 422

    trip.destination = destination
    trip.latitude = data.get("latitude", trip.latitude)
    trip.longitude = data.get("longitude", trip.longitude)
    trip.start_date = start_date
    trip.end_date = end_date

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to update trip. Please try again."}), 500

    return jsonify(_serialize_trip(trip)), 200


@trips_bp.route("/<int:trip_id>", methods=["PATCH"])
@jwt_required
def patch_trip(trip_id):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    data = request.get_json(silent=True) or {}

    if "destination" in data:
        destination = (data["destination"] or "").strip()
        if not destination:
            return jsonify({"error": "destination cannot be empty."}), 422
        trip.destination = destination

    if "start_date" in data:
        start_date, err = _parse_date(data["start_date"], "start_date")
        if err:
            return jsonify({"error": err}), 422
        trip.start_date = start_date

    if "end_date" in data:
        end_date, err = _parse_date(data["end_date"], "end_date")
        if err:
            return jsonify({"error": err}), 422
        trip.end_date = end_date

    if trip.end_date < trip.start_date:
        return jsonify({"error": "end_date must be on or after start_date."}), 422

    for field in ("latitude", "longitude"):
        if field in data:
            setattr(trip, field, data[field])

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to update trip. Please try again."}), 500

    return jsonify(_serialize_trip(trip)), 200


@trips_bp.route("/<int:trip_id>", methods=["DELETE"])
@jwt_required
def delete_trip(trip_id):
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    try:
        db.session.delete(trip)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to delete trip. Please try again."}), 500

    return jsonify({"message": "Trip deleted successfully."}), 200


# ---------------------------------------------------------------------------
# TripPlan CRUD  —  /api/trips/<trip_id>/plans
# ---------------------------------------------------------------------------

@trips_bp.route("/<int:trip_id>/plans/generate", methods=["POST"])
@jwt_required
def generate_plans(trip_id):
    """Generate a default itinerary template for every day of the trip.

    Query param:
        replace (bool, default false) — if true, delete existing plans first.
    """
    user = get_current_user()
    trip = _get_owned_trip(trip_id, user.id)
    if not trip:
        return jsonify({"error": "Trip not found."}), 404

    replace = request.args.get("replace", "false").lower() == "true"

    try:
        if replace:
            TripPlan.query.filter_by(trip_id=trip_id).delete()

        plans = generate_default_plans(trip)
        db.session.add_all(plans)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to generate itinerary. Please try again."}), 500

    result = TripPlan.query.filter_by(trip_id=trip_id).order_by(
        TripPlan.plan_seq
    ).all()
    return jsonify([_serialize_plan(p) for p in result]), 201


@trips_bp.route("/<int:trip_id>/plans", methods=["GET"])
@jwt_required
def list_plans(trip_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    plans = TripPlan.query.filter_by(trip_id=trip_id).order_by(TripPlan.plan_time).all()
    return jsonify([_serialize_plan(p) for p in plans]), 200


@trips_bp.route("/<int:trip_id>/plans", methods=["POST"])
@jwt_required
def create_plan(trip_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    data = request.get_json(silent=True) or {}

    plan_activity = (data.get("plan_activity") or "").strip()
    if not plan_activity:
        return jsonify({"error": "plan_activity is required."}), 422

    plan = TripPlan(
        trip_id=trip_id,
        activity_id=data.get("activity_id"),
        plan_seq=data.get("plan_seq"),
        plan_time=data.get("plan_time"),
        plan_activity=plan_activity,
        plan_traffic=data.get("plan_traffic"),
        plan_note=data.get("plan_note"),
        plan_location_from=data.get("plan_location_from"),
        plan_loc_frm_latitude=data.get("plan_loc_frm_latitude"),
        plan_loc_frm_longitude=data.get("plan_loc_frm_longitude"),
        plan_location_to=data.get("plan_location_to"),
        plan_loc_to_latitude=data.get("plan_loc_to_latitude"),
        plan_loc_to_longitude=data.get("plan_loc_to_longitude"),
    )
    try:
        db.session.add(plan)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to create plan. Please try again."}), 500

    return jsonify(_serialize_plan(plan)), 201


@trips_bp.route("/<int:trip_id>/plans/<int:plan_id>", methods=["GET"])
@jwt_required
def get_plan(trip_id, plan_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    plan = TripPlan.query.filter_by(id=plan_id, trip_id=trip_id).first()
    if not plan:
        return jsonify({"error": "Plan not found."}), 404
    return jsonify(_serialize_plan(plan)), 200


@trips_bp.route("/<int:trip_id>/plans/<int:plan_id>", methods=["PUT"])
@jwt_required
def update_plan(trip_id, plan_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    plan = TripPlan.query.filter_by(id=plan_id, trip_id=trip_id).first()
    if not plan:
        return jsonify({"error": "Plan not found."}), 404

    data = request.get_json(silent=True) or {}

    plan_activity = (data.get("plan_activity") or "").strip()
    if not plan_activity:
        return jsonify({"error": "plan_activity is required."}), 422

    plan.activity_id = data.get("activity_id", plan.activity_id)
    plan.plan_seq = data.get("plan_seq", plan.plan_seq)
    plan.plan_time = data.get("plan_time", plan.plan_time)
    plan.plan_activity = plan_activity
    plan.plan_traffic = data.get("plan_traffic", plan.plan_traffic)
    plan.plan_note = data.get("plan_note", plan.plan_note)
    plan.plan_location_from = data.get("plan_location_from", plan.plan_location_from)
    plan.plan_loc_frm_latitude = data.get("plan_loc_frm_latitude", plan.plan_loc_frm_latitude)
    plan.plan_loc_frm_longitude = data.get("plan_loc_frm_longitude", plan.plan_loc_frm_longitude)
    plan.plan_location_to = data.get("plan_location_to", plan.plan_location_to)
    plan.plan_loc_to_latitude = data.get("plan_loc_to_latitude", plan.plan_loc_to_latitude)
    plan.plan_loc_to_longitude = data.get("plan_loc_to_longitude", plan.plan_loc_to_longitude)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to update plan. Please try again."}), 500

    return jsonify(_serialize_plan(plan)), 200


@trips_bp.route("/<int:trip_id>/plans/<int:plan_id>", methods=["PATCH"])
@jwt_required
def patch_plan(trip_id, plan_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    plan = TripPlan.query.filter_by(id=plan_id, trip_id=trip_id).first()
    if not plan:
        return jsonify({"error": "Plan not found."}), 404

    data = request.get_json(silent=True) or {}

    if "plan_activity" in data:
        plan_activity = (data["plan_activity"] or "").strip()
        if not plan_activity:
            return jsonify({"error": "plan_activity cannot be empty."}), 422
        plan.plan_activity = plan_activity

    for field in (
        "activity_id", "plan_seq", "plan_time", "plan_traffic", "plan_note",
        "plan_location_from", "plan_loc_frm_latitude", "plan_loc_frm_longitude",
        "plan_location_to", "plan_loc_to_latitude", "plan_loc_to_longitude",
    ):
        if field in data:
            setattr(plan, field, data[field])

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to update plan. Please try again."}), 500

    return jsonify(_serialize_plan(plan)), 200


@trips_bp.route("/<int:trip_id>/plans/<int:plan_id>", methods=["DELETE"])
@jwt_required
def delete_plan(trip_id, plan_id):
    user = get_current_user()
    if not _get_owned_trip(trip_id, user.id):
        return jsonify({"error": "Trip not found."}), 404

    plan = TripPlan.query.filter_by(id=plan_id, trip_id=trip_id).first()
    if not plan:
        return jsonify({"error": "Plan not found."}), 404

    try:
        db.session.delete(plan)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Failed to delete plan. Please try again."}), 500

    return jsonify({"message": "Plan deleted successfully."}), 200
