# GrantBridge Backend — Implementation Tasks

## Week 1: Project Setup, Database Schema, Auth Service

- [ ] 1. Django project scaffolding and environment setup
  - [ ] 1.1 Initialise Django project (`grantbridge`) and core app structure (`apps/auth_service`, `apps/users`, `apps/projects`, `apps/transactions`, `apps/disbursements`, `apps/fraud`, `apps/notifications`, `apps/verification`, `apps/trust_score`)
  - [ ] 1.2 Configure `settings/base.py`, `settings/development.py`, and `settings/production.py` with environment-variable-driven configuration (python-decouple or django-environ)
  - [ ] 1.3 Add `requirements.txt` (or `pyproject.toml`) with pinned dependencies: Django 4.x, djangorestframework, psycopg2-binary, djangorestframework-simplejwt, bcrypt, Pillow, python-decouple, django-storages
  - [ ] 1.4 Configure PostgreSQL database connection via environment variables (`DATABASE_URL`)
  - [ ] 1.5 Set up `.env.example` with all required environment variable keys (no real secrets)
  - [ ] 1.6 Configure Django's `INSTALLED_APPS`, `MIDDLEWARE`, `AUTH_USER_MODEL`, and `DEFAULT_AUTO_FIELD = 'django.db.models.UUIDField'`
  - [ ] 1.7 Configure DRF global settings: `DEFAULT_AUTHENTICATION_CLASSES`, `DEFAULT_PERMISSION_CLASSES`, `DEFAULT_PAGINATION_CLASS`, `PAGE_SIZE`
  - [ ] 1.8 Set up URL routing root (`/api/v1/`) and include app-level URL modules
  - [ ] 1.9 Configure Django's logging to write structured logs to stdout (production-ready)

- [ ] 2. Database schema — models and migrations
  - [ ] 2.1 Implement `CustomUser` model (`users` table): UUID PK, email (unique), password_hash, full_name, phone_number, role (enum: entrepreneur/funder/admin), is_active, is_suspended, created_at, updated_at; add indexes on email and role
  - [ ] 2.2 Implement `EntrepreneurProfile` model (`entrepreneur_profiles` table): UUID PK, user_id (1:1 FK → CustomUser), nin (unique), cac_document_url, nin_document_url, verification_status (enum), trust_score (int 0–100), verified_by (FK → CustomUser, nullable), verified_at; add indexes on user_id, nin, verification_status
  - [ ] 2.3 Implement `OTPVerification` model (`otp_verifications` table): UUID PK, user_id (FK → CustomUser), otp_hash, expires_at, attempt_count, is_used, created_at; add indexes on user_id and expires_at
  - [ ] 2.4 Implement `Project` model (`projects` table): UUID PK, entrepreneur_id (FK → CustomUser), title, description, funding_goal (BigInt), amount_raised (BigInt, default 0), funding_breakdown (JSONField), pitch_video_url, target_completion_date, status (enum), reviewed_by (FK nullable), reviewed_at, rejection_reason, created_at, updated_at; add indexes on entrepreneur_id, status, created_at
  - [ ] 2.5 Implement `Transaction` model (`transactions` table): UUID PK, project_id (FK → Project), funder_id (FK → CustomUser), amount (BigInt), currency (default NGN), payment_reference (unique), status (enum), created_at; add indexes on project_id, funder_id, status, payment_reference
  - [ ] 2.6 Implement `Disbursement` model (`disbursements` table): UUID PK, project_id (FK → Project), initiated_by (FK → CustomUser), amount (BigInt), status (enum), notes, disbursed_at, created_at; add indexes on project_id, initiated_by, status
  - [ ] 2.7 Implement `ProjectUpdate` model (`project_updates` table): UUID PK, project_id (FK → Project), posted_by (FK → CustomUser), content (TextField), created_at; add indexes on project_id and posted_by
  - [ ] 2.8 Implement `FraudFlag` model (`fraud_flags` table): UUID PK, flagged_user_id (FK → CustomUser, nullable), flagged_project_id (FK → Project, nullable), flag_type (enum), description, status (enum, default open), created_by (FK nullable), resolved_by (FK nullable), resolved_at, created_at; add indexes on flagged_user_id, flagged_project_id, status
  - [ ] 2.9 Generate and run all initial migrations; verify schema in PostgreSQL matches design spec
  - [ ] 2.10 Write a `management/commands/seed_admin.py` command to create an initial admin user from environment variables

