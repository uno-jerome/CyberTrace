# CyberTrace: Digital Forensic Incident Management System

A web-based digital forensic case management platform built on the MERN stack. Designed for forensic incident intake, evidence isolation, and verifiable chain-of-custody tracking.

---

## Table of Contents

- [1. Project Overview & Threat Model](#1-project-overview--threat-model)
- [2. System Architecture & Tech Stack](#2-system-architecture--tech-stack)
- [3. Directory Structure](#3-directory-structure)
- [4. Getting Started & Installation](#4-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Windows 1-Click Launch (`start.bat`)](#windows-1-click-launch-startbat)
  - [Manual Step-by-Step Setup (Fallback)](#manual-step-by-step-setup-fallback)
  - [Seeded Credentials](#seeded-credentials)
- [5. Account Administration & Security Configuration](#5-account-administration--security-configuration)
  - [Administrator Provisioning & Password Management](#administrator-provisioning--password-management)
  - [Environment Security & Secret Hygiene](#environment-security--secret-hygiene)
- [6. Live Demonstration Guide](#6-live-demonstration-guide)
  - [Step 1: Public Intake (`/report`)](#step-1-public-intake-report)
  - [Step 2: Sanitized Status Tracking (`/track`)](#step-2-sanitized-status-tracking-track)
  - [Step 3: Investigator Case Review (`/login` & `/dashboard`)](#step-3-investigator-case-review-login--dashboard)
  - [Step 4: The Live Tamper Proof (Viva Demonstration)](#step-4-the-live-tamper-proof-viva-demonstration)
  - [Step 5: Exporting Forensic Dossier](#step-5-exporting-forensic-dossier)
- [7. API Reference](#7-api-reference)
- [8. Security Architecture](#8-security-architecture)

---

## 1. Project Overview & Threat Model

Traditional incident reporting and evidence storage systems often suffer from three vulnerabilities: accidental evidence modification, memory exhaustion during large file uploads, and unauthorized tampering with case audit trails.

CyberTrace mitigates these risks at the software layer:

- **Memory-Safe Cryptographic Baselines:** File uploads are hashed via streaming interfaces (`fs.createReadStream` piped to Node's native `crypto` module). Hashes (SHA-256 and MD5) are generated in $O(1)$ memory without loading full files into RAM.
- **Evidence Vault Isolation:** Physical evidence files are renamed to UUIDs and saved in an isolated local directory (`backend/uploads/`). The directory is never exposed via `express.static()`. Files can only be retrieved through authenticated, role-checked streaming endpoints.
- **Append-Only Chain of Custody:** Audit records are locked at the database layer. Mongoose pre-hooks actively reject `updateOne`, `updateMany`, `findOneAndUpdate`, and `deleteOne` operations on the log collection.
- **On-Demand Tamper Detection:** Investigators can verify stored physical files against their baseline hashes at any time. Any altered byte triggers an immediate mismatch state and records a `VERIFY_FAIL` audit log.

---

## 2. System Architecture & Tech Stack

The system follows a strict 3-tier layered architecture:

```text
[ Citizen Portal / Investigator Console (React + Vite) ]
                        │
                  REST API / JWT
                        ▼
[ Business Logic & Security Controllers (Express) ]
      │                                  │
 Native Crypto                     Mongoose ODM
(SHA-256 Streams)                        │
      ▼                                  ▼
[ Physical Disk Vault (UUIDs) ]    [ MongoDB Database ]
```

- **Frontend:** React 18, Vite, Tailwind CSS (Slate Dark Mode & Civic Theme), Lucide React, Axios.
- **Backend:** Node.js, Express.js (Layered MVC structure).
- **Database:** MongoDB with Mongoose schemas and query middleware pre-hooks.
- **Security & Utilities:** Node native `crypto`, Multer disk engine, PDFKit (dossier generation), bcryptjs, JSON Web Tokens.

---

## 3. Directory Structure

```text
CyberTrace/
├── package.json                      # Root workspace orchestrator
├── start.bat                         # 1-click Windows runner
├── start.sh                          # 1-click macOS/Linux runner
├── backend/
│   ├── seed.js                       # Consolidated database seeder
│   ├── server.js                     # Express entry point
│   ├── uploads/                      # Isolated evidence disk vault
│   ├── tests/
│   │   └── api.test.js               # Integration test suite (Supertest/Jest)
│   └── src/
│       ├── config/                   # MongoDB connection lifecycle
│       ├── controllers/              # Auth, Incident, Evidence, and Admin controllers
│       ├── middleware/               # JWT verification, RBAC guard, Multer upload
│       ├── models/                   # User, Incident, EvidenceFile, CoC schemas
│       ├── routes/                   # Mounted Express route definitions
│       ├── services/                 # Forensic streaming and hashing service
│       └── utils/                    # PDFKit forensic report generator
├── frontend/
│   ├── index.html
│   ├── vite.config.js                # API reverse proxy configuration
│   ├── tailwind.config.js            # Slate dark mode theme configuration
│   └── src/
│       ├── App.jsx                   # React Router root shell
│       ├── api/                      # Consolidated axiosClient with JWT interceptors & 401 handling
│       ├── components/               # Navbar, CoC Timeline, Status Badges, ReportSuccessModal
│       ├── locales/                  # en.json and fil.json translation dictionaries
│       └── pages/                    # Canonical pages: Home, PublicReport, TrackCase, Login, Dashboard, CaseDetails, AdminConsole
└── PROJECT_PLAN.md                   # Architectural contract and execution rules
```

---

## 4. Getting Started & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on `mongodb://localhost:27017` (or MongoDB Compass connected).

---

### Quick Start

Run these two commands from the root `CyberTrace/` folder:

1. **One-Command Setup:**

   ```bash
   npm run setup
   ```

   *(Installs all root, backend, and frontend packages, automatically copies `.env.example` $\rightarrow$ `.env`, and seeds the initial accounts and sample evidence).*

2. **Launch Both Servers:**

   ```bash
   npm run dev
   ```

   *(Starts Express on port 5000 and Vite on port 5173 concurrently. Open **`http://localhost:5173`** in your browser).*

---

### Windows 1-Click Launch (`start.bat`)

For teammates on Windows who do not want to use the command line:

1. Open **MongoDB Compass** and click **Connect** to ensure your local database is running.
2. Double-click **`start.bat`** in the `CyberTrace` root folder.
3. The script automatically initializes environment variables, starts both backend and frontend servers in parallel, and opens your browser directly to `http://localhost:5173`.

---

### Manual Step-by-Step Setup (Fallback)

If you need to run or debug backend and frontend services in isolated terminals:

#### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # On Windows PowerShell: Copy-Item .env.example .env
node seed.js
npm run dev
```

#### 2. Frontend Setup

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

---

### Seeded Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@cybertrace.local` | `AdminPass123!` | System audit logs, provision investigator accounts |
| **Lead Analyst** | `analyst1@cybertrace.local` | `AnalystPass123!` | Review cases, verify file hashes, export reports |
| **Field Analyst** | `analyst2@cybertrace.local` | `AnalystPass123!` | Review cases, verify file hashes, export reports |

---

## 5. Account Administration & Security Configuration

### Administrator Provisioning & Password Management

The initial system administrator account is generated through `backend/seed.js`. You can manage and rotate administrative credentials through three approaches:

#### Method 1: Web Interface (Self-Service)

1. Log in as an Administrator (`admin@cybertrace.local`).
2. Click the user badge in the upper-right corner of the navigation bar and open **Settings** (`/settings`).
3. Under the **Security & Password** section, enter the current password, define a new password (minimum 8 characters), and confirm the update.
4. The system validates the existing salt hash, encrypts the new password using `bcryptjs` with 10 salt rounds, and writes it to MongoDB.

#### Method 2: Pre-Seeding Configuration

Before running database initialization, open `backend/seed.js` and edit the default administrator configuration block:

```javascript
const adminUser = {
  name: 'System Administrator',
  email: 'your-preferred-admin@domain.local',
  password: 'YourStrongPasswordHere!',
  role: 'ADMIN'
};
```

Execute `npm run seed` to populate MongoDB with your custom administrative credentials.

#### Method 3: Direct Database Override (`mongosh`)

If administrative access is lost or locked out, update the credential directly using the MongoDB shell:

```bash
mongosh cybertrace --eval '
const bcrypt = require("bcryptjs");
const hash = bcrypt.hashSync("NewAdminPassword123!", 10);
db.users.updateOne({ role: "ADMIN" }, { $set: { password: hash } });
'
```

### Environment Security & Secret Hygiene

The `.env` variables documented in this repository (`JWT_SECRET=cybertrace_super_secure_jwt_secret_2026`) are provided strictly for local development and academic evaluation:

- **Local Demonstration Safety:** Running the backend on `127.0.0.1:5000` isolates services to the local loopback interface. Outside traffic on public networks cannot interact with the local API or forge tokens without direct host access.
- **Production Deployment Requirement:** In a publicly exposed production environment, never commit raw secrets. The repository includes `.env.example` as a template. Production deployments must inject a cryptographically randomized 64-character hexadecimal secret generated via OpenSSL:

  ```bash
  openssl rand -hex 32
  ```

- **Git Guardrails:** The `.gitignore` file explicitly excludes `.env` to prevent credential exposure in public source repositories.

---

## 6. Live Demonstration Guide

Follow these steps during evaluation to demonstrate the complete lifecycle of evidence and tamper detection:

### Step 1: Public Intake (`/report`)

1. Navigate to `http://localhost:5173/report`.
2. Fill out an incident report (e.g., category: Phishing), attach an evidence file, and click **Submit Incident**.
3. The server streams the file to `backend/uploads/`, generates SHA-256 and MD5 baselines, creates an immutable `INGESTION` audit log, and displays a generated Tracking ID (`CASE-YYYY-XXXXX`).

### Step 2: Sanitized Status Tracking (`/track`)

1. Copy the Tracking ID from Step 1 and paste it into the tracker at `http://localhost:5173/track`.
2. The public tracker shows current case progress (`Reported` $\rightarrow$ `Under Review`), while strictly omitting complainant contact details, internal notes, and investigator identities.

### Step 3: Investigator Case Review (`/login` & `/dashboard`)

1. Log in as `analyst1@cybertrace.local` with password `AnalystPass123!`.
2. View the incident review dashboard. Click the newly submitted case to inspect case metadata, notes, and the initial Chain of Custody entry.

### Step 4: The Live Tamper Proof (Viva Demonstration)

1. In the Case Details view, locate the evidence section and click **Verify Evidence Integrity**.
2. A **Green Verified** badge confirms the recalculated file hash matches the initial baseline hash.
3. Open a terminal, edit the target file in `backend/uploads/`, alter a single character, and save it.
4. Return to the browser and click **Verify Evidence Integrity** again without reloading.
5. The UI displays an animated **Red Alert Banner**, showing the baseline hash alongside the modified hash, and logs a `VERIFY_FAIL` entry to the Chain of Custody.

### Step 5: Exporting Forensic Dossier

1. On the Case Details page, click **Export Forensic Dossier**.
2. The server compiles all metadata, evidence checksums, and chronological audit entries into a downloadable PDF report.

---

## 7. API Reference

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/incidents/public` | Public | Accepts multipart incident report, hashes file, creates case. |
| `GET` | `/api/incidents/track/:trackingId` | Public | Returns sanitized timeline status without private notes. |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and issues signed JWT. |
| `PATCH` | `/api/auth/change-password` | Authenticated | Validates existing password and hashes updated user credential. |
| `GET` | `/api/cases` | Investigator, Admin | Returns filterable case list for review and management. |
| `GET` | `/api/cases/:id` | Investigator, Admin | Returns full case details, evidence list, and audit history. |
| `PATCH` | `/api/cases/:id/status` | Investigator, Admin | Updates case stage and records a `STATUS_CHANGE` audit log. |
| `POST` | `/api/evidence/:id/verify` | Investigator, Admin | Recalculates hash from disk; logs `VERIFY_PASS` or `VERIFY_FAIL`. |
| `GET` | `/api/evidence/:id/file` | Investigator, Admin | Streams the binary file securely; logs a `VIEW` audit log. |
| `GET` | `/api/cases/:id/export-dossier` | Investigator, Admin | Generates and downloads a court-ready PDF dossier. |
| `GET` | `/api/admin/audit-logs` | Admin | Searchable, paginated read-only view of all custody logs. |
| `POST` | `/api/admin/users` | Admin | Provisions new investigator accounts. |

---

## 8. Security Architecture

- **Role-Based Access Control (RBAC):** Non-public routes pass through `verifyToken` (validating JWT signatures) and `requireRole(['INVESTIGATOR', 'ADMIN'])`.
- **Static Exposure Prevention:** Evidence files cannot be directly accessed by guessing URLs. They can only be requested through `GET /api/evidence/:id/file`, which enforces authentication and writes an audit log before piping the binary stream.
- **Database-Level Immutability:** Mongoose middleware intercepts any query that attempts to update or delete rows in the `ChainOfCustodyLogs` collection:

```javascript
/**
 * Prevents updates and deletions on the Chain of Custody ledger.
 * Throws an operational error if any mutation is attempted.
 */
const rejectMutation = function (next) {
  next(new Error('IMMUTABILITY_ERROR: Chain of custody records cannot be modified or deleted.'));
};

chainOfCustodyLogSchema.pre('updateOne', rejectMutation);
chainOfCustodyLogSchema.pre('updateMany', rejectMutation);
chainOfCustodyLogSchema.pre('findOneAndUpdate', rejectMutation);
chainOfCustodyLogSchema.pre('deleteOne', rejectMutation);
```
