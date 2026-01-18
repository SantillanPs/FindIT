from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_verified: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

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

class MatchSuggestion(BaseModel):
    item: FoundItemPublic
    similarity_score: float

# Claim Schemas
class ClaimCreate(BaseModel):
    found_item_id: int
    proof_description: str

class ClaimResponse(BaseModel):
    id: int
    found_item_id: int
    student_id: int
    proof_description: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ClaimReview(BaseModel):
    status: str  # approved or rejected
    admin_notes: Optional[str] = None
