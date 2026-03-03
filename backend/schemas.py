from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"
    full_name: Optional[str] = None
    student_id_number: Optional[str] = None
    department: Optional[str] = None
    verification_proof_url: Optional[str] = None


class UpgradeGuestRequest(BaseModel):
    email: EmailStr
    full_name: str
    student_id_number: str
    password: Optional[str] = None


class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_verified: bool
    full_name: Optional[str] = None
    student_id_number: Optional[str] = None
    department: Optional[str] = None
    verification_proof_url: Optional[str] = None
    integrity_points: int = 0
    fraud_strikes: int = 0
    is_blacklisted: bool = False
    is_certificate_eligible: bool = False
    show_full_name: bool = False

class UserPublicResponse(BaseModel):
    id: int
    full_name_masked: str
    show_full_name: bool
    department: Optional[str] = None
    integrity_points: int
    is_certificate_eligible: bool
    rank: Optional[int] = None

    class Config:
        from_attributes = True

class UserReputationUpdate(BaseModel):
    points_modifier: int = 0
    strikes_modifier: int = 0
    is_blacklisted: Optional[bool] = None

class CertificateEligibilityUpdate(BaseModel):
    is_eligible: bool

class UserPreferenceUpdate(BaseModel):
    show_full_name: Optional[bool] = None
    department: Optional[str] = None

class UserUpdate(BaseModel):
    is_verified: bool

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Found Item Schemas
class FoundItemBase(BaseModel):
    item_name: str
    category: Optional[str] = None
    description: str
    location_zone: str
    found_time: Optional[datetime] = None
    safe_photo_url: Optional[str] = None

class FoundItemCreate(FoundItemBase):
    contact_full_name: Optional[str] = None
    identified_student_id: Optional[str] = None
    identified_name: Optional[str] = None

class FoundItemPublic(FoundItemBase):
    id: int
    status: str
    contact_full_name: Optional[str] = None
    identified_student_id: Optional[str] = None
    identified_name: Optional[str] = None

    class Config:
        from_attributes = True

class FoundItemDetail(FoundItemPublic):
    private_admin_notes: Optional[str] = None
    identified_student_id: Optional[str] = None
    identified_name: Optional[str] = None
    finder_id: Optional[int] = None
    embedding: Optional[str] = None
    released_to_id: Optional[int] = None
    released_to_name: Optional[str] = None
    released_to_id_number: Optional[str] = None
    released_by_name: Optional[str] = None
    released_at: Optional[datetime] = None
    released_to_photo_url: Optional[str] = None

class ItemRelease(BaseModel):
    released_to_id: int
    released_by_name: str

class ItemDirectRelease(BaseModel):
    released_to_name: str
    released_to_id_number: str
    released_by_name: str
    released_to_photo_url: Optional[str] = None

class CustodyUpdate(BaseModel):
    notes: Optional[str] = None

# Lost Item Schemas
class LostItemBase(BaseModel):
    item_name: str
    category: Optional[str] = None
    description: str
    location_zone: str
    last_seen_time: Optional[datetime] = None
    safe_photo_url: Optional[str] = None

class LostItemCreate(LostItemBase):
    guest_full_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None


class LostItemResponse(LostItemBase):
    id: int
    status: str
    user_id: Optional[int] = None
    guest_full_name: Optional[str] = None
    guest_email: Optional[str] = None
    tracking_id: Optional[str] = None
    embedding: Optional[str] = None
    admin_notes: Optional[str] = None

    class Config:
        from_attributes = True

class LostItemPublic(BaseModel):
    id: int
    item_name: str
    category: Optional[str] = None
    description: str
    location_zone: str
    last_seen_time: Optional[datetime] = None
    status: str
    user_id: Optional[int] = None
    guest_full_name: Optional[str] = None
    guest_email: Optional[str] = None
    tracking_id: Optional[str] = None
    safe_photo_url: Optional[str] = None
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    admin_notes: Optional[str] = None

    class Config:
        from_attributes = True

class LostItemUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class MatchSuggestion(BaseModel):
    item: FoundItemPublic
    similarity_score: float

class AdminMatchSuggestion(BaseModel):
    item: LostItemPublic
    similarity_score: float

class GlobalMatchGroup(BaseModel):
    found_item: FoundItemDetail
    top_matches: list[AdminMatchSuggestion]
    max_score: float

# Claim Schemas
class ClaimCreate(BaseModel):
    found_item_id: int
    proof_description: str
    proof_photo_url: Optional[str] = None
    guest_full_name: Optional[str] = None
    guest_email: Optional[str] = None
    contact_method: Optional[str] = None
    contact_info: Optional[str] = None
    course_department: Optional[str] = None

class ClaimResponse(BaseModel):
    id: int
    found_item_id: int
    student_id: Optional[int] = None
    guest_email: Optional[str] = None
    contact_method: Optional[str] = None
    contact_info: Optional[str] = None
    course_department: Optional[str] = None
    tracking_id: Optional[str] = None
    proof_description: str
    proof_photo_url: Optional[str] = None
    status: str
    found_item_private_notes: Optional[str] = None
    found_item_category: Optional[str] = None
    found_item_description: Optional[str] = None
    admin_notes: Optional[str] = None
    similarity_score: Optional[float] = None  # AI context for admins
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime
    found_item_id: Optional[int] = None
    lost_item_id: Optional[int] = None

    class Config:
        from_attributes = True

class NotificationReadUpdate(BaseModel):
    is_read: bool

class MatchRequest(BaseModel):
    found_item_id: int
    lost_item_id: int

class ClaimReview(BaseModel):
    status: str  # approved or rejected
    admin_notes: Optional[str] = None

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    item_id: Optional[int]
    claim_id: Optional[int]
    admin_id: int
    action_type: str
    notes: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

# Witness Report Schemas
class WitnessReportCreate(BaseModel):
    witness_description: str
    witness_photo_url: Optional[str] = None
    is_anonymous: bool = False
    guest_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None

class WitnessReportResponse(BaseModel):
    id: int
    lost_item_id: int
    reporter_id: Optional[int] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    witness_description: str
    witness_photo_url: Optional[str] = None
    is_anonymous: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class WitnessReportStatusUpdate(BaseModel):
    status: str # approved or dismissed
