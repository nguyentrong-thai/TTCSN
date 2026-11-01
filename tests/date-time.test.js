const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDateTime } = require('../utils/dateTime');

test('formats order timestamps in Vietnam time regardless of process timezone', () => {
  const formatted = formatDateTime(new Date('2026-11-01T07:32:48.000Z'));

  assert.match(formatted, /14:32:48/);
  assert.match(formatted, /1\/11\/2026/);
});
