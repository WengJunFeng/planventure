from datetime import datetime, timezone

from libs.database import db


class TripPhoto(db.Model):
    __tablename__ = "trip_photos"

    pict_id = db.Column(db.Integer, primary_key=True)

    # Owner trip
    trip_id = db.Column(
        db.Integer,
        db.ForeignKey("trips.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Photo info
    pict_name = db.Column(db.String(255), nullable=False)
    pict_time = db.Column(db.DateTime(timezone=True), nullable=True)
    pict_small_url = db.Column(db.String(1024), nullable=True)   # MinIO object key
    pict_origin_url = db.Column(db.String(1024), nullable=False)  # MinIO object key
    pict_size_kb = db.Column(db.Integer, nullable=False, default=0)  # total KB stored (original + thumbnail)

    # User comment
    comment = db.Column(db.Text, nullable=True)

    # Access control: 0 = private, 1 = public
    access_flag = db.Column(db.SmallInteger, nullable=False, default=0)

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
        backref=db.backref("photos", lazy="dynamic", passive_deletes=True),
    )

    def __repr__(self) -> str:
        return f"<TripPhoto pict_id={self.pict_id} trip_id={self.trip_id} name={self.pict_name!r}>"
