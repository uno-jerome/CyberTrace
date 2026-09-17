/**
 * @file backend/tests/api.test.js
 * @description Automated integration test suite for CyberTrace REST API endpoints.
 *
 * This test suite validates the core security guarantees and cryptographic workflows:
 * - TC-01: Public report submission generates a valid CASE-YYYY-XXXXX tracking ID,
 *          stores the uploaded evidence file with UUID naming, computes initial SHA-256
 *          and MD5 baselines, and logs an immutable INGESTION entry.
 * - TC-02: Public tracking endpoint provides a sanitized status view, strictly stripping
 *          confidential investigator notes, reporter contact details, and internal IDs.
 * - TC-03: Protected investigator endpoints enforce authentication and reject requests
 *          lacking a valid JWT with 401 Unauthorized.
 * - TC-04: Forensic verification endpoint recalculates on-disk SHA-256 digests and confirms
 *          integrity (match: true, integrityStatus: 'Verified') for untampered files, logging
 *          a VERIFY_PASS Chain of Custody entry.
 * - TC-05: Modifying physical file bytes on disk immediately triggers tamper detection
 *          (match: false, integrityStatus: 'Tampered') and records a VERIFY_FAIL audit log.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Ensure test environment variables are loaded
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const app = require('../server');
const Incident = require('../src/models/Incident');
const EvidenceFile = require('../src/models/EvidenceFile');
const ChainOfCustodyLog = require('../src/models/ChainOfCustodyLog');
const User = require('../src/models/User');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'cybertrace_test_secret_key_12345';

jest.setTimeout(30000);

describe('CyberTrace API Integration Test Suite', () => {
  let investigatorToken;
  let investigatorId;
  let testIncidentId;
  let testTrackingId;
  let testEvidenceId;
  let testStoredFilename;
  const tempFilesToClean = [];

  /**
   * Global setup executed before any tests run.
   * Connects to the MongoDB database and provisions a valid investigator token.
   */
  beforeAll(async () => {
    const rawUri =
      process.env.TEST_MONGO_URI ||
      process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/cybertrace';
    const mongoUri = rawUri.replace('localhost', '127.0.0.1');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        runtimeAdapters: { os },
      });
    }

    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    investigatorId = new mongoose.Types.ObjectId();
    investigatorToken = jwt.sign(
      {
        id: investigatorId,
        name: 'Inspector Miller',
        role: 'INVESTIGATOR',
      },
      TEST_JWT_SECRET,
      { expiresIn: '2h' }
    );
  });

  /**
   * Global teardown executed after all tests complete.
   * Removes temporary files from the uploads directory, cleans up test database records,
   * and cleanly closes the Mongoose database connection to prevent hanging handles.
   */
  afterAll(async () => {
    for (const filePath of tempFilesToClean) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (_err) {
          // Ignore cleanup deletion errors on test tear-down
        }
      }
    }

    // Clean up created test documents
    if (testIncidentId) {
      await Incident.deleteOne({ _id: testIncidentId });
      await EvidenceFile.deleteMany({ incidentId: testIncidentId });
      // ChainOfCustodyLog pre-hooks block deleteMany on the model; bypass via native collection
      await ChainOfCustodyLog.collection.deleteMany({ incidentId: testIncidentId });
    }

    await mongoose.connection.close();
  });

  /**
   * TC-01: Public report submission returns valid CASE-YYYY-XXXXX trackingId.
   *
   * Verifies that:
   * 1. A citizen can submit a multipart incident report with attached evidence without authentication.
   * 2. The server responds with HTTP 201 Created and { success: true, trackingId }.
   * 3. The trackingId strictly conforms to the CASE-YYYY-XXXXX regex pattern.
   * 4. The uploaded file is saved to the disk vault (backend/uploads/) under a UUID filename.
   * 5. An EvidenceFile record is persisted in MongoDB with initial SHA-256 and MD5 baselines.
   * 6. An initial INGESTION record is appended to the immutable Chain of Custody ledger.
   */
  test('TC-01: Public report submission returns valid CASE-YYYY-XXXXX trackingId', async () => {
    const dummyContent = 'Evidence sample byte stream for TC-01 test verification.\nGenerated at ' + Date.now();
    const tempTestFilePath = path.join(UPLOADS_DIR, `temp_tc01_${Date.now()}.txt`);
    fs.writeFileSync(tempTestFilePath, dummyContent, 'utf-8');
    tempFilesToClean.push(tempTestFilePath);

    const response = await request(app)
      .post('/api/incidents/public')
      .field('title', 'Phishing Infiltration Attempt')
      .field('category', 'Phishing')
      .field('description', 'Suspicious credential harvesting email impersonating IT helpdesk.')
      .field('incidentDate', new Date().toISOString())
      .field('complainantName', 'Jane Citizen')
      .field('complainantContact', 'jane.citizen@example.com')
      .attach('evidence', tempTestFilePath);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.trackingId).toBeDefined();

    // Verify tracking ID pattern: CASE-YYYY-XXXXX
    const trackingIdRegex = /^CASE-\d{4}-\d{5}$/;
    expect(response.body.trackingId).toMatch(trackingIdRegex);

    testTrackingId = response.body.trackingId;

    // Verify Incident persistence in MongoDB
    const createdIncident = await Incident.findOne({ trackingId: testTrackingId });
    expect(createdIncident).not.toBeNull();
    expect(createdIncident.title).toBe('Phishing Infiltration Attempt');
    expect(createdIncident.complainantName).toBe('Jane Citizen');
    testIncidentId = createdIncident._id;

    // Verify EvidenceFile record persistence
    const createdEvidence = await EvidenceFile.findOne({ incidentId: testIncidentId });
    expect(createdEvidence).not.toBeNull();
    expect(createdEvidence.sha256Hash).toBeDefined();
    expect(createdEvidence.sha256Hash.length).toBe(64); // Valid SHA-256 hex length
    expect(createdEvidence.md5Hash).toBeDefined();
    expect(createdEvidence.md5Hash.length).toBe(32); // Valid MD5 hex length
    expect(createdEvidence.integrityStatus).toBe('Unchecked');

    testEvidenceId = createdEvidence._id;
    testStoredFilename = createdEvidence.storedFilename;

    // Verify physical file was saved on disk in uploads/
    const storedVaultPath = path.join(UPLOADS_DIR, testStoredFilename);
    expect(fs.existsSync(storedVaultPath)).toBe(true);
    tempFilesToClean.push(storedVaultPath);

    // Verify Chain of Custody INGESTION audit log
    const cocLog = await ChainOfCustodyLog.findOne({
      incidentId: testIncidentId,
      action: 'INGESTION',
    });
    expect(cocLog).not.toBeNull();
    expect(cocLog.role).toBe('CITIZEN');
    expect(cocLog.performedBy).toBe('PUBLIC_ANONYMOUS');
  });

  /**
   * TC-02: Public tracking endpoint returns sanitized data without private notes.
   *
   * Verifies that:
   * 1. Anyone with a valid tracking ID can query GET /api/incidents/track/:trackingId.
   * 2. The endpoint returns HTTP 200 with public metadata and stage timeline.
   * 3. Sensitive fields (complainant contact, assigned investigator ID, and private
   *    investigator notes) are stripped from the response payload for privacy and security.
   */
  test('TC-02: Public tracking endpoint returns sanitized data without private notes', async () => {
    // Inject confidential investigator notes and an investigator assignment to test sanitizer
    await Incident.findByIdAndUpdate(testIncidentId, {
      assignedTo: investigatorId,
      $push: {
        notes: {
          author: 'Inspector Miller',
          text: 'CONFIDENTIAL: Suspect IP traced to offshore proxy. Do not reveal publicly.',
          date: new Date(),
        },
      },
    });

    const response = await request(app).get(`/api/incidents/track/${testTrackingId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.incident).toBeDefined();

    const incidentData = response.body.incident;
    expect(incidentData.trackingId).toBe(testTrackingId);
    expect(incidentData.title).toBe('Phishing Infiltration Attempt');
    expect(incidentData.status).toBe('Reported');

    // Strict Sanitization Assertions: Confidential fields must NOT be exposed
    expect(incidentData.notes).toBeUndefined();
    expect(incidentData.complainantContact).toBeUndefined();
    expect(incidentData.assignedTo).toBeUndefined();

    // Timeline information should be populated for the citizen
    expect(incidentData.timeline).toBeDefined();
    expect(Array.isArray(incidentData.timeline.stages)).toBe(true);
    expect(typeof incidentData.timeline.currentStage).toBe('number');
  });

  /**
   * TC-03: Protected investigator route returns 401 Unauthorized when no JWT is provided.
   *
   * Verifies that:
   * 1. Protected case management routes (e.g., GET /api/cases) reject unauthenticated requests.
   * 2. The server responds with HTTP 401 Unauthorized and success: false.
   * 3. An explanatory error message is returned without leaking protected records.
   */
  test('TC-03: Protected investigator route returns 401 Unauthorized when no JWT is provided', async () => {
    const response = await request(app).get('/api/cases');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/access denied|no authentication token provided/i);
  });

  /**
   * TC-04: Forensic verification returns match: true for an unaltered disk file.
   *
   * Verifies that:
   * 1. An authenticated investigator calling POST /api/evidence/:id/verify triggers
   *    re-calculation of the physical file's SHA-256 hash using streaming.
   * 2. When the file has not been altered, the recalculation matches the baseline hash.
   * 3. The response returns match: true and integrityStatus: 'Verified'.
   * 4. The EvidenceFile document is updated to 'Verified'.
   * 5. An immutable VERIFY_PASS entry is appended to the Chain of Custody audit ledger.
   */
  test('TC-04: Forensic verification returns match: true for an unaltered disk file', async () => {
    const response = await request(app)
      .post(`/api/evidence/${testEvidenceId}/verify`)
      .set('Authorization', `Bearer ${investigatorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.match).toBe(true);
    expect(response.body.baselineHash).toBe(response.body.currentHash);
    expect(response.body.integrityStatus).toBe('Verified');
    expect(response.body.verifiedAt).toBeDefined();

    // Verify database document was updated
    const updatedEvidence = await EvidenceFile.findById(testEvidenceId);
    expect(updatedEvidence.integrityStatus).toBe('Verified');

    // Verify Chain of Custody recorded a VERIFY_PASS event
    const passLog = await ChainOfCustodyLog.findOne({
      evidenceId: testEvidenceId,
      action: 'VERIFY_PASS',
    });
    expect(passLog).not.toBeNull();
    expect(passLog.role).toBe('INVESTIGATOR');
    expect(passLog.performedBy).toBe('Inspector Miller');
    expect(passLog.details).toContain('Integrity verified');
  });

  /**
   * TC-05: Modifying file bytes triggers match: false with a VERIFY_FAIL log in the database.
   *
   * Verifies that:
   * 1. If an adversary or storage corruption modifies bytes in the stored evidence file,
   *    the verification endpoint detects the cryptographic mismatch.
   * 2. The endpoint returns HTTP 200 with match: false and integrityStatus: 'Tampered'.
   * 3. The baselineHash and currentHash values differ in the response.
   * 4. The EvidenceFile document is updated to 'Tampered'.
   * 5. An immutable VERIFY_FAIL entry is recorded in the Chain of Custody ledger with tamper details.
   */
  test('TC-05: Modifying file bytes triggers match: false with a VERIFY_FAIL log in the database', async () => {
    // Tamper with the physical file on disk by appending unauthorized bytes
    const targetFilePath = path.join(UPLOADS_DIR, testStoredFilename);
    expect(fs.existsSync(targetFilePath)).toBe(true);

    const maliciousBytes = '\n[TAMPER_INJECTION_HEX_DEADBEEF: UNAUTHORIZED MODIFICATION DETECTED]';
    fs.appendFileSync(targetFilePath, maliciousBytes, 'utf-8');

    const response = await request(app)
      .post(`/api/evidence/${testEvidenceId}/verify`)
      .set('Authorization', `Bearer ${investigatorToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.match).toBe(false);
    expect(response.body.baselineHash).not.toBe(response.body.currentHash);
    expect(response.body.integrityStatus).toBe('Tampered');

    // Verify database document was updated to Tampered state
    const tamperedEvidence = await EvidenceFile.findById(testEvidenceId);
    expect(tamperedEvidence.integrityStatus).toBe('Tampered');

    // Verify Chain of Custody recorded a VERIFY_FAIL audit log
    const failLog = await ChainOfCustodyLog.findOne({
      evidenceId: testEvidenceId,
      action: 'VERIFY_FAIL',
    });
    expect(failLog).not.toBeNull();
    expect(failLog.role).toBe('INVESTIGATOR');
    expect(failLog.performedBy).toBe('Inspector Miller');
    expect(failLog.details).toContain('TAMPER DETECTED');
  });
});