- [ ] 3. Auth service — registration
  - [ ] 3.1 Implement `RegisterSerializer`: validate email uniqueness (409), required fields (400), role enum, password strength; hash password with Django's PBKDF2-SHA256
  - [ ] 3.2 Implement `RegisterView` (POST `/api/v1/auth/register/`): call serializer, create `CustomUser` with status `unverified`, return 201 `{ id, email, role, created_at }`
  - [ ] 3.3 On successful registration, trigger `Notification_Service.send(event=account_registered, recipient=email)`
  - [ ] 3.4 Write unit tests for registration: success, duplicate email (409), missing fields (400), invalid role

- [ ] 4. Auth service — OTP generation and verification
  - [ ] 4.1 Implement `OTPService.generate_otp(user)`: generate 6-digit code via `secrets.randbelow`, hash with bcrypt, create `OTPVerification` record (expires_at = now + 10 min), invalidate any previous unexpired OTPs for the user
  - [ ] 4.2 Implement `RequestOTPView` (POST `/api/v1/auth/request-otp/`): look up user by email (404 if not found), call `OTPService.generate_otp`, trigger `Notification_Service.send(event=otp_sent, ...)`; return 200 `{ message }`
  - [ ] 4.3 Implement `OTPService.verify_otp(user, otp_plaintext)`: find latest valid (unexpired, unused) OTP record; increment attempt_count; reject if attempt_count ≥ 5 (429); compare bcrypt hash; mark is_used=True on success; return success/failure signal
  - [ ] 4.4 Implement `VerifyOTPView` (POST `/api/v1/auth/verify-otp/`): call `OTPService.verify_otp`; on success issue JWT pair via SimpleJWT and set user is_active=True; return 200 `{ access_token, refresh_token, user }`; on failure return 401 or 429
  - [ ] 4.5 Write unit tests for OTP flow: valid OTP, expired OTP (401), wrong OTP (401), 5th attempt lockout (429), reuse of used OTP

- [ ] 5. Auth service — JWT issuance, refresh, and logout
  - [ ] 5.1 Configure SimpleJWT: access token TTL = 60 min, refresh token TTL = 7 days, embed `role` and `user_id` in token payload via custom `TokenObtainPairSerializer`
  - [ ] 5.2 Implement `TokenRefreshView` (POST `/api/v1/auth/token/refresh/`): accept refresh token, return new access token (401 on invalid/expired)
  - [ ] 5.3 Implement `LogoutView` (POST `/api/v1/auth/logout/`): blacklist the submitted refresh token using SimpleJWT's token blacklist app; return 204
  - [ ] 5.4 Enable `rest_framework_simplejwt.token_blacklist` in INSTALLED_APPS and run its migration
  - [ ] 5.5 Write unit tests for token refresh (valid, expired) and logout (token blacklisted, subsequent refresh rejected)

---

## Week 2: Verification Service, Project Submission, Admin Review

- [ ] 6. User profile endpoints
  - [ ] 6.1 Implement `UserMeSerializer` and `UserMeView` (GET/PATCH `/api/v1/users/me/`): return/update full_name, phone_number; require authentication; return 200
  - [ ] 6.2 Implement `EntrepreneurProfileSerializer` and `EntrepreneurProfileView` (GET/PUT `/api/v1/users/me/entrepreneur-profile/`): restrict to Entrepreneur role (403 otherwise); multipart/form-data for file uploads

- [ ] 7. Verification service — document upload and NIN management
  - [ ] 7.1 Implement `VerificationService.upload_documents(entrepreneur_id, nin, nin_file, cac_file)`: validate file type (PDF/JPG/PNG only, 400 otherwise) and size (≤ 5 MB, 400 otherwise)
  - [ ] 7.2 Implement file storage integration (django-storages with S3-compatible backend or local `MEDIA_ROOT` for development); store documents in a private bucket/directory; save returned URLs to `EntrepreneurProfile`
  - [ ] 7.3 Enforce NIN uniqueness: if NIN already exists on another profile, call `FraudService.create_flag(type=duplicate_nin, ...)` and return 409
  - [ ] 7.4 Set `verification_status = 'pending'` after successful document upload
  - [ ] 7.5 Write unit tests for document upload: valid upload, oversized file (400), unsupported format (400), duplicate NIN (409 + fraud flag created)

