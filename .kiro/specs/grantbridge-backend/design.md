# GrantBridge Backend — Technical Planning Document

**Version:** 1.0 (MVP)
**Stack:** Django + Django REST Framework, PostgreSQL
**Target Build Window:** 5 weeks
**Prepared for:** Senior Backend Engineering Review

---

## 1. System Overview

### Backend Responsibilities

The GrantBridge backend is the authoritative layer for all business logic, data persistence, identity verification, fraud detection, and API exposure. The frontend and mobile clients are thin consumers of the REST API — no business logic lives on the client.

Core responsibilities:

- User registration, authentication, and role enforcement
- Project lifecycle management (submission → review → live → funded)
- Identity verification (NIN + CAC document handling)
- Transaction recording and fund tracking
- Controlled disbursement with full audit trail
- Trust score computation
- Fraud detection and flagging
- Asynchronous email notifications

### Key Backend Goals

| Goal | Description |
|---|---|
| Scalability | Stateless JWT auth, paginated APIs, indexed queries — ready for horizontal scaling post-MVP |
| Security | Hashed OTPs, UUID PKs, role-based access, no plaintext secrets, input validation on all endpoints |
| Simplicity | MVP-scoped. No over-engineering. Mock payment, manual NIN/CAC review, no async queues beyond email |
| Trust & Fraud Prevention | NIN uniqueness enforcement, one-project-per-entrepreneur limit, automated fraud flags, admin approval gate |

---

## 2. Database Schema Design

### Design Principles

- UUID primary keys on all core tables (prevents enumeration attacks)
- All monetary values stored as integers (smallest currency unit, e.g. kobo) to avoid floating-point errors
- All timestamps stored in UTC
- Foreign key constraints enforced at the database level
- Soft deletes via `is_active` flags where applicable

---

### Core Tables

#### users

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| phone_number | VARCHAR(20) | NOT NULL |
| role | ENUM('entrepreneur', 'funder', 'admin') | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_suspended | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL |

Indexes: `email` (unique), `role`

---

#### entrepreneur_profiles

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE, NOT NULL |
| nin | VARCHAR(11) | UNIQUE, NOT NULL |
| cac_document_url | VARCHAR(500) | NOT NULL |
| nin_document_url | VARCHAR(500) | NOT NULL |
| verification_status | ENUM('unverified', 'pending', 'verified', 'rejected') | DEFAULT 'unverified' |
| trust_score | INTEGER | DEFAULT 0, CHECK (0–100) |
| verified_by | UUID | FK → users.id (Admin), NULLABLE |
| verified_at | TIMESTAMPTZ | NULLABLE |

Indexes: `user_id`, `nin` (unique), `verification_status`

Relationship: 1:1 with users

---

#### otp_verifications

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| otp_hash | VARCHAR(255) | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| attempt_count | INTEGER | DEFAULT 0 |
| is_used | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Indexes: `user_id`, `expires_at`

---

#### projects

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| entrepreneur_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| funding_goal | BIGINT | NOT NULL, CHECK > 0 |
| amount_raised | BIGINT | DEFAULT 0 |
| funding_breakdown | JSONB | NOT NULL |
| pitch_video_url | VARCHAR(500) | NOT NULL |
| target_completion_date | DATE | NOT NULL |
| status | ENUM('pending', 'approved', 'live', 'funded', 'rejected', 'closed') | DEFAULT 'pending' |
| reviewed_by | UUID | FK → users.id (Admin), NULLABLE |
| reviewed_at | TIMESTAMPTZ | NULLABLE |
| rejection_reason | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL |

Indexes: `entrepreneur_id`, `status`, `created_at`

Relationship: N:1 with users (entrepreneur)

---

#### transactions

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| project_id | UUID | FK → projects.id, NOT NULL |
| funder_id | UUID | FK → users.id, NOT NULL |
| amount | BIGINT | NOT NULL, CHECK > 0 |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'NGN' |
| payment_reference | VARCHAR(255) | UNIQUE, NOT NULL |
| status | ENUM('pending', 'completed', 'failed', 'refunded') | DEFAULT 'pending' |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Indexes: `project_id`, `funder_id`, `status`, `payment_reference` (unique)

Relationship: N:1 with projects, N:1 with users (funder)

---

