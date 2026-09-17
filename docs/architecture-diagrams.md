# CyberTrace: Architecture & System Design Models

This specification outlines the structural, behavioral, and database design models for the CyberTrace Digital Forensic Incident Management System[cite: 2].

---

## 1. System Use Case Diagram

Captures system boundaries, stakeholder interactions, and role-based permissions across public citizens, forensic analysts, and system administrators[cite: 2].

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

## 2. Class Diagram

Defines domain entities, Mongoose model interfaces, methods, and application-layer immutability hooks[cite: 2].

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

## 3. Database Entity Relationship Diagram (ERD)

Maps MongoDB collections, primary keys (`PK`), foreign keys (`FK`), unique constraints (`UK`), and data types[cite: 2].

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
