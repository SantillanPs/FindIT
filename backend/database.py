from sqlalchemy import Column, Integer, String, Boolean, Enum, create_engine, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, backref
from sqlalchemy.ext.hybrid import hybrid_property
import enum
import json
from datetime import datetime

import os
from dotenv import load_dotenv, dotenv_values

# Load environment variables (force override to allow local .env to win over OS env)
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path, override=True)
# Explicitly check the file to see if it's meant to be disabled
env_file_vars = dotenv_values(env_path)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check for DATABASE_URL environment variable (Supabase / Vercel)
# Prioritize .env file even if OS has a global variable set
SQLALCHEMY_DATABASE_URL = env_file_vars.get("DATABASE_URL") or os.getenv("DATABASE_URL")

# Fallback to local SQLite if no DATABASE_URL is provided
if not SQLALCHEMY_DATABASE_URL:
    if os.getenv("VERCEL"):
        SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/findit.db"
    else:
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'findit.db')}"

# PostgreSQL needs a small fix in the URL for SQLAlchemy if it starts with postgres:// (standard for some providers)
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False, PostgreSQL does not
connect_args = {}
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class ItemStatus(str, enum.Enum):
    REPORTED = "reported"
    IN_CUSTODY = "in_custody"
    CLAIMED = "claimed"
    MATCHED = "matched"
    RELEASED = "released"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"
    PENDING_OWNER = "pending_owner"

class WitnessReportStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DISMISSED = "dismissed"

class ZoneType(str, enum.Enum):
    BUILDING = "building"
    FLOOR = "floor"
    ROOM = "room"
    HALLWAY = "hallway"
    OUTDOOR = "outdoor"

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String, default=ZoneType.ROOM.value)
    parent_zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    pos_x = Column(Integer, default=0)
    pos_y = Column(Integer, default=0)
    
    # Sub-zones (e.g., rooms inside a building)
    sub_zones = relationship("Zone", backref=backref("parent_zone", remote_side=[id]))

