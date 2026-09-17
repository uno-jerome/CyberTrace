# CyberTrace: System Architecture & Design Diagrams

This document contains ready-to-use **Mermaid.js** diagram definitions for the CyberTrace Digital Forensic Incident Management System.

---

## 1. System Use Case Diagram

Models user roles (**Visitor / Citizen**, **Investigator / Forensic Analyst**, and **Administrator**) and their interactions with the system boundaries.

```mermaid
flowchart TD
    %% Actors
    subgraph Actors ["Stakeholder Roles"]
        Visitor["Citizen / Visitor\n(Public Reporter)"]
        Investigator["Forensic Investigator\n(Lead/Field Analyst)"]
        Admin["Administrator\n(SecOps Admin)"]
    end

    %% System Boundary
    subgraph CyberTraceSystem ["CyberTrace System Boundary"]
        UC1["Submit Incident Report\nwith Evidence File"]
        UC2["Receive Sequential Tracking Code\n(CASE-YYYY-XXXXX)"]
        UC3["Track Case Status Stepper\n(Sanitized Public View)"]
        
        UC4["Staff Authentication\n(Login via JWT)"]
        UC5["View Incident Triage Board\n& Apply Filters"]
        UC6["Inspect Case Dossier,\nEvidence & Audit Trail"]
        UC7["Verify Evidence File Integrity\n(On-Demand Recalculation)"]
        UC8["Stream / Download\nRaw Evidence File"]
        UC9["Add Internal Investigator Note"]
        UC10["Update Case Stage / Status"]
        UC11["Export Court-Ready\nForensic Dossier (PDF)"]

        UC12["Provision New\nInvestigator Accounts"]
        UC13["Inspect Global Immutable\nChain of Custody Ledger"]
    end

    %% Visitor Connections
    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3

    %% Investigator Connections
    Investigator --> UC4
    Investigator --> UC5
    Investigator --> UC6
    Investigator --> UC7
    Investigator --> UC8
    Investigator --> UC9
    Investigator --> UC10
    Investigator --> UC11

    %% Admin Connections (Includes all Investigator capabilities + Admin specifics)
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13

    %% Styling
    classDef actorStyle fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
    classDef usecaseStyle fill:#0f172a,stroke:#334155,stroke-width:1.5px,color:#e2e8f0;
    class Visitor,Investigator,Admin actorStyle;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13 usecaseStyle;
```

---

## 2. Swimlane Activity Diagram: Evidence Intake & Ingestion Pipeline

Visualizes the transaction flow from public submission through memory-safe stream hashing to persistent storage in the disk vault and database.

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Citizen / Visitor
    participant API as Express API Layer<br/>(Multer & Controller)
    participant Crypto as Forensic Service<br/>(Native Node Crypto)
    participant Vault as Physical Vault<br/>(backend/uploads/)
    participant DB as MongoDB Database<br/>(Mongoose Models)

    Visitor->>API: POST /api/incidents/public (multipart form + evidence file)
    
    rect rgb(15, 23, 42)
        Note over API,Vault: Stream Storage Phase (O(1) RAM Consumption)
        API->>Vault: Multer streams incoming binary stream directly to disk
        Vault-->>API: File stored as UUID filename (e.g. 550e8400...pdf)
    end

    rect rgb(30, 41, 59)
        Note over API,Crypto: Dual Cryptographic Stream Hashing Phase
        API->>Crypto: computeFileHashes(physicalFilePath)
        Crypto->>Vault: fs.createReadStream(filePath)
        Crypto->>Crypto: Pipe data chunks simultaneously to SHA-256 & MD5 engines
        Crypto-->>API: Return { sha256: "hex...", md5: "hex..." }
    end

    rect rgb(15, 23, 42)
        Note over API,DB: Atomic Database Persistence & Immutability Ledger
        API->>DB: Count incidents & generate CASE-YYYY-XXXXX
        API->>DB: Incident.create({ trackingId, title, category, complainant, ... })
        API->>DB: EvidenceFile.create({ incidentId, originalFilename, storedFilename, sha256Hash, md5Hash })
        API->>DB: ChainOfCustodyLog.create({ evidenceId, incidentId, action: "INGESTION", role: "CITIZEN" })
        DB-->>API: Documents persisted successfully
    end

    API-->>Visitor: HTTP 201 Created { success: true, trackingId: "CASE-2026-XXXXX" }
