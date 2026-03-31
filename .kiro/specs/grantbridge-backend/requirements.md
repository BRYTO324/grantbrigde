# Requirements Document

## Introduction

GrantBridge is a trust-first funding marketplace connecting entrepreneurs with funders, designed specifically for African markets where trust, fraud prevention, and transparency are critical success factors. The backend system must support the full funding lifecycle: project submission, admin review, live funding, disbursement, and post-funding updates — all within a secure, verifiable, and auditable platform.

This document defines the backend requirements for the GrantBridge MVP, targeting a 5-week build window using Django + Django REST Framework and PostgreSQL.

---

## Glossary

- **System**: The GrantBridge backend platform
- **Entrepreneur**: A registered user who submits funding projects
- **Funder**: A registered user who browses and funds projects
- **Admin**: A privileged platform operator who reviews and approves projects and manages the platform
- **Project**: A funding request submitted by an Entrepreneur, including a pitch video, funding breakdown, and supporting documents
- **Transaction**: A record of a Funder's financial contribution to a Project
- **Disbursement**: A controlled release of collected funds to an Entrepreneur
- **Update**: A post-funding progress report posted by an Entrepreneur on a funded Project
- **Fraud_Flag**: A system or user-generated signal indicating suspicious activity on a User or Project
- **OTP**: A one-time password sent via email for identity verification during authentication
- **Trust_Score**: A computed numeric value representing the credibility and reliability of an Entrepreneur
- **NIN**: National Identification Number — a government-issued identity document
- **CAC**: Corporate Affairs Commission — the Nigerian business registration authority
- **Verification_Service**: The backend service responsible for validating NIN and CAC documents
- **Auth_Service**: The backend service responsible for authentication and session management
- **Project_Service**: The backend service responsible for project lifecycle management
- **Transaction_Service**: The backend service responsible for recording and managing funding transactions
- **Disbursement_Service**: The backend service responsible for releasing funds to Entrepreneurs
- **Fraud_Service**: The backend service responsible for detecting and flagging suspicious activity
- **Notification_Service**: The backend service responsible for sending email notifications
- **JWT**: JSON Web Token — a stateless authentication token issued after successful login
- **DRF**: Django REST Framework — the API layer used to expose backend services
- **MVP**: Minimum Viable Product — the initial production-ready release of GrantBridge

---

## Requirements

### Requirement 1: User Registration and Role Assignment

**User Story:** As a new user, I want to register on GrantBridge with a defined role, so that I can access features appropriate to my role as an Entrepreneur, Funder, or Admin.

#### Acceptance Criteria

1. THE Auth_Service SHALL support registration for three distinct roles: Entrepreneur, Funder, and Admin.
2. WHEN a new user submits a registration request with a valid email, password, full name, phone number, and role, THE Auth_Service SHALL create a user account and return a success response.
3. IF a registration request is submitted with an email address already associated with an existing account, THEN THE Auth_Service SHALL reject the request and return a 409 Conflict error.
4. IF a registration request is missing any required field, THEN THE Auth_Service SHALL reject the request and return a 400 Bad Request error with field-level validation messages.
5. THE System SHALL enforce that each email address is unique across all user roles.
6. WHEN a new account is created, THE Auth_Service SHALL set the account status to "unverified" until OTP verification is completed.

---

### Requirement 2: Email OTP Authentication

**User Story:** As a registered user, I want to verify my identity via a one-time password sent to my email, so that my account is secured without requiring SMS infrastructure.

#### Acceptance Criteria

1. WHEN a user requests login, THE Auth_Service SHALL send a 6-digit OTP to the user's registered email address.
2. THE Auth_Service SHALL set OTP expiry to 10 minutes from the time of generation.
3. THE Auth_Service SHALL store OTPs as hashed values and SHALL NOT store them in plaintext.
4. WHEN a user submits a valid, unexpired OTP, THE Auth_Service SHALL issue a signed JWT access token and a refresh token.
5. IF a user submits an expired OTP, THEN THE Auth_Service SHALL reject the request and return a 401 Unauthorized error.
6. IF a user submits an incorrect OTP 5 or more consecutive times, THEN THE Auth_Service SHALL lock the OTP session and require a new OTP request.
7. WHEN a JWT access token expires, THE Auth_Service SHALL allow the user to obtain a new access token using a valid refresh token.
8. THE Auth_Service SHALL invalidate all active tokens for a user upon explicit logout.

