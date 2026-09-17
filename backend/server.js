const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('./src/config/db');

const app = express();

// ── Core Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SECURITY: Never serve uploads statically ──────────────────
// Evidence files are streamed exclusively through authenticated
// API routes (GET /api/evidence/:id/file). The uploads/ directory
// must NEVER be exposed via express.static().

// ── Health-check route ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CyberTrace API',
    timestamp: new Date().toISOString(),
  });
});

// ── Route Mounts ──────────────────────────────────────────────
const authRoutes = require('./src/routes/authRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');
const caseRoutes = require('./src/routes/caseRoutes');
const evidenceRoutes = require('./src/routes/evidenceRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/admin', adminRoutes);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`[CyberTrace] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
