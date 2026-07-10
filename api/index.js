const serverless = require('serverless-http');
const app = require('../ctp-platanar-backend/server');

module.exports = serverless(app);