---

### Requirement 3: Identity Verification (NIN and CAC)

**User Story:** As a platform operator, I want Entrepreneurs to verify their identity using NIN and CAC documents, so that fraudulent project submissions are minimized.

#### Acceptance Criteria

1. WHEN an Entrepreneur submits a project, THE Verification_Service SHALL require a valid NIN and at least one CAC document upload before the project can be submitted for admin review.
2. THE Verification_Service SHALL accept document uploads in PDF, JPG, and PNG formats with a maximum file size of 5MB per file.
3. IF a document upload exceeds 5MB or is in an unsupported format, THEN THE Verification_Service SHALL reject the upload and return a 400 Bad Request error with a descriptive message.
4. WHEN identity documents are submitted, THE Verification_Service SHALL store the documents securely and associate them with the Entrepreneur's account.
5. THE System SHALL enforce that each NIN is associated with at most one Entrepreneur account.
6. WHEN an Admin reviews a project, THE System SHALL display the associated NIN and CAC documents for manual verification.
7. WHEN an Entrepreneur's identity is verified by an Admin, THE Verification_Service SHALL update the Entrepreneur's verification status to "verified".

---

### Requirement 4: Project Submission

**User Story:** As an Entrepreneur, I want to submit a funding project with a pitch video and structured funding breakdown, so that Funders can evaluate and fund my project.

#### Acceptance Criteria

1. WHEN an Entrepreneur submits a project, THE Project_Service SHALL require a title, description, funding goal amount, funding breakdown (structured as a JSON object), pitch video URL, and target completion date.
2. THE Project_Service SHALL enforce that the funding breakdown fields sum to the total funding goal amount.
3. IF an Entrepreneur already has one active project (status: pending, approved, or live), THEN THE Project_Service SHALL reject any new project submission and return a 409 Conflict error.
4. WHEN a project is submitted, THE Project_Service SHALL set the project status to "pending" and notify the Admin via email.
5. THE Project_Service SHALL enforce that the pitch video field contains a valid URL pointing to an uploaded video resource.
6. IF a project submission is missing any required field, THEN THE Project_Service SHALL reject the request and return a 400 Bad Request error with field-level validation messages.
7. WHEN a project is submitted, THE Project_Service SHALL record the submission timestamp and associate the project with the submitting Entrepreneur.

---

### Requirement 5: Admin Project Review and Approval

**User Story:** As an Admin, I want to review submitted projects and approve or reject them, so that only credible projects are published to Funders.

#### Acceptance Criteria

1. WHEN a project is in "pending" status, THE System SHALL make it visible in the Admin review queue.
2. WHEN an Admin approves a project, THE Project_Service SHALL update the project status to "live" and notify the Entrepreneur via email.
3. WHEN an Admin rejects a project, THE Project_Service SHALL update the project status to "rejected", record a rejection reason, and notify the Entrepreneur via email.
4. THE System SHALL enforce that only users with the Admin role can approve or reject projects.
5. WHEN an Admin flags a project for fraud, THE Fraud_Service SHALL create a Fraud_Flag record associated with the project and the flagging Admin.
6. THE System SHALL record the Admin user ID and timestamp for every approval, rejection, and fraud flag action.

---

### Requirement 6: Project Discovery and Browsing

**User Story:** As a Funder, I want to browse live projects with relevant details, so that I can make informed funding decisions.

#### Acceptance Criteria

1. THE Project_Service SHALL expose a paginated list of all projects with "live" status to authenticated Funders.
2. WHEN a Funder requests a project detail view, THE Project_Service SHALL return the project title, description, funding goal, amount raised to date, funding breakdown, pitch video URL, Entrepreneur trust score, and project updates.
3. THE Project_Service SHALL support filtering live projects by funding goal range and target completion date.
4. THE Project_Service SHALL support sorting live projects by date created, amount raised, and funding goal.
5. WHILE a project's raised amount equals or exceeds its funding goal, THE Project_Service SHALL update the project status to "funded" and prevent further transactions against that project.

