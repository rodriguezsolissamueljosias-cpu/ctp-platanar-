// Lightweight adapter to run the existing Express app as a Vercel serverless function
// It requires that `ctp-platanar-backend/server.js` exports the Express `app` (it does).
const server = require('./server');
const serverless = require('serverless-http');

module.exports = serverless(server);
