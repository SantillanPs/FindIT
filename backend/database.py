from sqlalchemy import Column, Integer, String, Boolean, Enum, create_engine, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import enum
from datetime import datetime

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'findit.db')}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"

class ItemStatus(str, enum.Enum):
    REPORTED = "reported"
    IN_CUSTODY = "in_custody"
    CLAIMED = "claimed"
    MATCHED = "matched"
    RELEASED = "released"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT.value)
    is_verified = Column(Boolean, default=False)
    student_id_number = Column(String, unique=True, index=True, nullable=True)
    verification_proof_url = Column(String, nullable=True)
    
    found_items = relationship("FoundItem", foreign_keys="[FoundItem.finder_id]", back_populates="finder")
    notifications = relationship("Notification", back_populates="user")

class FoundItem(Base):
    __tablename__ = "found_items"

    id = Column(Integer, primary_key=True, index=True)
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
    
    # Release Metadata
    released_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    released_by_name = Column(String, nullable=True)
    released_at = Column(DateTime, nullable=True)
    
    finder_id = Column(Integer, ForeignKey("users.id"))
    finder = relationship("User", foreign_keys=[finder_id], back_populates="found_items")
    released_to = relationship("User", foreign_keys=[released_to_id])

class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    description = Column(Text)
    location_zone = Column(String)
    last_seen_time = Column(DateTime, default=datetime.utcnow)
    private_proof_details = Column(Text)
    status = Column(String, default=ItemStatus.REPORTED.value)
    embedding = Column(Text, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    contact_email = Column(String, nullable=True) # For guest reports
    owner = relationship("User", back_populates="lost_items")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("found_items.id"), nullable=True)
    claim_id = Column(Integer, ForeignKey("claims.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    action_type = Column(String)  # e.g., "custody_update", "claim_review"
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

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

class ClaimStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    found_item_id = Column(Integer, ForeignKey("found_items.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    proof_description = Column(Text)
    proof_photo_url = Column(String, nullable=True)
    status = Column(String, default=ClaimStatus.PENDING.value)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    found_item = relationship("FoundItem")
    student = relationship("User", back_populates="claims")

def init_db():
    Base.metadata.create_all(bind=engine)