---

### Requirement 7: Funding Transactions

**User Story:** As a Funder, I want to contribute funds to a live project, so that I can support Entrepreneurs I believe in.

#### Acceptance Criteria

1. WHEN a Funder submits a funding contribution to a live project, THE Transaction_Service SHALL create a Transaction record with the Funder ID, Project ID, amount, currency, and timestamp.
2. THE Transaction_Service SHALL enforce a minimum contribution amount of 100 units of the base currency.
3. IF a Funder attempts to fund a project that is not in "live" status, THEN THE Transaction_Service SHALL reject the request and return a 400 Bad Request error.
4. WHEN a transaction is recorded, THE Transaction_Service SHALL update the project's total raised amount.
5. THE Transaction_Service SHALL integrate with a mock payment gateway for MVP, recording payment reference IDs for future reconciliation.
6. WHEN a transaction is completed, THE Notification_Service SHALL send a confirmation email to the Funder and a notification email to the Entrepreneur.
7. THE Transaction_Service SHALL enforce that all transaction amounts are positive non-zero values.

---

### Requirement 8: Fund Disbursement

**User Story:** As an Admin, I want to disburse collected funds to Entrepreneurs in a controlled manner, so that funds are released transparently and accountably.

#### Acceptance Criteria

1. WHEN an Admin initiates a disbursement for a funded project, THE Disbursement_Service SHALL create a Disbursement record with the project ID, amount, disbursement date, and Admin ID.
2. THE Disbursement_Service SHALL enforce that the total disbursed amount for a project does not exceed the total collected transaction amount for that project.
3. IF a disbursement request exceeds the available collected funds, THEN THE Disbursement_Service SHALL reject the request and return a 400 Bad Request error.
4. WHEN a disbursement is completed, THE Notification_Service SHALL send a confirmation email to the Entrepreneur.
5. THE System SHALL enforce that only users with the Admin role can initiate disbursements.
6. THE Disbursement_Service SHALL maintain a full audit trail of all disbursement actions, including Admin ID, timestamp, and disbursement status.
7. THE Disbursement_Service SHALL support partial disbursements, allowing funds to be released in multiple installments.

---

### Requirement 9: Post-Funding Project Updates

**User Story:** As an Entrepreneur, I want to post progress updates on my funded project, so that Funders can track how their contributions are being used.

#### Acceptance Criteria

1. WHEN an Entrepreneur posts an update on a project with "funded" or "live" status, THE Project_Service SHALL create an Update record with the content, timestamp, and associated project ID.
2. THE Project_Service SHALL enforce that only the Entrepreneur who owns the project can post updates to it.
3. WHEN a new update is posted, THE Notification_Service SHALL send an email notification to all Funders who have contributed to that project.
4. THE Project_Service SHALL expose a paginated list of updates for any given project to authenticated users.
5. IF an Entrepreneur attempts to post an update on a project they do not own, THEN THE Project_Service SHALL reject the request and return a 403 Forbidden error.

---

### Requirement 10: Trust Score System

**User Story:** As a Funder, I want to see a trust score for each Entrepreneur, so that I can assess credibility before making a funding decision.

#### Acceptance Criteria

1. THE System SHALL compute a Trust_Score for each Entrepreneur as a numeric value between 0 and 100.
2. THE Trust_Score SHALL be recalculated WHEN any of the following events occur: identity verification status changes, a project is successfully funded, a disbursement is completed, or a Fraud_Flag is created against the Entrepreneur.
3. THE System SHALL factor the following signals into the Trust_Score: identity verification status, number of successfully funded projects, number of post-funding updates posted, and number of active Fraud_Flags.
4. THE Project_Service SHALL include the Entrepreneur's current Trust_Score in all project detail responses.
5. THE System SHALL expose the Trust_Score calculation inputs as readable fields on the Entrepreneur profile for Admin review.

---

### Requirement 11: Fraud Detection and Flagging

**User Story:** As a platform operator, I want the system to detect and flag suspicious activity, so that fraudulent projects and users are identified before causing harm to Funders.

