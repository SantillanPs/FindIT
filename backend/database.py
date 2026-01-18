from sqlalchemy import Column, Integer, String, Boolean, Enum, create_engine, Text, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import enum
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./findit.db"

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
    CLAIMED = "claimed"
    RELEASED = "released"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.STUDENT.value)
    is_verified = Column(Boolean, default=False)
    
    found_items = relationship("FoundItem", foreign_keys="[FoundItem.finder_id]", back_populates="finder")

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
    embedding = Column(Text, nullable=True)  # Stored as JSON string or comma-separated for simplicity in this prototype
    
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
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="lost_items")

# Update User model to include lost_items relationship
# (Need to make sure User class is aware of it)
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
    status = Column(String, default=ClaimStatus.PENDING.value)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    found_item = relationship("FoundItem")
    student = relationship("User", back_populates="claims")

def init_db():
    Base.metadata.create_all(bind=engine)