```

---

## 3. Class Diagram

Defines the entity classes, Mongoose schema models, relationships, and immutability guardrails.

```mermaid
classDiagram
    class User {
# CyberTrace: Architecture & System Design Models

This specification outlines the structural, behavioral, and database design models for the CyberTrace Digital Forensic Incident Management System[span_0](start_span)[span_0](end_span).

---

## 1. System Use Case Diagram

Captures system boundaries, stakeholder interactions, and role-based permissions across public citizens, forensic analysts, and system administrators[span_1](start_span)[span_1](end_span).

```mermaid
flowchart TD
    %% Stakeholder Actors
    subgraph Stakeholders ["System Actors"]
        Citizen["Complainant / Citizen\n(Unauthenticated Reporter)"]
        Analyst["Forensic Analyst\n(Investigator)"]
        Admin["System Administrator\n(SecOps / User Manager)"]
    end

    %% Platform Boundary
    subgraph CyberTraceBoundary ["CyberTrace System Boundary"]
        UC1["Submit Incident & Upload Evidence Files"]
        UC2["Receive Anonymous Tracking Code\n(CASE-YYYY-XXXXX)"]
        UC3["Track Case Status & Review Stepper\n(Sanitized Public View)"]
        
        UC4["Authenticate via Staff JWT\n(Email & Bcrypt Password)"]
        UC5["View Case Queue & Apply Filters\n(Severity, Status, Category)"]
        UC6["Review Incident Details\n& Evidence Manifest"]
        UC7["Execute One-Click Hash Verification\n(On-Demand Disk Re-hash)"]
        UC8["Stream / Download Raw Evidence File"]
        UC9["Append Timestamped Case Note"]
        UC10["Update Case Workflow Status\n(Reported → Under Review → Investigating → Resolved)"]
        UC11["Export Court-Ready PDF Dossier"]

        UC12["Provision & Manage Staff Accounts"]
        UC13["Assign Incidents to Lead Analysts"]
        UC14["Inspect Global Chain of Custody Audit Ledger"]
    end

    %% Public Associations
    Citizen --> UC1
    Citizen --> UC2
    Citizen --> UC3

    %% Investigator Associations
    Analyst --> UC4
    Analyst --> UC5
    Analyst --> UC6
    Analyst --> UC7
    Analyst --> UC8
    Analyst --> UC9
    Analyst --> UC10
    Analyst --> UC11

    %% Administrator Associations
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    %% Visual Styling
    classDef actorStyle fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef usecaseStyle fill:#1e293b,stroke:#475569,stroke-width:1px,color:#e2e8f0;
    class Citizen,Analyst,Admin actorStyle;
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14 usecaseStyle;
```

---

## 2. Activity Diagram (4-Swimlane Operational Workflow)

Traces digital evidence custody from citizen intake through automated hashing to investigator review, verification, and PDF dossier generation[span_2](start_span)[span_2](end_span).

```mermaid
flowchart TD
    %% Lane 1: Complainant / Victim
    subgraph Lane1 ["Complainant / Victim"]
        V_Start(( )) --> V1["Open Public Portal"]
        V1 --> V2["Fill-out Incident Form"]
        V2 --> V3["Upload Evidence Files"]
        V3 --> V4["Submit Report"]
        V5["Receive Tracking Code"] --> V_End((( )))
    end

    %% Lane 2: Automated System
    subgraph Lane2 ["Automated System"]
        S1["Compute SHA-256 & MD5 Hash Checksums"]
        S2["Save File to Chain of Custody Vault"]
        S3["Generate Tracking Code"]
        S4["Record Initial Intake in Chain of Custody Log"]
        S_AuthAdmin{"Valid Admin Credentials?"}
        S_AdminDash["Issue JWT / Open Admin Dashboard"]
        S_AuthAnalyst{"Valid Analyst Credentials?"}
        S_AnalystDash["Issue JWT / Open Analyst Dashboard"]
        S_ReadVault["Read Evidence from Stored Vault Location"]
        S_Rehash["Re-hash Stored File & Compare Baseline"]
        S_Eval["Evaluate Hash Integrity"]
        S_UpdateLog["Update Tracking ID & Log Audit Delta"]
        S_MakePDF["Compile Metadata, Hashes & Notes into PDF"]
    end

    %% Lane 3: System Administrator
    subgraph Lane3 ["System Administrator"]
        A1["Open Admin Portal"] --> A2["Enter Admin Credentials"]
        A3["Review System Audit Logs"]
        A4["Manage Analyst Accounts (CRUD)"]
        A5["Assign Cases to Analyst"]
    end

    %% Lane 4: Forensic Analyst
    subgraph Lane4 ["Forensic Analyst"]
        F1["Open Analyst Portal"] --> F2["Enter Analyst Credentials"]
        F3["Open Assigned Case from Queue"]
        F4["Request One-Click Verification"]
        F_Match{"Hashes Match?"}
        F_Pass["Display 'Integrity Verified' Status"]
        F_Fail["Display 'Tampering Detected' Alert"]
        F5["Log Findings into Case Notes"]
        F6["Update Case Workflow Status"]
        F7["Trigger Court Dossier Generation"]
        F8["Download Final PDF Dossier"] --> F_End((( )))
    end

    %% Cross-Lane Connections
    V4 --> S1
    S1 --> S2
    S2 --> S3
    S3 --> V5
    S3 --> S4
    
    A2 --> S_AuthAdmin
    S_AuthAdmin -- "Yes" --> S_AdminDash
    S_AuthAdmin -- "No" --> A2
    S_AdminDash --> A3
    A3 --> A4
    A4 --> A5
    A5 --> F3

    F2 --> S_AuthAnalyst
    S_AuthAnalyst -- "Yes" --> S_AnalystDash
    S_AuthAnalyst -- "No" --> F2
    S_AnalystDash --> F3
    F3 --> F4
    F4 --> S_ReadVault
    S_ReadVault --> S_Rehash
    S_Rehash --> S_Eval
    S_Eval --> F_Match
    F_Match -- "Yes" --> F_Pass
    F_Match -- "No" --> F_Fail
    F_Pass --> F5
    F_Fail --> F5
    F5 --> F6
    F6 --> S_UpdateLog
    F6 --> F7
    F7 --> S_MakePDF
    S_MakePDF --> F8

    %% Styling
    classDef startEnd fill:#0284c7,stroke:#38bdf8,stroke-width:2px,color:#ffffff;
    classDef decision fill:#334155,stroke:#94a3b8,stroke-width:2px,color:#ffffff;
    classDef process fill:#1e293b,stroke:#475569,stroke-width:1px,color:#f8fafc;
    class V_Start,V_End,F_End startEnd;
    class S_AuthAdmin,S_AuthAnalyst,F_Match decision;
    class V1,V2,V3,V4,V5,S1,S2,S3,S4,S_AdminDash,S_AnalystDash,S_ReadVault,S_Rehash,S_Eval,S_UpdateLog,S_MakePDF,A1,A2,A3,A4,A5,F1,F2,F3,F4,F_Pass,F_Fail,F5,F6,F7,F8 process;
```

---

## 3. Sequence Diagram: On-Demand Evidence Integrity Verification

Visualizes the step-by-step verification pipeline when an investigator tests an evidence file against its baseline cryptographic hashes[span_3](start_span)[span_3](end_span).

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Forensic Analyst
    participant UI as Web Console (React)
    participant API as Express API Layer
    participant Service as Forensic Service (Node Crypto)
    participant Storage as Uploads Vault (backend/uploads/)
    participant DB as MongoDB (Mongoose)

    Analyst->>UI: Click "Verify Integrity"
    UI->>API: POST /api/evidence/:id/verify (Bearer JWT)
    
    rect rgb(15, 23, 42)
        Note over API,DB: Baseline Retrieval
        API->>DB: EvidenceFile.findById(id)
        DB-->>API: { sha256Hash: "e3b0c44...", storedFilename: "UUID.ext" }
    end

    rect rgb(30, 41, 59)
        Note over API,Storage: Non-Blocking Stream Recalculation
        API->>Service: computeFileHashes(filePath)
        Service->>Storage: fs.createReadStream(storedFilename)
        Storage-->>Service: Binary Data Chunks
        Service-->>API: Recalculated Checksums (SHA-256 & MD5)
    end

    rect rgb(15, 23, 42)
        Note over API,DB: Comparison & Immutable Custody Audit
        alt Hashes Match Baseline
            API->>DB: ChainOfCustodyLog.create({ action: "VERIFY_PASS" })
            API-->>UI: HTTP 200 { match: true, currentHash: "..." }
            UI-->>Analyst: Render Green "Integrity Verified" Badge
        else Hash Mismatch (Tampered File)
            API->>DB: ChainOfCustodyLog.create({ action: "VERIFY_FAIL" })
            API-->>UI: HTTP 200 { match: false, currentHash: "...", baselineHash: "..." }
            UI-->>Analyst: Render Red "Tampering Detected" Flag
        end
    end
```

---

## 4. Class Diagram

Defines domain entities, Mongoose model interfaces, methods, and application-layer immutability hooks[span_4](start_span)[span_4](end_span).

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +comparePassword(candidate) Boolean
    }

    class Incident {
        +ObjectId _id
        +String trackingId
        +String title
        +String category
        +String platform
        +String suspectIdentifiers
        +Number estimatedLoss
        +String narrative
        +Date incidentDate
        +String complainantName
        +String complainantEmail
        +String status
        +String priority
        +ObjectId assignedTo
        +Array notes
        +Array evidenceFiles
        +Date createdAt
        +Date updatedAt
    }

    class EvidenceFile {
        +ObjectId _id
        +ObjectId incidentId
        +String originalFilename
        +String storedFilename
        +Number fileSize
        +String mimeType
        +String sha256Hash
        +String md5Hash
        +Date uploadedAt
    }

    class ChainOfCustodyLog {
        +ObjectId _id
        +ObjectId incidentId
        +ObjectId evidenceFileId
        +ObjectId performedBy
        +String action
        +String details
        +String calculatedHash
        +String ipAddress
        +Date timestamp
        +rejectMutation() Void
    }

    %% Entity Relationships
    User "1" --> "0..*" Incident : "assignedTo"
    Incident "1" *-- "1..*" EvidenceFile : "contains"
    Incident "1" *-- "0..*" ChainOfCustodyLog : "tracks"
    EvidenceFile "1" <-- "0..*" ChainOfCustodyLog : "audits"
    User "1" <-- "0..*" ChainOfCustodyLog : "performedBy"
```

---

## 5. Database Entity Relationship Diagram (ERD)

Maps MongoDB collections, primary keys (`PK`), foreign keys (`FK`), unique constraints (`UK`), and data types[span_5](start_span)[span_5](end_span).

```mermaid
erDiagram
    users {
        ObjectId _id PK
        string name
        string email UK
        string password "Bcrypt Hash"
        string role "ADMIN | INVESTIGATOR"
        boolean isActive
        date createdAt
        date updatedAt
    }

    incidents {
        ObjectId _id PK
        string trackingId UK "CASE-YYYY-XXXXX"
        string title
        string category "Phishing | Financial Fraud | Extortion | Identity Theft | Unauthorized Access | Other"
        string platform "Platform or attack surface"
        string suspectIdentifiers "Known handles, phone, or bank accounts"
        number estimatedLoss "Financial damages in PHP"
        string narrative "Factual incident narrative"
        date incidentDate
        string complainantName "Defaults to Anonymous"
        string complainantEmail "Protected contact record"
        string status "Reported | Under Review | Investigating | Resolved | Closed"
        string priority "LOW | MEDIUM | HIGH | CRITICAL"
        ObjectId assignedTo FK "References users._id"
        array notes "Investigation case notes"
        array evidenceFiles "References evidencefiles._id"
        date createdAt
        date updatedAt
    }

    evidencefiles {
        ObjectId _id PK
        ObjectId incidentId FK "References incidents._id"
        string originalFilename
        string storedFilename "UUID filename in backend/uploads/"
        number fileSize "File size in bytes"
        string mimeType
        string sha256Hash "Cryptographic baseline digest"
        string md5Hash "Secondary verification digest"
        date uploadedAt
    }

    chainofcustodylogs {
        ObjectId _id PK
        ObjectId incidentId FK "References incidents._id"
        ObjectId evidenceFileId FK "References evidencefiles._id"
        ObjectId performedBy FK "References users._id (Null for citizen)"
        string action "INGESTION | VIEW | VERIFY_PASS | VERIFY_FAIL | STATUS_CHANGE | CASE_ASSIGNMENT | NOTE_ADDED | DOSSIER_EXPORT"
        string details "Operational audit message"
        string calculatedHash "Recalculated verification hash"
        string ipAddress "Client IP address"
        date timestamp "Append-only immutable timestamp"
    }

    users ||--o{ incidents : "assigned_to"
    incidents ||--|{ evidencefiles : "contains"
    incidents ||--|{ chainofcustodylogs : "tracks"
    evidencefiles ||--o{ chainofcustodylogs : "audits"
    users ||--o{ chainofcustodylogs : "performed_by"
```