class ZoneAdjacency(Base):
    __tablename__ = "zone_adjacencies"

    id = Column(Integer, primary_key=True, index=True)
    zone_a_id = Column(Integer, ForeignKey("zones.id"), index=True)
    zone_b_id = Column(Integer, ForeignKey("zones.id"), index=True)
    distance_weight = Column(Integer, default=1) # 1 = immediate adjacency

    zone_a = relationship("Zone", foreign_keys=[zone_a_id])
    zone_b = relationship("Zone", foreign_keys=[zone_b_id])

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT.value)
    is_verified = Column(Boolean, default=False)
    student_id_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True) # College department
    verification_proof_url = Column(String, nullable=True)
    
    # Reputation System
    integrity_points = Column(Integer, default=0) # Earned by returning items
    fraud_strikes = Column(Integer, default=0)    # Penalized for fake claims
    is_blacklisted = Column(Boolean, default=False)
    is_certificate_eligible = Column(Boolean, default=False)
    show_full_name = Column(Boolean, default=False) # Privacy toggle for leaderboard
    
    # Password Reset
    password_reset_token = Column(String, nullable=True, index=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    @hybrid_property
    def full_name(self):
        fname = self.first_name or ""
        lname = self.last_name or ""
        return f"{fname} {lname}".strip() or "Anonymous User"

    @full_name.expression
    def full_name(cls):
        from sqlalchemy import func
        return func.trim(func.coalesce(cls.first_name, '') + ' ' + func.coalesce(cls.last_name, ''))

    found_items = relationship("FoundItem", foreign_keys="[FoundItem.finder_id]", back_populates="finder", lazy="selectin")
    notifications = relationship("Notification", back_populates="user")
    claims = relationship("Claim", back_populates="student")
    witness_reports = relationship("WitnessReport", back_populates="reporter")
    assets = relationship("Asset", back_populates="owner", cascade="all, delete-orphan")

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    location_zone = Column(String)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True) # New graph zone
    found_time = Column(DateTime, default=datetime.utcnow)
    safe_photo_url = Column(String, nullable=True)
    safe_photo_thumbnail_url = Column(String, nullable=True)
    private_admin_notes = Column(Text)
    status = Column(String, default=ItemStatus.REPORTED.value)
    embedding = Column(Text, nullable=True)
    matched_lost_id = Column(Integer, ForeignKey("lost_items.id"), nullable=True)
    
    # Internal Verification (New Handshake Model)
    verification_note = Column(Text, nullable=True) # E.g., "Small sunflower sticker under case"
    challenge_question = Column(Text, nullable=True) # E.g., "What is the logo on the buckle?"
    
    # Direct Identification (Optional)
    identified_student_id = Column(String, nullable=True) # ID number found on item
    identified_name = Column(String, nullable=True) # Name found on item
    
    # Ownership/Tracking
    finder_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Modified to be nullable for guests
    guest_first_name = Column(String, nullable=True)
    guest_last_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    contact_info = Column(Text, nullable=True) # "How can we contact you?"
    
    # Release Metadata
    released_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    released_to_name = Column(String, nullable=True) # For walk-ins without accounts
    released_to_id_number = Column(String, nullable=True) # Official school ID for logging
    released_by_name = Column(String, nullable=True)
    released_at = Column(DateTime, nullable=True)
    released_to_photo_url = Column(String, nullable=True)
    attributes_json = Column(Text, nullable=True) # JSON string of attributes
    
    finder = relationship("User", foreign_keys=[finder_id], back_populates="found_items", lazy="joined")
    released_to = relationship("User", foreign_keys=[released_to_id], lazy="joined")
    zone = relationship("Zone", foreign_keys=[zone_id], lazy="joined")
    matched_lost_report = relationship("LostItem", foreign_keys=[matched_lost_id], lazy="joined")

    @property
    def owner_name(self):
        if self.finder_id and self.finder:
            fname = self.finder.first_name or ""
            lname = self.finder.last_name or ""
            name = f"{fname} {lname}".strip()
            return name if name else "Anonymous Student"
        if self.guest_first_name or self.guest_last_name:
            fname = self.guest_first_name or ""
            lname = self.guest_last_name or ""
            return f"{fname} {lname}".strip()
        return "Anonymous Finder"

    @property
    def attributes(self):
        if not self.attributes_json:
            return {}
        try:
            return json.loads(self.attributes_json)
        except:
            return {}

    @attributes.setter
    def attributes(self, value):
        if value is None:
            self.attributes_json = None
        else:
            self.attributes_json = json.dumps(value)

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    location_zone = Column(String)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True) # New graph zone
    last_seen_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default=ItemStatus.REPORTED.value)
    embedding = Column(Text, nullable=True)
    potential_zone_ids = Column(Text, default="[]")
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_first_name = Column(String, nullable=True)
    guest_last_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    contact_info = Column(Text, nullable=True) # "How can we contact you?"
    safe_photo_url = Column(String, nullable=True)
    safe_photo_thumbnail_url = Column(String, nullable=True)
    tracking_id = Column(String, unique=True, index=True, nullable=True) # UUID for guest management
    admin_notes = Column(Text, nullable=True)
    attributes_json = Column(Text, nullable=True) # JSON string of attributes
    
    owner = relationship("User", back_populates="lost_items", lazy="joined")
    witness_reports = relationship("WitnessReport", back_populates="lost_item", lazy="selectin")
    zone = relationship("Zone", foreign_keys=[zone_id], lazy="joined")

    @property
    def owner_name(self):
        if self.user_id and self.owner:
            fname = self.owner.first_name or ""
            lname = self.owner.last_name or ""
            name = f"{fname} {lname}".strip()
            return name if name else "Anonymous Student"
        if self.guest_first_name or self.guest_last_name:
            fname = self.guest_first_name or ""
            lname = self.guest_last_name or ""
            return f"{fname} {lname}".strip()
        return "Anonymous Guest"

    @property
    def attributes(self):
        if not self.attributes_json:
            return {}
        try:
            return json.loads(self.attributes_json)
        except:
            return {}

    @attributes.setter
    def attributes(self, value):
        if value is None:
            self.attributes_json = None
        else:
            self.attributes_json = json.dumps(value)

    @property
    def owner_email(self):
        if self.user_id and self.owner and self.owner.email:
            return self.owner.email
        if self.guest_email:
            return self.guest_email
        return "N/A"

class FeedbackType(str, enum.Enum):
    BUG = "bug"
    FEATURE = "feature"
    UX = "ux"
    GENERAL = "general"

