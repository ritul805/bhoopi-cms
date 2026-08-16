/**
 * Shared connection helper for the db maintenance scripts.
 *
 * Enforces two rules:
 *   1. The connection string comes from the environment, never from source.
 *   2. Anything printed to the console has the password stripped out.
 */

const ENV_VAR = 'DATABASE_URL';

/**
 * Read the connection string from the environment, or exit with guidance.
 * @returns {string}
 */
function getConnectionString() {
  const value = process.env[ENV_VAR];

  if (!value || value.trim() === '') {
    console.error(
      [
        `Missing ${ENV_VAR}.`,
        '',
        'These scripts read the database connection string from the environment',
        'so that credentials are never committed to source control.',
        '',
        'Supply it for a single command:',
        `  ${ENV_VAR}="postgresql://user:password@host:5432/postgres" \\`,
        '    node scripts/db/list-tables.js',
        '',
        'Or load it from an untracked env file:',
        `  set -a && source .env.local && set +a`,
        '',
        'Never paste the connection string into a tracked file.',
      ].join('\n')
    );
    process.exit(1);
  }

  return value.trim();
}

/**
 * Strip the password from a connection string so it is safe to log.
 * @param {string} connectionString
 * @returns {string}
 */
function redact(connectionString) {
  try {
    const url = new URL(connectionString);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    // Not a parseable URL; do not risk echoing it back.
    return '<connection string>';
  }
}

module.exports = { ENV_VAR, getConnectionString, redact };