- [ ] 8. Project service — submission
  - [ ] 8.1 Implement `ProjectSubmissionSerializer`: validate all required fields (400 on missing), validate `funding_breakdown` sums to `funding_goal` (400 on mismatch), validate `pitch_video_url` is a valid URL
  - [ ] 8.2 Implement `ProjectService.submit_project(entrepreneur_id, data)`: check entrepreneur has no active project (status in pending/approved/live) — return 409 if so; check entrepreneur verification_status = 'pending' or 'verified' (require documents uploaded); create Project with status='pending'; trigger admin notification
  - [ ] 8.3 Implement `ProjectListCreateView` (POST `/api/v1/projects/`): Entrepreneur role only; call `ProjectService.submit_project`; return 201 `{ id, title, status, created_at }`
  - [ ] 8.4 Implement `MyProjectsView` (GET `/api/v1/projects/my/`): return paginated list of the authenticated entrepreneur's own projects
  - [ ] 8.5 Call `FraudService.check_rapid_submission(entrepreneur_id)` on every project submission; create fraud flag if >3 submissions in 24 hours
  - [ ] 8.6 Write unit tests for project submission: success, missing fields (400), breakdown mismatch (400), duplicate active project (409), rapid submission fraud flag

- [ ] 9. Project service — discovery and browsing
  - [ ] 9.1 Implement `ProjectListView` (GET `/api/v1/projects/`): Funder and Admin roles; return paginated list of `live` projects; include trust_score from entrepreneur profile
  - [ ] 9.2 Add filtering: `min_goal`, `max_goal`, `target_completion_date` query params via `django-filter`
  - [ ] 9.3 Add ordering: `created_at`, `amount_raised`, `funding_goal` via DRF `OrderingFilter`
  - [ ] 9.4 Implement `ProjectDetailView` (GET `/api/v1/projects/{id}/`): any authenticated user; return full project detail including trust_score, amount_raised, update count
  - [ ] 9.5 Implement `ProjectUpdateView` (PATCH `/api/v1/projects/{id}/`): Entrepreneur owner only; restrict to pre-approval edits (status = pending); detect and flag goal modification after approval via `FraudService`
  - [ ] 9.6 Write unit tests for project listing: pagination, filtering by goal range, ordering, trust_score included in response

- [ ] 10. Admin review endpoints
  - [ ] 10.1 Implement `AdminProjectListView` (GET `/api/v1/admin/projects/`): Admin role only; return all projects with any status, paginated
  - [ ] 10.2 Implement `AdminProjectApproveView` (POST `/api/v1/admin/projects/{id}/approve/`): Admin only; set status='live', record reviewed_by and reviewed_at; trigger `Notification_Service.send(event=project_approved, recipient=entrepreneur_email)`
  - [ ] 10.3 Implement `AdminProjectRejectView` (POST `/api/v1/admin/projects/{id}/reject/`): Admin only; require `rejection_reason` in body; set status='rejected', record reason, reviewed_by, reviewed_at; trigger `Notification_Service.send(event=project_rejected, ...)`
  - [ ] 10.4 Implement `AdminProjectFlagView` (POST `/api/v1/admin/projects/{id}/flag/`): Admin only; call `FraudService.create_manual_flag(project_id, admin_id, description)`
  - [ ] 10.5 Implement `AdminUserListView` (GET `/api/v1/admin/users/`): Admin only; paginated list of all users
  - [ ] 10.6 Implement `AdminUserSuspendView` (POST `/api/v1/admin/users/{id}/suspend/`): Admin only; set `is_suspended=True` on user; return 200
  - [ ] 10.7 Write unit tests for admin review: approve sets status=live + notification sent, reject requires reason + notification sent, non-admin gets 403

- [ ] 11. Project updates
  - [ ] 11.1 Implement `ProjectUpdateSerializer` and `ProjectUpdateListCreateView` (GET/POST `/api/v1/projects/{id}/updates/`): POST restricted to Entrepreneur owner (403 otherwise); project must be in funded or live status
  - [ ] 11.2 On new update, call `TrustScoreService.recalculate(entrepreneur_id)` and `NotificationService.send(event=update_posted, recipients=[all funders of project])`
  - [ ] 11.3 Write unit tests for updates: owner can post, non-owner gets 403, funders notified, trust score recalculated