class FeedbackStatus(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String, default=FeedbackType.GENERAL.value)
    subject = Column(String)
    message = Column(Text)
    screenshot_url = Column(String, nullable=True)
    page_url = Column(String, nullable=True)
    browser_info = Column(Text, nullable=True)
    status = Column(String, default=FeedbackStatus.PENDING.value)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", lazy="joined")
    
    @property
    def user_name(self):
        if self.user_id and self.user:
            fname = self.user.first_name or ""
            lname = self.user.last_name or ""
            name = f"{fname} {lname}".strip()
            return name if name else "Anonymous Student"
        return "Anonymous Guest"

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("found_items.id"), nullable=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action_type = Column(String)  # e.g., "custody_update", "claim_review"
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    admin_user = relationship("User", foreign_keys=[admin_id], lazy="joined")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Optional references
    found_item_id = Column(Integer, ForeignKey("found_items.id"), nullable=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"), nullable=True)

    user = relationship("User", back_populates="notifications", lazy="joined")

# Update User model to include lost_items relationship
User.lost_items = relationship("LostItem", back_populates="owner", lazy="selectin")
User.claims = relationship("Claim", back_populates="student", lazy="selectin")
User.witness_reports = relationship("WitnessReport", back_populates="reporter", lazy="selectin")

class ClaimStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_first_name = Column(String, nullable=True)
    guest_last_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    contact_method = Column(String, nullable=True) # Facebook, Email, Contact Number
    contact_info = Column(String, nullable=True)
    course_department = Column(String, nullable=True)
    tracking_id = Column(String, unique=True, index=True, nullable=True) # UUID for guest tracking
    proof_description = Column(Text)
    proof_photo_url = Column(String, nullable=True)
    status = Column(String, default=ClaimStatus.PENDING.value)
    admin_notes = Column(Text, nullable=True)
    is_pickup_ready = Column(Boolean, default=False)
    scheduled_pickup_time = Column(DateTime, nullable=True)
    attributes_json = Column(Text, nullable=True) # JSON string of attributes
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="claims", lazy="joined")

    @property
    def owner_name(self):
        if self.student_id and self.student:
            fname = self.student.first_name or ""
            lname = self.student.last_name or ""
            name = f"{fname} {lname}".strip()
            return name if name else "Anonymous Student"
        if self.guest_first_name or self.guest_last_name:
            fname = self.guest_first_name or ""
            lname = self.guest_last_name or ""
            return f"{fname} {lname}".strip()
        return "Anonymous Guest"

    @property
    def attributes(self):
        if not self.attributes_json:
            return {}
        try:
            return json.loads(self.attributes_json)
        except:
            return {}

    @attributes.setter
    def attributes(self, value):
        if value is None:
            self.attributes_json = None
        else:
            self.attributes_json = json.dumps(value)

    @property
    def owner_email(self):
        if self.student_id and self.student:
            return self.student.email
        return self.guest_email

    found_item = relationship("FoundItem", lazy="joined")

class CategoryStat(Base):
    __tablename__ = "category_stats"
    category_id = Column(String, primary_key=True)
    hit_count = Column(Integer, default=0)

class OtherSuggestion(Base):
    __tablename__ = "other_suggestions"
    id = Column(Integer, primary_key=True, index=True)
    suggested_name = Column(String, unique=True)
    hit_count = Column(Integer, default=1)
    last_reported_at = Column(DateTime, default=datetime.utcnow)

class MasterCategory(Base):
    __tablename__ = "master_categories"
    id = Column(String, primary_key=True) # Slug e.g. 'Laptop'
    label = Column(String)
    icon = Column(String)
    emoji = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

class MasterCollege(Base):
    __tablename__ = "master_colleges"
    id = Column(String, primary_key=True) # Slug e.g. 'CITE'
    label = Column(String)
    icon = Column(String)
    color = Column(String)
    is_active = Column(Boolean, default=True)

class WitnessReport(Base):
    __tablename__ = "witness_reports"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    
    guest_first_name = Column(String, nullable=True)
    guest_last_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    contact_info = Column(Text, nullable=True)
    
    witness_description = Column(Text)
    witness_photo_url = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    
    status = Column(String, default=WitnessReportStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="witness_reports")
    reporter = relationship("User", back_populates="witness_reports")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    category = Column(String)
    description = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    serial_number = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    model_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="assets")

def init_db():
    Base.metadata.create_all(bind=engine)
