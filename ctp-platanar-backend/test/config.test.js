const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllowedOrigins, getListenHost, isOriginAllowed } = require('../config');

test('getListenHost defaults to 0.0.0.0', () => {
  assert.equal(getListenHost(), '0.0.0.0');
});

test('getAllowedOrigins parses a comma-separated list', () => {
  assert.deepEqual(getAllowedOrigins('https://frontend.example.com,http://localhost:3000'), [
    'https://frontend.example.com',
    'http://localhost:3000'
  ]);
});

test('isOriginAllowed rejects origins outside the configured frontend list', () => {
  assert.equal(isOriginAllowed('https://evil.example.com', ['https://frontend.example.com']), false);
  assert.equal(isOriginAllowed('https://frontend.example.com', ['https://frontend.example.com']), true);
  assert.equal(isOriginAllowed(undefined, ['https://frontend.example.com']), true);
});
