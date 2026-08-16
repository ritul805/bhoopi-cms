#!/usr/bin/env node
/**
 * Drop specific tables from the public schema.
 *
 * This replaces an earlier script that inverted the logic: it enumerated every
 * table, subtracted a hardcoded allowlist, and dropped the remainder. That is
 * fail-open — any table nobody remembered to add to the allowlist was deleted,
 * including tables added after the script was written.
 *
 * This version is fail-closed:
 *   - Nothing is dropped unless you name it explicitly on the command line.
 *   - Names are matched against tables the database actually reports, so a
 *     typo drops nothing and no caller-supplied string reaches the SQL.
 *   - Core application tables are protected and refused outright.
 *   - It prints a plan and exits. Passing --confirm is required to execute.
 *   - Execution is wrapped in a transaction and rolls back on any error.
 *
 * Usage:
 *   # See what would happen (safe, makes no changes):
 *   DATABASE_URL="postgresql://..." node scripts/db/drop-tables.js old_table another_table
 *
 *   # Actually drop them:
 *   DATABASE_URL="postgresql://..." node scripts/db/drop-tables.js old_table --confirm
 *
 * Flags:
 *   --confirm   Execute the drop. Without it, this is a dry run.
 *   --cascade   Use DROP TABLE ... CASCADE (also drops dependent objects).
 */

const { Client } = require('pg');
const { getConnectionString, redact } = require('./connection');

/**
 * Tables the CMS depends on. These are refused even if named explicitly;
 * removing one should be a deliberate, reviewed migration, not a script run.
 */
const PROTECTED_TABLES = new Set([
  'stories',
  'story_cards',
  'story_categories',
  'story_category_links',
  'story_sections',
  'section_stories',
  'episodes',
  'episode_progress',
  'profiles',
  'child_profiles',
  'admin_users',
  'subscriptions',
  'notifications',
  'analytics_events',
  'favorite_stories',
  'saved_stories',
  'story_favorites',
  'story_sessions',
  'generated_stories',
  'generation_requests',
]);

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const requested = args.filter((a) => !a.startsWith('--'));

  const unknown = [...flags].filter((f) => !['--confirm', '--cascade'].includes(f));
  if (unknown.length > 0) {
    console.error(`Unknown flag(s): ${unknown.join(', ')}`);
    process.exit(1);
  }

  return {
    requested,
    confirm: flags.has('--confirm'),
    cascade: flags.has('--cascade'),
  };
}

function usage() {
  console.error(
    [
      'No tables specified — nothing to do.',
      '',
      'Name each table you want dropped, explicitly:',
      '  node scripts/db/drop-tables.js legacy_table_a legacy_table_b',
      '',
      'That prints a plan without changing anything. Add --confirm to execute.',
      '',
      'Tip: run scripts/db/list-tables.js first to see what exists.',
    ].join('\n')
  );
  process.exit(1);
}

async function main() {
  const { requested, confirm, cascade } = parseArgs(process.argv);

  if (requested.length === 0) {
    usage();
  }

  const connectionString = getConnectionString();
  const client = new Client({ connectionString });

  console.log(`Connecting to ${redact(connectionString)}`);
  await client.connect();

  try {
    // Source of truth for what exists. Caller input is only ever compared
    // against this set, never interpolated into SQL directly.
    const { rows } = await client.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
    );
    const existing = new Set(rows.map((r) => r.tablename));

    const protectedHits = [];
    const missing = [];
    const toDrop = [];

    for (const name of requested) {
      if (PROTECTED_TABLES.has(name)) {
        protectedHits.push(name);
      } else if (!existing.has(name)) {
        missing.push(name);
      } else {
        toDrop.push(name);
      }
    }

    if (protectedHits.length > 0) {
      console.error(
        `\nRefusing to run. These tables are protected: ${protectedHits.join(', ')}`
      );
      console.error(
        'If you truly need to remove one, do it as a reviewed migration, not here.'
      );
      process.exit(1);
    }

    if (missing.length > 0) {
      console.warn(`\nNot found in schema "public" (skipping): ${missing.join(', ')}`);
    }

    if (toDrop.length === 0) {
      console.log('\nNothing to drop.');
      return;
    }

    console.log(`\nPlan — ${toDrop.length} table(s) would be dropped:`);
    for (const name of toDrop) {
      console.log(`  DROP TABLE "${name}"${cascade ? ' CASCADE' : ''};`);
    }

    if (!confirm) {
      console.log(
        '\nDry run. No changes made. Re-run with --confirm to execute.'
      );
      return;
    }

    console.log('\nExecuting inside a transaction...');
    await client.query('BEGIN');
    try {
      for (const name of toDrop) {
        // `name` came from pg_tables above, so it is a real identifier.
        // Quote it anyway to handle mixed case and reserved words.
        const quoted = `"${name.replace(/"/g, '""')}"`;
        await client.query(`DROP TABLE ${quoted}${cascade ? ' CASCADE' : ''};`);
        console.log(`  dropped ${name}`);
      }
      await client.query('COMMIT');
      console.log(`\nCommitted. ${toDrop.length} table(s) dropped.`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`\nError during drop — rolled back, no tables removed.`);
      throw err;
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(`\nFailed: ${err.message}`);
  process.exit(1);
});
