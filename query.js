const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Naanikikahani%4012345@db.ozdvhjcumeujfxodiawc.supabase.co:5432/postgres' });
client.connect();
client.query("SELECT tablename FROM pg_tables WHERE schemaname='public';", (err, res) => {
  console.log(res.rows.map(r => r.tablename));
  client.end();
});