---

## Week 3: Transaction Service, Disbursement Service, Trust Score Service

- [ ] 12. Transaction service
  - [ ] 12.1 Implement `MockPaymentGateway.charge(amount, currency)`: generate a unique `payment_reference` (UUID-based), return `{ payment_reference, status: 'completed' }`
  - [ ] 12.2 Implement `TransactionService.create_transaction(funder_id, project_id, amount, currency)`: validate project status = live (400 if not); validate amount ≥ 100 (400 if not); call mock gateway; within a single DB transaction, create `Transaction` record and atomically increment `project.amount_raised` using `F()` expression; if amount_raised ≥ funding_goal, set project status = 'funded'
  - [ ] 12.3 Implement `TransactionListCreateView` (POST/GET `/api/v1/transactions/`): POST for Funder role only; GET returns funder's own transactions paginated
  - [ ] 12.4 Implement `TransactionDetailView` (GET `/api/v1/transactions/{id}/`): Funder (owner) or Admin only
  - [ ] 12.5 Implement `AdminTransactionListView` (GET `/api/v1/admin/transactions/`): Admin only; all transactions paginated
  - [ ] 12.6 On transaction completion, call `NotificationService.send(event=transaction_confirmed, recipients=[funder, entrepreneur])`
  - [ ] 12.7 Write unit tests for transactions: success, project not live (400), amount below minimum (400), amount_raised updated atomically, project transitions to funded when goal met

- [ ] 13. Disbursement service
  - [ ] 13.1 Implement `DisbursementService.get_available_funds(project_id)`: sum of completed transactions minus sum of completed disbursements for the project
  - [ ] 13.2 Implement `DisbursementService.initiate_disbursement(admin_id, project_id, amount, notes)`: call `get_available_funds`; reject if amount > available (400); create `Disbursement` record with status='pending'; set status='completed' and disbursed_at=now (MVP: synchronous); call `NotificationService.send(event=disbursement_completed, recipient=entrepreneur_email)`
  - [ ] 13.3 Implement `AdminDisbursementListCreateView` (POST/GET `/api/v1/admin/disbursements/`): Admin only
  - [ ] 13.4 Implement `AdminDisbursementDetailView` (GET `/api/v1/admin/disbursements/{id}/`): Admin only
  - [ ] 13.5 Implement `ProjectDisbursementListView` (GET `/api/v1/projects/{id}/disbursements/`): Entrepreneur (owner) or Admin only
  - [ ] 13.6 Write unit tests for disbursements: success, amount exceeds available funds (400), partial disbursements accumulate correctly, audit trail fields populated, non-admin gets 403

- [ ] 14. Trust score service
  - [ ] 14.1 Implement `TrustScoreService.compute_score(entrepreneur_id)`: query entrepreneur_profiles (verification_status), projects (funded count), project_updates (update count, capped at 10), fraud_flags (unresolved count); apply weights: verified=+30, per funded project=+15, per update=+2 (max +20), per unresolved flag=-25; clamp result to 0–100
  - [ ] 14.2 Implement `TrustScoreService.recalculate(entrepreneur_id)`: call `compute_score`, write result to `entrepreneur_profiles.trust_score`
  - [ ] 14.3 Wire recalculation triggers: call `recalculate` from `VerificationService` on status change, from `ProjectService` on project funded, from `ProjectService` on update posted, from `FraudService` on flag created or resolved
  - [ ] 14.4 Expose trust_score and its component inputs on `EntrepreneurProfile` GET response for Admin review
  - [ ] 14.5 Write unit tests for trust score: verified entrepreneur, multiple funded projects, update cap at 10, fraud flag penalty, score clamped at 0 and 100

---

## Week 4: Fraud Service, Notification Service, RBAC