#### disbursements

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| project_id | UUID | FK → projects.id, NOT NULL |
| initiated_by | UUID | FK → users.id (Admin), NOT NULL |
| amount | BIGINT | NOT NULL, CHECK > 0 |
| status | ENUM('pending', 'completed', 'failed') | DEFAULT 'pending' |
| notes | TEXT | NULLABLE |
| disbursed_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Indexes: `project_id`, `initiated_by`, `status`

Relationship: N:1 with projects

---

#### project_updates

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| project_id | UUID | FK → projects.id, NOT NULL |
| posted_by | UUID | FK → users.id (Entrepreneur), NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Indexes: `project_id`, `posted_by`

---

#### fraud_flags

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| flagged_user_id | UUID | FK → users.id, NULLABLE |
| flagged_project_id | UUID | FK → projects.id, NULLABLE |
| flag_type | ENUM('duplicate_nin', 'rapid_submission', 'goal_modification', 'manual') | NOT NULL |
| description | TEXT | NOT NULL |
| status | ENUM('open', 'resolved', 'dismissed') | DEFAULT 'open' |
| created_by | UUID | FK → users.id (Admin or System), NULLABLE |
| resolved_by | UUID | FK → users.id (Admin), NULLABLE |
| resolved_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Indexes: `flagged_user_id`, `flagged_project_id`, `status`

---

### Entity Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| users → entrepreneur_profiles | 1:1 | Each entrepreneur has one profile |
| users → projects | 1:N | One entrepreneur can have multiple projects (one active at a time) |
| projects → transactions | 1:N | One project can have many funding transactions |
| projects → disbursements | 1:N | One project can have multiple disbursement installments |
| projects → project_updates | 1:N | One project can have many updates |
| users → fraud_flags | 1:N | One user can have multiple fraud flags |
| projects → fraud_flags | 1:N | One project can have multiple fraud flags |

---

### Data Integrity Considerations

- The one-active-project-per-entrepreneur constraint is enforced at the application layer in the Project_Service before insert, not as a DB constraint, to allow for clear error messaging.
- `funding_breakdown` is stored as JSONB to allow flexible line-item structures while keeping the schema stable. Validation of breakdown sum vs. funding_goal is enforced at the API layer.
- `amount_raised` on projects is updated atomically within the same database transaction as the transaction record insert to prevent race conditions.
- Fraud flag records are append-only. Only `status`, `resolved_by`, and `resolved_at` fields are mutable after creation.

---

## 3. Platform Differentiation Features

These features are not incidental — they are the core trust infrastructure that differentiates GrantBridge from generic crowdfunding platforms in the African market.

### 3.1 Mandatory 5-Minute Pitch Video

Every project submission requires a pitch video URL. The video is surfaced prominently on the project detail page.

- Trust impact: Funders can assess the entrepreneur's communication, confidence, and authenticity — signals that text alone cannot convey.
- Fraud prevention: Video submissions raise the effort cost of fraudulent projects. Bad actors are less likely to invest in video production.
- Competitive advantage: Most African crowdfunding platforms rely on text and images. Video-first pitches create a higher-quality, more engaging marketplace.

Implementation: The backend stores a validated URL. Video hosting is handled by an external provider (e.g. Cloudinary, YouTube). The backend does not process video files directly in MVP.

---

### 3.2 Identity Verification: Phone Number, NIN, CAC Document Upload

Entrepreneurs must provide a phone number at registration, and submit NIN + CAC documents before a project can be reviewed.

- Trust impact: Verified identity signals to Funders that the entrepreneur is a real, traceable individual or registered business.
- Fraud prevention: NIN uniqueness enforcement (one NIN per account) prevents duplicate account creation. CAC documents confirm business legitimacy.
- Competitive advantage: Most platforms in the region do not enforce identity verification at this depth. GrantBridge's verification gate is a meaningful trust signal.

Implementation: Documents are uploaded to secure file storage. Admins review documents manually during project review. Verification status is stored on the entrepreneur_profiles table and factored into the trust score.

---

### 3.3 Structured Funding Breakdown (JSONB)

Entrepreneurs must provide a line-item breakdown of how the funding goal will be spent (e.g. equipment, salaries, logistics). The breakdown is stored as JSONB and validated to sum to the funding goal.

