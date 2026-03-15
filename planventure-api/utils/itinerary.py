from datetime import date, timedelta

from models.trip import Trip
from models.trip_plan import TripPlan

# Default daily schedule slots — (plan_seq, plan_time, plan_activity, plan_note)
_DEFAULT_SLOTS: list[tuple[int, str, str, str]] = [
    (1, "08:00", "Breakfast",        "Start the day with a local meal"),
    (2, "09:30", "Morning activity",  "Explore a nearby attraction"),
    (3, "12:00", "Lunch",             "Try local cuisine"),
    (4, "14:00", "Afternoon activity","Visit a landmark or museum"),
    (5, "17:00", "Evening walk",      "Stroll around the neighbourhood"),
    (6, "19:00", "Dinner",            "Enjoy dinner at a local restaurant"),
]


def generate_default_plans(trip: Trip) -> list[TripPlan]:
    """
    Build a list of unsaved TripPlan objects covering every day of `trip`
    (start_date to end_date inclusive), each day using the default schedule
    slots defined in _DEFAULT_SLOTS.

    The caller is responsible for adding the returned objects to the DB session
    and committing.

    Returns:
        list[TripPlan]: Unsaved plan objects ordered by date then plan_seq.
    """
    plans: list[TripPlan] = []
    total_days = (trip.end_date - trip.start_date).days + 1

    for day_offset in range(total_days):
        current_date: date = trip.start_date + timedelta(days=day_offset)
        day_label = f"Day {day_offset + 1} — {current_date.isoformat()}"

        for seq, plan_time, plan_activity, plan_note in _DEFAULT_SLOTS:
            plans.append(
                TripPlan(
                    trip_id=trip.id,
                    plan_seq=seq,
                    plan_time=plan_time,
                    plan_activity=f"{day_label}: {plan_activity}",
                    plan_note=plan_note,
                    plan_location_to=trip.destination,
                    plan_loc_to_latitude=trip.latitude,
                    plan_loc_to_longitude=trip.longitude,
                )
            )

    return plans