- [ ] 15. Fraud service — automated rules
  - [ ] 15.1 Implement `FraudService.check_rapid_submission(entrepreneur_id)`: count projects submitted by user in last 24 hours; if > 3, create `FraudFlag(type=rapid_submission)`
  - [ ] 15.2 Implement `FraudService.check_duplicate_nin(nin, entrepreneur_id)`: called by `VerificationService`; if NIN exists on a different profile, create `FraudFlag(type=duplicate_nin)`
  - [ ] 15.3 Implement `FraudService.check_goal_modification(project_id, old_goal, new_goal)`: called by `ProjectService` on PATCH; if project status ≥ approved and goal changed, create `FraudFlag(type=goal_modification)`
  - [ ] 15.4 Implement `FraudService.create_flag(flagged_user_id, flagged_project_id, flag_type, description, created_by)`: create `FraudFlag` record; call `NotificationService.send(event=fraud_flag_created, recipients=[all admins])`; call `TrustScoreService.recalculate` if flagged_user is an entrepreneur; check unresolved flag count — if ≥ 2, call `FraudService.auto_suspend_user`
  - [ ] 15.5 Implement `FraudService.auto_suspend_user(user_id)`: set `is_suspended=True`; call `NotificationService.send(event=fraud_flag_created, recipients=[all admins])` with suspension context
  - [ ] 15.6 Write unit tests for automated rules: rapid submission threshold, duplicate NIN flag, goal modification flag, auto-suspension at 2 unresolved flags

- [ ] 16. Fraud service — admin management endpoints
  - [ ] 16.1 Implement `AdminFraudFlagListView` (GET `/api/v1/admin/fraud-flags/`): Admin only; paginated list of all fraud flags; support filtering by status
  - [ ] 16.2 Implement `AdminFraudFlagResolveView` (POST `/api/v1/admin/fraud-flags/{id}/resolve/`): Admin only; update status='resolved', record resolved_by and resolved_at; call `TrustScoreService.recalculate` for flagged entrepreneur; return 200
  - [ ] 16.3 Enforce immutability: only `status`, `resolved_by`, `resolved_at` fields are writable after creation; all other fields read-only
  - [ ] 16.4 Write unit tests for fraud flag management: resolve updates fields, non-admin gets 403, immutable fields cannot be changed

- [ ] 17. Notification service
  - [ ] 17.1 Implement `NotificationService.send(event_type, recipients, context)`: render email subject and body from per-event templates; dispatch via Django's `send_mail` (SMTP backend); log attempt to a `NotificationLog` model (recipient, event_type, status, timestamp)
  - [ ] 17.2 Create `NotificationLog` model: id (UUID), recipient_email, event_type, status (enum: pending/sent/failed), attempt_count, created_at, updated_at
  - [ ] 17.3 Implement retry logic: wrap dispatch in a loop with exponential backoff (1s, 2s, 4s); after 3 failed attempts mark log status='failed'
  - [ ] 17.4 Implement async dispatch: use Python `threading.Thread` (fire-and-forget) so notification does not block the API response; wrap thread in try/except to prevent silent failures
  - [ ] 17.5 Create email templates (plain-text + HTML) for all 8 events: account_registered, otp_sent, project_approved, project_rejected, transaction_confirmed, disbursement_completed, update_posted, fraud_flag_created
  - [ ] 17.6 Write unit tests for notification service: correct template rendered per event, retry logic fires on SMTP failure, log record created with correct status, async dispatch does not block response

- [ ] 18. Role-based access control (RBAC)
  - [ ] 18.1 Implement `IsEntrepreneur`, `IsFunder`, `IsAdmin` DRF permission classes: check `request.user.role` against expected value; return 403 if mismatch
  - [ ] 18.2 Implement `IsOwnerOrAdmin` permission class: check that `request.user` is the resource owner or has admin role; return 403 otherwise
  - [ ] 18.3 Apply permission classes to all views: Entrepreneur-only (project submit, my projects, entrepreneur profile, post update), Funder-only (browse projects, create transaction), Admin-only (admin endpoints), shared (project detail, transaction detail)
  - [ ] 18.4 Ensure all protected endpoints return 401 for unauthenticated requests (DRF `IsAuthenticated` as base)
  - [ ] 18.5 Validate role claim from JWT on every request: configure `JWTAuthentication` as the default authenticator; role is read from token payload, not re-queried from DB on every request
  - [ ] 18.6 Write unit tests for RBAC: each role blocked from other roles' endpoints (403), unauthenticated requests blocked (401), owner-only resources blocked for non-owners (403)

