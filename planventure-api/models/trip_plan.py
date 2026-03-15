from datetime import datetime, timezone

from libs.database import db


class TripPlan(db.Model):
    __tablename__ = "trip_plans"

    id = db.Column(db.Integer, primary_key=True)

    trip_id = db.Column(
        db.Integer,
        db.ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    activity_id = db.Column(db.Integer, nullable=True, index=True)

    plan_seq = db.Column(db.Integer, nullable=True)            # ordering within a trip

    plan_time = db.Column(db.String(10), nullable=True)       # e.g. "09:00"
    plan_activity = db.Column(db.String(500), nullable=False)
    plan_traffic = db.Column(db.String(255), nullable=True)   # e.g. "MRT", "Walk", "Taxi"
    plan_note = db.Column(db.Text, nullable=True)

    plan_location_from = db.Column(db.String(255), nullable=True)
    plan_loc_frm_latitude = db.Column(db.Float, nullable=True)
    plan_loc_frm_longitude = db.Column(db.Float, nullable=True)

    plan_location_to = db.Column(db.String(255), nullable=True)
    plan_loc_to_latitude = db.Column(db.Float, nullable=True)
    plan_loc_to_longitude = db.Column(db.Float, nullable=True)

    # Timestamps
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

    # Relationship back to trip
    trip = db.relationship(
        "Trip",
        backref=db.backref("plans", lazy="dynamic", passive_deletes=True),
    )

    def __repr__(self) -> str:
        return f"<TripPlan id={self.id} trip_id={self.trip_id} activity={self.plan_activity!r}>"
