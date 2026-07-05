// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const { getAllowedOrigins, getListenHost, isOriginAllowed } = require('./config');

// Importar modelos
require('./models/Teacher');
require('./models/Student');
require('./models/Attendance');
require('./models/Grade');
require('./models/Section');
require('./models/Parent');

// Importar rutas
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const sectionRoutes = require('./routes/sections');
const parentRoutes = require('./routes/parents');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = getListenHost();
const ALLOWED_ORIGINS = getAllowedOrigins();

const smtpIsConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
console.log(`✉️ SMTP status: ${smtpIsConfigured ? 'configured' : 'not configured'} (set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for real email sending)`);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin, ALLOWED_ORIGINS)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf && buf.toString();
  }
}));

// Rutas principales
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/parents', parentRoutes);

// Manejador de errores de JSON malformado (body-parser / express.json)
app.use((err, req, res, next) => {
  if (err && err.status === 400 && err.type === 'entity.parse.failed') {
    console.error('❌ Malformed JSON received:', { method: req.method, path: req.path, rawBody: req.rawBody });
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err && err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }
  next(err);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Si estamos en producción, servir el build del frontend
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildPath = path.join(__dirname, '..', 'ctp-platanar-frontend', 'build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

function startServer() {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('📦 Tablas sincronizadas correctamente');
      app.listen(PORT, HOST, () => {
        console.log(`🚀 Servidor corriendo en http://${HOST}:${PORT}`);
        console.log(`🌐 Orígenes permitidos: ${ALLOWED_ORIGINS.join(', ')}`);
      });
    })
    .catch(err => {
      console.error('❌ Error al sincronizar la base de datos:', err);
    });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
