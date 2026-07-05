function parseAllowedOrigins(value) {
  if (!value) {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigins(value = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_URL || process.env.CORS_ORIGIN) {
  return parseAllowedOrigins(value);
}

function getListenHost(value = process.env.HOST || process.env.BIND_HOST) {
  return value || '0.0.0.0';
}

function isOriginAllowed(origin, allowedOrigins = getAllowedOrigins()) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

module.exports = {
  getAllowedOrigins,
  getListenHost,
  isOriginAllowed
};