- [ ] 19. Error handling and response standards
  - [ ] 19.1 Implement a custom DRF exception handler (`custom_exception_handler`): format all error responses as `{ "status": <int>, "error_code": <string>, "message": <string> }`
  - [ ] 19.2 Map exception types to HTTP codes: `ValidationError` → 400, `AuthenticationFailed` → 401, `PermissionDenied` → 403, `NotFound` → 404, `Conflict` (custom) → 409, unhandled → 500
  - [ ] 19.3 Implement a custom `ConflictError` exception class for 409 responses
  - [ ] 19.4 Configure Django's 500 handler to log full stack trace internally and return generic `{ "status": 500, "error_code": "server_error", "message": "An unexpected error occurred." }` to client
  - [ ] 19.5 Ensure paginated list responses follow the standard envelope: `{ "count", "next", "previous", "results" }`
  - [ ] 19.6 Write unit tests for error handler: each error type returns correct status code and envelope shape

---

## Week 5: Integration Testing, Security Hardening, API Docs, Deployment

- [ ] 20. Integration testing
  - [ ] 20.1 Write end-to-end integration test: full registration → OTP → JWT → entrepreneur profile upload → project submission → admin approval → funder transaction → project funded → disbursement flow
  - [ ] 20.2 Write integration test for fraud detection flow: rapid submission triggers flag, duplicate NIN triggers flag, 2 unresolved flags triggers auto-suspension
  - [ ] 20.3 Write integration test for trust score lifecycle: score increases on verification, funded project, updates; decreases on fraud flag; recalculates on flag resolution
  - [ ] 20.4 Write integration test for notification delivery: verify `NotificationLog` records created with correct event_type and status for each trigger event
  - [ ] 20.5 Write integration test for RBAC: confirm each role can only access its permitted endpoints across the full API surface
  - [ ] 20.6 Write integration test for disbursement guard: confirm total disbursed never exceeds total collected for a project across multiple partial disbursements

- [ ] 21. Security hardening
  - [ ] 21.1 Enforce HTTPS-only: set `SECURE_SSL_REDIRECT=True`, `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` in production settings
  - [ ] 21.2 Audit all environment variables: confirm no secrets in source code; verify `.env` is in `.gitignore`; document all required vars in `.env.example`
  - [ ] 21.3 Add DRF throttling: `AnonRateThrottle` (10/min) and `UserRateThrottle` (100/min) globally; apply stricter throttle (5/min) on OTP request endpoint to prevent brute force
  - [ ] 21.4 Validate and sanitize all inputs via DRF serializers: confirm no raw `request.data` access in views or services; all data passes through serializer `.validated_data`
  - [ ] 21.5 Confirm all document URLs are served via backend proxy or pre-signed URLs — never expose raw storage paths to clients
  - [ ] 21.6 Review all model `__str__` methods and log statements to confirm no OTP plaintext, passwords, or NIN values are ever logged
  - [ ] 21.7 Add `django-cors-headers` and configure `CORS_ALLOWED_ORIGINS` to restrict cross-origin requests to known frontend domains

- [ ] 22. API documentation
  - [ ] 22.1 Add `drf-spectacular` to dependencies and configure `SpectacularAPIView` and `SpectacularSwaggerUIView` at `/api/v1/schema/` and `/api/v1/docs/`
  - [ ] 22.2 Annotate all views with `@extend_schema` decorators: document request bodies, response schemas, error responses, and auth requirements
  - [ ] 22.3 Add schema descriptions for all serializer fields using `help_text` or `OpenApiTypes`
  - [ ] 22.4 Generate and commit the static OpenAPI schema file (`openapi.yaml`) to the repository
  - [ ] 22.5 Write a `README.md` covering: project overview, local setup instructions, environment variable reference, running tests, and API docs URL

- [ ] 23. Deployment configuration
  - [ ] 23.1 Write a `Dockerfile` for the Django application: multi-stage build, non-root user, `gunicorn` as the WSGI server
  - [ ] 23.2 Write a `docker-compose.yml` for local development: Django app, PostgreSQL, and optional SMTP mock (Mailhog)
  - [ ] 23.3 Write a `Procfile` (for Heroku/Railway) or equivalent deployment manifest with `web: gunicorn grantbridge.wsgi` and `release: python manage.py migrate`
  - [ ] 23.4 Configure `whitenoise` for static file serving in production
  - [ ] 23.5 Add a `health_check` endpoint (GET `/api/v1/health/`) that returns 200 `{ "status": "ok" }` — used by load balancers and deployment platforms
  - [ ] 23.6 Write a `DEPLOYMENT.md` documenting environment variable requirements, database setup steps, and first-run admin seed command