- Trust impact: Funders can see exactly how their money will be used, reducing information asymmetry.
- Fraud prevention: Vague or implausible breakdowns can be flagged during admin review. The structured format makes inconsistencies easier to detect.
- Competitive advantage: Structured breakdowns enable future features such as milestone-based disbursement and AI-assisted plausibility scoring.

---

### 3.4 Trust Score System

A numeric score (0–100) is computed per Entrepreneur and displayed on every project card and detail page.

| Signal | Effect on Score |
|---|---|
| Identity verified | +30 points |
| Each successfully funded project | +15 points |
| Each post-funding update posted | +2 points (capped at +20) |
| Each unresolved fraud flag | -25 points |

- Trust impact: Funders have a quick, scannable signal of entrepreneur credibility without reading every detail.
- Fraud prevention: Fraud flags directly reduce the score, making flagged entrepreneurs less fundable.
- Competitive advantage: A visible, dynamic trust score creates a reputation economy that incentivizes good behaviour.

---

### 3.5 One Active Project Per Entrepreneur

An entrepreneur may only have one project in pending, approved, or live status at any time.

- Trust impact: Prevents entrepreneurs from running multiple simultaneous campaigns that dilute accountability.
- Fraud prevention: Limits the blast radius of a fraudulent actor — they cannot flood the platform with fake projects.
- Competitive advantage: Encourages entrepreneurs to focus and deliver before launching a new campaign, improving overall project quality.

---

### 3.6 Post-Funding Updates

Entrepreneurs are expected to post progress updates after their project is funded. Funders who contributed receive email notifications for each update.

- Trust impact: Ongoing updates demonstrate accountability and build long-term funder confidence.
- Fraud prevention: Absence of updates after funding is a detectable signal that can trigger admin review.
- Competitive advantage: Creates an ongoing relationship between entrepreneurs and funders, increasing platform stickiness and repeat funding.

---

### 3.7 Admin Approval Workflow

No project goes live without explicit Admin approval. Admins review the pitch video, identity documents, and funding breakdown before approving.

- Trust impact: The admin gate is a human quality filter that prevents low-quality or suspicious projects from reaching funders.
- Fraud prevention: Admins can cross-reference NIN and CAC documents, review the pitch video, and flag inconsistencies before any funds are at risk.
- Competitive advantage: A curated marketplace of verified projects is a stronger trust signal than an open, unmoderated platform.

---

## 4. API Structure

### Design Principles

- RESTful resource-oriented URLs
- JSON request and response bodies throughout
- JWT Bearer token authentication on all protected endpoints
- Consistent error response envelope: `{ "status": <int>, "error_code": <string>, "message": <string> }`
- Consistent paginated list envelope: `{ "count": <int>, "next": <url|null>, "previous": <url|null>, "results": [...] }`
- API versioning via URL prefix: `/api/v1/`

---

### 4.1 Authentication Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/register/` | POST | Register a new user |
| `/api/v1/auth/request-otp/` | POST | Request an OTP for login |
| `/api/v1/auth/verify-otp/` | POST | Submit OTP and receive JWT tokens |
| `/api/v1/auth/token/refresh/` | POST | Refresh an expired access token |
| `/api/v1/auth/logout/` | POST | Invalidate active tokens |

