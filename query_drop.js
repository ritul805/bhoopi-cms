const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Naanikikahani%4012345@db.ozdvhjcumeujfxodiawc.supabase.co:5432/postgres' });
client.connect();

const tablesToKeep = [
  'stories',
  'child_profiles',
  'generation_requests',
  'generated_stories',
  'analytics_events',
  'section_stories',
  'favorite_stories',
  'saved_stories',
  'episode_progress',
  'episodes',
  'story_favorites',
  'story_sessions',
  'story_categories',
  'profiles',
  'subscriptions',
  'notifications',
  'story_sections'
];

client.query("SELECT tablename FROM pg_tables WHERE schemaname='public';", async (err, res) => {
  const tables = res.rows.map(r => r.tablename);
  const tablesToDrop = tables.filter(t => !tablesToKeep.includes(t) && t !== 'admin_users');
  console.log("Dropping:", tablesToDrop);
  for (const table of tablesToDrop) {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
  }
  console.log("Dropped all Strapi extra tables.");
  client.end();
});
