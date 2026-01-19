from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"
    student_id_number: Optional[str] = None
    verification_proof_url: Optional[str] = None

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_verified: bool
    student_id_number: Optional[str] = None
    verification_proof_url: Optional[str] = None

    class Config:
        from_attributes = True

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
    category: str
    description: str
    location_zone: str
    found_time: Optional[datetime] = None
    safe_photo_url: Optional[str] = None

class FoundItemCreate(FoundItemBase):
    private_admin_notes: str

class FoundItemPublic(FoundItemBase):
    id: int
    status: str

    class Config:
        from_attributes = True

class FoundItemDetail(FoundItemPublic):
    private_admin_notes: str
    finder_id: int
    embedding: Optional[str] = None
    released_to_id: Optional[int] = None
    released_by_name: Optional[str] = None
    released_at: Optional[datetime] = None

class ItemRelease(BaseModel):
    released_to_id: int
    released_by_name: str

class CustodyUpdate(BaseModel):
    notes: Optional[str] = None

# Lost Item Schemas
class LostItemBase(BaseModel):
    category: str
    description: str
    location_zone: str
    last_seen_time: Optional[datetime] = None

class LostItemCreate(LostItemBase):
    private_proof_details: str

class LostItemResponse(LostItemBase):
    id: int
    status: str
    user_id: int
    embedding: Optional[str] = None

    class Config:
        from_attributes = True

class LostItemPublic(BaseModel):
    id: int
    category: str
    description: str
    location_zone: str
    last_seen_time: Optional[datetime] = None
    private_proof_details: str
    status: str
    user_id: int

    class Config:
        from_attributes = True

class MatchSuggestion(BaseModel):
    item: FoundItemPublic
    similarity_score: float

class AdminMatchSuggestion(BaseModel):
    item: LostItemPublic
    similarity_score: float

class GlobalMatchGroup(BaseModel):
    found_item: FoundItemPublic
    top_matches: list[AdminMatchSuggestion]
    max_score: float

# Claim Schemas
class ClaimCreate(BaseModel):
    found_item_id: int
    proof_description: str
    proof_photo_url: Optional[str] = None

class ClaimResponse(BaseModel):
    id: int
    found_item_id: int
    student_id: int
    proof_description: str
    proof_photo_url: Optional[str] = None
    status: str
    found_item_private_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    similarity_score: Optional[float] = None  # AI context for admins
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