#### Acceptance Criteria

1. THE Fraud_Service SHALL automatically create a Fraud_Flag WHEN any of the following conditions are detected: a single user submits more than 3 projects within 24 hours, a project's funding goal is changed after approval, or a user account is associated with more than one NIN.
2. WHEN a Fraud_Flag is created, THE Notification_Service SHALL send an alert email to all Admin users.
3. THE Fraud_Service SHALL expose a paginated list of all active Fraud_Flags to Admin users.
4. WHEN an Admin resolves a Fraud_Flag, THE Fraud_Service SHALL update the flag status to "resolved" and record the resolving Admin ID and timestamp.
5. THE System SHALL enforce that Fraud_Flag records are immutable after creation, except for the status and resolution fields.
6. IF a user account has 2 or more unresolved Fraud_Flags, THEN THE System SHALL automatically suspend the account and notify all Admin users.

---

### Requirement 12: Role-Based Access Control

**User Story:** As a platform operator, I want all API endpoints to enforce role-based access, so that users can only perform actions permitted by their role.

#### Acceptance Criteria

1. THE System SHALL enforce that Entrepreneur-only endpoints reject requests from Funder and Admin roles with a 403 Forbidden response.
2. THE System SHALL enforce that Funder-only endpoints reject requests from Entrepreneur and Admin roles with a 403 Forbidden response.
3. THE System SHALL enforce that Admin-only endpoints reject requests from Entrepreneur and Funder roles with a 403 Forbidden response.
4. THE System SHALL enforce that all protected endpoints reject unauthenticated requests with a 401 Unauthorized response.
5. THE Auth_Service SHALL embed the user's role in the JWT payload and THE System SHALL validate the role claim on every protected request.

---

### Requirement 13: Database Integrity and Indexing

**User Story:** As a backend engineer, I want the database schema to enforce data integrity and support efficient queries, so that the system is reliable and performant under load.

#### Acceptance Criteria

1. THE System SHALL enforce foreign key constraints between all related tables to prevent orphaned records.
2. THE System SHALL enforce unique constraints on: user email, user NIN, and project-per-entrepreneur active limit at the application layer.
3. THE System SHALL apply database indexes on: user email, project status, transaction project ID, disbursement project ID, and fraud flag user ID.
4. THE System SHALL use UUID primary keys for all core tables to prevent enumeration attacks.
5. THE System SHALL store all monetary values as integer types representing the smallest currency unit to avoid floating-point precision errors.
6. THE System SHALL store all timestamps in UTC.

---

### Requirement 14: API Error Handling and Response Standards

**User Story:** As a frontend developer, I want all API errors to follow a consistent response format, so that I can handle errors predictably across the application.

#### Acceptance Criteria

1. THE System SHALL return all error responses in a consistent JSON structure containing: a status code, an error code string, and a human-readable message.
2. THE System SHALL return HTTP 400 for validation errors, 401 for authentication failures, 403 for authorization failures, 404 for missing resources, 409 for conflict errors, and 500 for unhandled server errors.
3. IF an unhandled server error occurs, THEN THE System SHALL log the full error stack trace internally and return a generic 500 error message to the client without exposing internal details.
4. THE System SHALL return paginated list responses in a consistent structure containing: total count, next page URL, previous page URL, and results array.

---

### Requirement 15: Notification Service

**User Story:** As a user, I want to receive email notifications for key platform events, so that I am kept informed of actions that affect me.

#### Acceptance Criteria

1. THE Notification_Service SHALL send email notifications for the following events: account registration, OTP delivery, project approval, project rejection, transaction confirmation, disbursement confirmation, new project update, and fraud flag alert.
2. THE Notification_Service SHALL use an SMTP email provider for all outbound emails.
3. IF an email delivery attempt fails, THEN THE Notification_Service SHALL retry delivery up to 3 times with exponential backoff before marking the notification as failed.
4. THE Notification_Service SHALL log all notification attempts with the recipient, event type, timestamp, and delivery status.
5. THE Notification_Service SHALL operate asynchronously and SHALL NOT block the primary API response.