**POST /api/v1/auth/register/**
- Request: `{ email, password, full_name, phone_number, role }`
- Response 201: `{ id, email, role, created_at }`
- Response 400: Validation errors | 409: Email already exists

**POST /api/v1/auth/request-otp/**
- Request: `{ email }`
- Response 200: `{ message: "OTP sent to email" }`
- Response 404: User not found

**POST /api/v1/auth/verify-otp/**
- Request: `{ email, otp }`
- Response 200: `{ access_token, refresh_token, user: { id, email, role } }`
- Response 401: Invalid or expired OTP | 429: Too many attempts

**POST /api/v1/auth/token/refresh/**
- Request: `{ refresh_token }`
- Response 200: `{ access_token }`
- Response 401: Invalid or expired refresh token

**POST /api/v1/auth/logout/**
- Auth: Required
- Request: `{ refresh_token }`
- Response 204: No content

---

### 4.2 User / Profile Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/users/me/` | GET | Get current user profile | Any authenticated |
| `/api/v1/users/me/` | PATCH | Update current user profile | Any authenticated |
| `/api/v1/users/me/entrepreneur-profile/` | GET | Get entrepreneur profile + verification status | Entrepreneur |
| `/api/v1/users/me/entrepreneur-profile/` | PUT | Submit/update NIN and CAC documents | Entrepreneur |

**GET /api/v1/users/me/**
- Response 200: `{ id, email, full_name, phone_number, role, is_active, created_at }`

**PUT /api/v1/users/me/entrepreneur-profile/**
- Request: `{ nin, nin_document (file), cac_document (file) }` (multipart/form-data)
- Response 200: `{ verification_status, nin, nin_document_url, cac_document_url }`
- Response 400: Invalid file type or size

---

### 4.3 Project Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/projects/` | GET | List live projects (paginated, filterable) | Funder, Admin |
| `/api/v1/projects/` | POST | Submit a new project | Entrepreneur |
| `/api/v1/projects/{id}/` | GET | Get project detail | Any authenticated |
| `/api/v1/projects/{id}/` | PATCH | Update project (pre-approval only) | Entrepreneur (owner) |
| `/api/v1/projects/my/` | GET | List entrepreneur's own projects | Entrepreneur |
| `/api/v1/projects/{id}/updates/` | GET | List updates for a project | Any authenticated |
| `/api/v1/projects/{id}/updates/` | POST | Post a new update | Entrepreneur (owner) |

**POST /api/v1/projects/**
- Request: `{ title, description, funding_goal, funding_breakdown, pitch_video_url, target_completion_date }`
- Response 201: `{ id, title, status, created_at }`
- Response 400: Validation errors | 409: Active project already exists

**GET /api/v1/projects/**
- Query params: `?status=live&min_goal=&max_goal=&ordering=created_at|-amount_raised`
- Response 200: Paginated list of project summaries including trust_score

**POST /api/v1/projects/{id}/updates/**
- Request: `{ content }`
- Response 201: `{ id, content, created_at }`
- Response 403: Not project owner

---

### 4.4 Admin Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/admin/projects/` | GET | List all projects with any status | Admin |
| `/api/v1/admin/projects/{id}/approve/` | POST | Approve a pending project | Admin |
| `/api/v1/admin/projects/{id}/reject/` | POST | Reject a pending project | Admin |
| `/api/v1/admin/projects/{id}/flag/` | POST | Flag a project for fraud | Admin |
| `/api/v1/admin/users/` | GET | List all users | Admin |
| `/api/v1/admin/users/{id}/suspend/` | POST | Suspend a user account | Admin |
| `/api/v1/admin/fraud-flags/` | GET | List all fraud flags | Admin |
| `/api/v1/admin/fraud-flags/{id}/resolve/` | POST | Resolve a fraud flag | Admin |

**POST /api/v1/admin/projects/{id}/reject/**
- Request: `{ rejection_reason }`
- Response 200: `{ id, status, rejection_reason, reviewed_by, reviewed_at }`

**POST /api/v1/admin/fraud-flags/{id}/resolve/**
- Request: `{ resolution_notes }`
- Response 200: `{ id, status, resolved_by, resolved_at }`

---

### 4.5 Transaction Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/transactions/` | POST | Create a funding transaction | Funder |
| `/api/v1/transactions/` | GET | List funder's own transactions | Funder |
| `/api/v1/transactions/{id}/` | GET | Get transaction detail | Funder (owner), Admin |
| `/api/v1/admin/transactions/` | GET | List all transactions | Admin |

**POST /api/v1/transactions/**
- Request: `{ project_id, amount, currency }`
- Response 201: `{ id, project_id, amount, currency, payment_reference, status, created_at }`
- Response 400: Project not live, amount below minimum | 404: Project not found

---

### 4.6 Disbursement Endpoints

| Endpoint | Method | Purpose | Auth |
|---|---|---|---|
| `/api/v1/admin/disbursements/` | POST | Initiate a disbursement | Admin |
| `/api/v1/admin/disbursements/` | GET | List all disbursements | Admin |
| `/api/v1/admin/disbursements/{id}/` | GET | Get disbursement detail | Admin |
| `/api/v1/projects/{id}/disbursements/` | GET | List disbursements for a project | Entrepreneur (owner), Admin |

**POST /api/v1/admin/disbursements/**
- Request: `{ project_id, amount, notes }`
- Response 201: `{ id, project_id, amount, status, initiated_by, created_at }`
- Response 400: Amount exceeds available funds | 404: Project not found

---

### 4.7 Authentication Strategy

- JWT access tokens with 60-minute expiry
- JWT refresh tokens with 7-day expiry, stored server-side for revocation support
- OTP hashed with bcrypt before storage, never logged or returned in responses
- Role claim embedded in JWT payload, validated on every protected request by DRF permission classes
- All endpoints served over HTTPS only

---

## 5. Core Services (Business Logic Architecture)

Each service is a Python module within the Django application layer. Services are called by DRF views and do not contain HTTP-specific logic. This separation keeps views thin and business logic testable.

---

### 5.1 Auth Service

Responsibilities:
- User registration and password hashing
- OTP generation, hashing, and expiry management
- JWT issuance and refresh token management
- Token invalidation on logout
- OTP attempt tracking and session locking

Inputs: Registration data, login credentials, OTP submissions, refresh tokens
Outputs: JWT token pairs, user objects, success/error signals

Interactions:
- Calls Notification_Service to dispatch OTP emails
- Reads/writes users and otp_verifications tables

---

### 5.2 Project Service

Responsibilities:
- Project submission with validation (one-active-project check, breakdown sum check)
- Project status transitions (pending → approved/rejected → live → funded)
- Project detail assembly (includes trust score, update count, amount raised)
- Update creation and ownership enforcement
- Paginated project listing with filtering and sorting

Inputs: Project submission data, status change commands, update content
Outputs: Project objects, update objects, paginated lists

Interactions:
- Calls Fraud_Service on project submission to check for rapid submission patterns
- Calls Notification_Service on status changes and new updates
- Reads entrepreneur_profiles to validate verification status before submission

---

### 5.3 Transaction Service

Responsibilities:
- Transaction creation with project status validation
- Atomic update of project.amount_raised on transaction completion
- Payment reference generation (mock gateway integration)
- Transaction status management

Inputs: Funder ID, project ID, amount, currency
Outputs: Transaction objects, updated project amount_raised

Interactions:
- Reads projects table to validate project status before creating transaction
- Calls Notification_Service on transaction completion
- Calls Fraud_Service if anomalous transaction patterns are detected (Phase 2)

---

### 5.4 Disbursement Service

Responsibilities:
- Disbursement initiation with available funds validation
- Partial disbursement support
- Disbursement audit trail maintenance
- Available funds calculation (sum of completed transactions minus sum of completed disbursements)

Inputs: Admin ID, project ID, disbursement amount, notes
Outputs: Disbursement objects, available funds balance

Interactions:
- Reads transactions table to compute available funds
- Reads disbursements table to compute already-disbursed total
- Calls Notification_Service on disbursement completion

---

### 5.5 Fraud Service

Responsibilities:
- Automated fraud flag creation based on rule triggers
- Manual fraud flag creation by Admins
- Fraud flag status management (open → resolved/dismissed)
- Account suspension trigger when unresolved flag threshold is reached
- Trust score recalculation trigger on flag creation/resolution

Automated Rules:
- Rapid submission: >3 project submissions from one user within 24 hours
- Duplicate NIN: NIN already associated with another account
- Goal modification: Project funding_goal changed after status = approved

Inputs: Event signals from other services, Admin commands
Outputs: Fraud_Flag objects, suspension signals, trust score recalculation triggers

Interactions:
- Called by Project_Service and Verification_Service on relevant events
- Calls Notification_Service to alert Admins on new flags
- Calls Trust Score computation on flag creation/resolution

---

### 5.6 Verification Service

Responsibilities:
- Document upload handling (file type and size validation)
- Secure document storage (delegates to file storage provider)
- NIN uniqueness enforcement
- Verification status management
- Document URL association with entrepreneur_profiles

Inputs: Entrepreneur ID, NIN string, document files
Outputs: Document URLs, verification status updates

Interactions:
- Writes to entrepreneur_profiles table
- Calls Fraud_Service on duplicate NIN detection
- Called by Project_Service to confirm verification status before project submission

---

### 5.7 Trust Score Service

Responsibilities:
- Trust score computation based on defined signal weights
- Score recalculation triggered by verification, funding, update, and fraud events
- Score clamping to 0–100 range

Score Computation Logic:

| Signal | Points |
|---|---|
| Identity verified | +30 |
| Per successfully funded project | +15 |
| Per post-funding update (max 10 updates counted) | +2 each |
| Per unresolved fraud flag | -25 |

Inputs: Entrepreneur ID, trigger event type
Outputs: Updated trust_score on entrepreneur_profiles

Interactions:
- Reads entrepreneur_profiles, projects, project_updates, fraud_flags
- Writes updated trust_score to entrepreneur_profiles
- Called by Fraud_Service, Project_Service, and Verification_Service

---

### 5.8 Notification Service

Responsibilities:
- Asynchronous email dispatch via SMTP
- Retry logic with exponential backoff (up to 3 retries)
- Notification logging (recipient, event type, status, timestamp)
- Email template rendering per event type

Supported Events:
- account_registered, otp_sent, project_approved, project_rejected, transaction_confirmed, disbursement_completed, update_posted, fraud_flag_created

Inputs: Event type, recipient email(s), context data for template rendering
Outputs: Delivery status, notification log records

Interactions:
- Called by all other services as a fire-and-forget async call
- Does not block the primary API response path
- MVP implementation: Django's built-in email backend with SMTP; async via Django's background task support or a simple thread pool

---

## 6. System Architecture Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│         Web Frontend (React/Next.js)  |  Mobile (Phase 2)       │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / JSON
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (DRF)                           │
│                                                                 │
│  /api/v1/auth/    /api/v1/projects/    /api/v1/transactions/    │
│  /api/v1/users/   /api/v1/admin/       /api/v1/disbursements/   │
│                                                                 │
│  JWT Middleware → Role Permission Classes → DRF Views           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ Python function calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                               │
│                                                                 │
│  Auth_Service      Project_Service     Transaction_Service      │
│  Verification_Service  Disbursement_Service  Fraud_Service      │
│  Trust_Score_Service   Notification_Service                     │
│                                                                 │
└──────┬──────────────────────┬──────────────────────────────────┘
       │ Django ORM            │ Async email dispatch
       ▼                       ▼
┌──────────────────┐   ┌──────────────────────────────────────────┐
│   PostgreSQL     │   │           EXTERNAL SERVICES              │
│                  │   │                                          │
│  users           │   │  SMTP Provider (email notifications)     │
│  entrepreneur_   │   │  File Storage (NIN/CAC documents,        │
│    profiles      │   │    Cloudinary or S3-compatible)          │
│  otp_            │   │  Mock Payment Gateway (transaction refs) │
│    verifications │   │                                          │
│  projects        │   └──────────────────────────────────────────┘
│  transactions    │
│  disbursements   │
│  project_updates │
│  fraud_flags     │
└──────────────────┘
```

### Request Flow (Example: Funder funds a project)

1. Funder sends POST `/api/v1/transactions/` with Bearer token
2. JWT Middleware validates token, extracts user ID and role
3. Role Permission Class confirms role = funder
4. DRF View calls Transaction_Service.create_transaction(funder_id, project_id, amount)
5. Transaction_Service reads projects table — confirms status = live
6. Transaction_Service calls mock payment gateway — receives payment_reference
7. Transaction_Service writes transaction record and atomically updates project.amount_raised
8. Transaction_Service calls Notification_Service.send(event=transaction_confirmed, ...)
9. Notification_Service dispatches emails asynchronously (non-blocking)
10. DRF View returns 201 response to client

### Separation of Concerns

| Layer | Responsibility |
|---|---|
| Views (DRF) | HTTP parsing, input deserialization, response serialization, permission checks |
| Services | Business logic, validation rules, cross-service orchestration |
| Models (Django ORM) | Data access, schema definition, query execution |
| External Services | Email delivery, file storage, payment processing |

---

## 7. Key Technical Decisions

### Django + Django REST Framework

Decision: Use Django as the application framework with DRF for API exposure.

Rationale: Django's batteries-included approach (ORM, migrations, admin panel, auth) reduces boilerplate significantly for a 5-week MVP. DRF provides serializers, viewsets, and permission classes that map directly to the required API structure. The Django admin panel provides a free, functional admin interface for project review and user management with minimal custom code.

Trade-off: Django is synchronous by default. For MVP scale this is acceptable. Async views (Django 4.1+) or a task queue (Celery) can be introduced in Phase 2 for high-concurrency workloads.

---

### PostgreSQL

Decision: Use PostgreSQL as the primary database.

Rationale: JSONB support for funding_breakdown, strong ACID guarantees for atomic transaction + amount_raised updates, mature Django ORM support, and proven scalability. UUID primary keys and partial indexes are well-supported.

Trade-off: Slightly more operational overhead than SQLite for local development, but this is negligible and avoids a database migration later.

---

### Email OTP Instead of SMS

Decision: Use email-based OTP for authentication instead of SMS.

Rationale: SMS gateway costs in African markets are significant and introduce third-party dependencies (Twilio, Termii). Email OTP eliminates this cost for MVP, is sufficient for a web-first platform, and avoids phone number portability issues.

Trade-off: Email OTP is slightly less immediate than SMS. Users must have reliable email access. SMS OTP can be added in Phase 2 as an optional second factor.

---

### Mock Payment System

Decision: Integrate a mock payment gateway for MVP rather than a live payment processor.

Rationale: Integrating a live payment gateway (Paystack, Flutterwave) requires business registration, compliance review, and testing overhead that is out of scope for a 5-week MVP. The mock gateway generates realistic payment_reference IDs and records transactions in the same schema that a live integration will use, making the migration straightforward.

Trade-off: No real money moves in MVP. This is intentional — the MVP validates the product loop and trust infrastructure before financial risk is introduced.

Future plan: Replace the mock gateway adapter with a Paystack or Flutterwave adapter. The Transaction_Service interface does not change.

---

### Admin Approval Workflow

Decision: All projects require explicit Admin approval before going live.

Rationale: An open, unmoderated marketplace would immediately attract fraudulent projects and destroy funder trust. The admin gate is the primary fraud prevention mechanism for MVP, before automated scoring is available.

Trade-off: Admin review creates a bottleneck. This is acceptable at MVP scale. In Phase 2, automated pre-screening (AI scoring, document verification APIs) can reduce the admin review burden.

---

### NIN/CAC Verification (Manual Review)

Decision: NIN and CAC documents are uploaded and reviewed manually by Admins in MVP.

Rationale: Automated NIN verification APIs (NIMC) require government partnerships and compliance overhead. Manual review is sufficient for MVP volume and provides a higher-quality check than automated systems alone.

Trade-off: Does not scale beyond ~50 projects/week without additional admin capacity. Phase 2 will integrate NIMC API for automated NIN validation.

---

### Separation of Transactions and Disbursements

Decision: Transactions (funder → platform) and Disbursements (platform → entrepreneur) are separate tables and services.

Rationale: This separation is critical for financial integrity. It allows the platform to hold funds in escrow, disburse in installments, handle refunds, and maintain a complete audit trail. Conflating the two would make reconciliation and fraud investigation significantly harder.

Trade-off: Slightly more complex than a single "payment" table, but this complexity is essential and pays dividends immediately in auditability.

---

### UUID Primary Keys

Decision: All core tables use UUID primary keys.

Rationale: Sequential integer IDs expose record counts and enable enumeration attacks (e.g. a bad actor iterating project IDs to scrape all projects). UUIDs prevent this with negligible performance cost at MVP scale.

---

## 8. Security & Fraud Prevention

### OTP Security

- OTPs are 6-digit numeric codes generated using a cryptographically secure random number generator
- OTPs are hashed with bcrypt before storage — the plaintext OTP is never persisted
- OTP expiry is enforced at 10 minutes from generation
- Failed OTP attempts are counted per session; 5 consecutive failures lock the session
- A new OTP request invalidates all previous unexpired OTPs for that user
- OTPs are never returned in API responses or logged in application logs

### Authentication and Authorization

- JWT access tokens expire after 60 minutes; refresh tokens expire after 7 days
- Refresh tokens are stored server-side (in the database or cache) to support revocation on logout
- Role claims in JWT are validated on every protected request — a role change takes effect on next token refresh
- All admin endpoints require both valid JWT and role = admin; a compromised funder token cannot access admin routes
- Password hashing uses Django's default PBKDF2-SHA256 with a per-user salt

### Fraud Detection Layers

| Layer | Mechanism |
|---|---|
| Identity | NIN uniqueness enforcement — one NIN per account |
| Submission | One active project per entrepreneur at any time |
| Automated flags | Rapid submission (>3 projects/24h), duplicate NIN, post-approval goal modification |
| Manual flags | Admins can flag any project or user at any time |
| Account suspension | Automatic suspension at 2+ unresolved fraud flags |
| Trust score | Fraud flags reduce trust score, making flagged entrepreneurs less fundable |
| Admin gate | No project reaches funders without human review |

### Data Protection

- All document uploads (NIN, CAC) stored in private, access-controlled file storage — not publicly accessible URLs
- Document URLs are pre-signed or proxied through the backend — never exposed directly to clients
- Monetary values stored as integers to prevent floating-point manipulation
- All API inputs validated and sanitized by DRF serializers before reaching service layer
- Database credentials, JWT secrets, and SMTP credentials stored in environment variables — never in source code
- HTTPS enforced for all client-server communication
- Django's CSRF protection enabled for any session-based endpoints
- SQL injection prevented by exclusive use of Django ORM parameterized queries

---

## 9. MVP Scope Control

### Included in MVP (5-Week Build)

| Feature | Rationale |
|---|---|
| User registration and email OTP auth | Core access control |
| Entrepreneur identity verification (NIN + CAC, manual review) | Trust foundation |
| Project submission with pitch video and funding breakdown | Core product loop |
| Admin review and approval workflow | Fraud prevention gate |
| Live project browsing with filtering and sorting | Funder experience |
| Funding transactions (mock payment) | Core product loop |
| Controlled disbursement with audit trail | Financial integrity |
| Post-funding project updates | Accountability loop |
| Trust score system | Funder confidence signal |
| Automated fraud flagging (3 rules) | Baseline fraud prevention |
| Role-based access control | Security foundation |
| Email notifications for key events | User communication |
| Admin dashboard (Django admin + custom endpoints) | Platform operations |

### Excluded from MVP (Phase 2)

| Feature | Reason for Deferral |
|---|---|
| AI-powered trust scoring | Requires training data and ML infrastructure |
| Automated NIN verification (NIMC API) | Requires government partnership and compliance |
| Advanced escrow (milestone-based disbursement) | Complex financial logic; manual disbursement sufficient for MVP |
| Multi-currency support | Single currency (NGN) sufficient for initial market |
| Mobile applications (iOS/Android) | Web-first MVP; mobile in Phase 2 |
| SMS OTP | Cost and complexity; email OTP sufficient for MVP |
| Live payment gateway (Paystack/Flutterwave) | Requires business compliance; mock sufficient for MVP validation |
| Real-time notifications (WebSocket) | Email sufficient for MVP; real-time in Phase 2 |
| Advanced analytics dashboard | Not required for core product loop |
| Funder portfolio management | Phase 2 funder experience feature |

### 5-Week Build Feasibility

The MVP scope is achievable in 5 weeks for a team of 2–3 backend engineers with the following weekly breakdown:

| Week | Focus |
|---|---|
| Week 1 | Project setup, database schema, auth service (registration, OTP, JWT) |
| Week 2 | Verification service, project submission, admin review endpoints |
| Week 3 | Transaction service, disbursement service, trust score service |
| Week 4 | Fraud service, notification service, role-based access control |
| Week 5 | Integration testing, security hardening, API documentation, deployment |

---

## 10. Engineering Readiness Statement

The GrantBridge backend MVP is designed to be production-ready within 5 weeks. The architecture is deliberately simple: a single Django application, a single PostgreSQL database, and a small set of well-defined services. There are no distributed systems, no message queues, and no microservices — complexity that is not justified at MVP scale.

Every technical decision in this document prioritizes trust, correctness, and speed of delivery over premature optimization. The schema is normalized and indexed for the query patterns the MVP requires. The service boundaries are clean enough to extract into microservices in Phase 2 without a full rewrite. The mock payment gateway and manual verification processes are explicit placeholders with defined upgrade paths.

The system is ready to be built. The requirements are complete, the schema is defined, the API contracts are specified, and the service responsibilities are clear. A senior backend engineer can begin implementation immediately from this document.

---

*Document prepared for GrantBridge MVP — Backend Technical Planning*
*Stack: Django 4.x + Django REST Framework + PostgreSQL*
*Target: Production-ready MVP in 5 weeks*
