from sqlalchemy import Column, Integer, String, Boolean, Enum, create_engine, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import enum
from datetime import datetime

import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Check for DATABASE_URL environment variable (Supabase / Vercel)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback to local SQLite if no DATABASE_URL is provided
if not SQLALCHEMY_DATABASE_URL:
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

class WitnessReportStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DISMISSED = "dismissed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
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
    
    found_items = relationship("FoundItem", foreign_keys="[FoundItem.finder_id]", back_populates="finder")
    notifications = relationship("Notification", back_populates="user")

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    location_zone = Column(String)
    found_time = Column(DateTime, default=datetime.utcnow)
    safe_photo_url = Column(String, nullable=True)
    private_admin_notes = Column(Text)
    status = Column(String, default=ItemStatus.REPORTED.value)
    embedding = Column(Text, nullable=True)
    
    # Direct Identification (Optional)
    identified_student_id = Column(String, nullable=True) # ID number found on item
    identified_name = Column(String, nullable=True) # Name found on item
    
    # Ownership/Tracking
    finder_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Modified to be nullable for guests
    contact_full_name = Column(String, nullable=True) # Modified from contact_email for guest reports
    
    # Release Metadata
    released_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    released_to_name = Column(String, nullable=True) # For walk-ins without accounts
    released_to_id_number = Column(String, nullable=True) # Official school ID for logging
    released_by_name = Column(String, nullable=True)
    released_at = Column(DateTime, nullable=True)
    released_to_photo_url = Column(String, nullable=True)
    
    finder = relationship("User", foreign_keys=[finder_id], back_populates="found_items")
    released_to = relationship("User", foreign_keys=[released_to_id])

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    location_zone = Column(String)
    last_seen_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default=ItemStatus.REPORTED.value)
    embedding = Column(Text, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_full_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    safe_photo_url = Column(String, nullable=True)
    tracking_id = Column(String, unique=True, index=True, nullable=True) # UUID for guest management
    admin_notes = Column(Text, nullable=True)
    owner = relationship("User", back_populates="lost_items")
    witness_reports = relationship("WitnessReport", back_populates="lost_item")

    @property
    def owner_name(self):
        if self.user_id and self.owner:
            return self.owner.full_name
        return self.guest_full_name

    @property
    def owner_email(self):
        if self.user_id and self.owner:
            return self.owner.email
        return self.guest_email

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("found_items.id"), nullable=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action_type = Column(String)  # e.g., "custody_update", "claim_review"
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    admin_user = relationship("User", foreign_keys=[admin_id])

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

    user = relationship("User", back_populates="notifications")

# Update User model to include lost_items relationship
User.lost_items = relationship("LostItem", back_populates="owner")
User.claims = relationship("Claim", back_populates="student")
User.witness_reports = relationship("WitnessReport", back_populates="reporter")

class ClaimStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    guest_full_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    contact_method = Column(String, nullable=True) # Facebook, Email, Contact Number
    contact_info = Column(String, nullable=True)
    course_department = Column(String, nullable=True)
    tracking_id = Column(String, unique=True, index=True, nullable=True) # UUID for guest tracking
    proof_description = Column(Text)
    proof_photo_url = Column(String, nullable=True)
    status = Column(String, default=ClaimStatus.PENDING.value)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="claims")

    @property
    def owner_name(self):
        if self.student_id and self.student:
            return self.student.full_name
        return self.guest_full_name

    @property
    def owner_email(self):
        if self.student_id and self.student:
            return self.student.email
        return self.guest_email
    
    found_item = relationship("FoundItem")

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

class WitnessReport(Base):
    __tablename__ = "witness_reports"

    id = Column(Integer, primary_key=True, index=True)
    lost_item_id = Column(Integer, ForeignKey("lost_items.id"))
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True) # If null, it's a guest
    
    guest_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    
    witness_description = Column(Text)
    witness_photo_url = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=False)
    
    status = Column(String, default=WitnessReportStatus.PENDING.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    lost_item = relationship("LostItem", back_populates="witness_reports")
    reporter = relationship("User", back_populates="witness_reports")

def init_db():
    Base.metadata.create_all(bind=engine)
