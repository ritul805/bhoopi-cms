#!/usr/bin/env node
/**
 * List tables in the public schema. Read-only.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/db/list-tables.js
 *
 * The connection string is NEVER hardcoded. Supply it via the environment,
 * e.g. from an untracked .env.local, or inline for a single invocation.
 */

const { Client } = require('pg');
const { getConnectionString, redact } = require('./connection');

async function main() {
  const connectionString = getConnectionString();
  const client = new Client({ connectionString });

  console.log(`Connecting to ${redact(connectionString)}`);
  await client.connect();

  try {
    const { rows } = await client.query(
      `SELECT tablename
         FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;`
    );

    if (rows.length === 0) {
      console.log('No tables found in schema "public".');
      return;
    }

    console.log(`\n${rows.length} table(s) in schema "public":`);
    for (const row of rows) {
      console.log(`  ${row.tablename}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
});
