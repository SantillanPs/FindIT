# FindIT Backend API Guide

This is the core engine for the FindIT Lost and Found system. It handles user authentication, item reporting, administrative auditing, and AI-driven similarity matching using high-dimensional embeddings.

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Python 3.9+
- Pip (Python Package Manager)

### 2. Installation
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate

# Activate venv (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the Server
```bash
# From the backend directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- **API Base URL**: `http://localhost:8000/api/v1`
- **Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)

---

## 🔐 Authentication & Security

The system uses **JWT (JSON Web Token)** for stateless authentication.

### Login Flow:
- **Endpoint**: `POST /api/v1/auth/login`
- **Payload**: `OAuth2PasswordRequestForm` (username/password)
- **Response**:
  ```json
  {
    "access_token": "eyJhbG...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "student@domain.edu",
      "role": "student",
      "is_verified": true
    }
  }
  ```

### Integration Tip:
Every protected request must include the header:
`Authorization: Bearer <your_access_token>`

---

## 🧠 AI Matching (The Recommendation Layer)

The system uses the `BAAI/bge-m3` model to generate semantic embeddings of item descriptions.

1. **Embedding**: Done automatically on the backend during `POST /found/report` or `POST /lost/report`.
2. **Matching**: `GET /api/v1/lost/{report_id}/matches`
   - Returns a ranked list of `FoundItems`.
   - Each match includes a `similarity_score` (decimal).
   - **Flutter/React Logic**: Map these scores to qualitative labels (**High** >= 0.8, **Medium** >= 0.6, **Low** < 0.6).

---

## 📱 Frontend Integration Guide

### Base Configuration (Axios/Flutter)
Always point your client to the `/api/v1/` prefix.

### Role-Based UI
- **Admins**: Access to `/admin` endpoints (User verification, Claim review).
- **Verified Students**: Can Report and Claim.
- **Unverified Students**: Can only Browse the Public Feed (`GET /found/public`).

### Example: Fetching Public Feed
```javascript
// React
const fetchFeed = async () => {
  const res = await axios.get('http://localhost:8000/api/v1/found/public');
  return res.data;
};
```

---

## 🛡️ Key Administrative Controls
- **Verification**: `PUT /admin/users/{id}/verify` (required for students to act).
- **Custody**: `PUT /admin/found/{id}/custody` (items must be in-custody before they can be claimed).
- **Release**: `POST /admin/found/{id}/release` (captures recipient and staff ID).

---

## 🛠️ Diagnostics
- **Health Check**: `GET /api/v1/health`
- **Database**: SQLite (`findit.db`). You can use `sqlite3` or DB Browser for SQLite to inspect raw data.

---

**FindIT** - *Smart Campus Recovery Engine*
