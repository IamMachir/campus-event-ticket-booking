const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Runs all .sql migration files in order on server startup.
 * Tracks applied migrations in a `_migrations` table so each only runs once.
 */
async function runMigrations() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );

  const migrationsDir = path.join(__dirname, '../../migrations');
  if (!fs.existsSync(migrationsDir)) return;

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  const [applied] = await db.query('SELECT filename FROM _migrations');
  const appliedSet = new Set(applied.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    const statements = sql.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    await db.query('INSERT INTO _migrations (filename) VALUES (?)', [file]);
    console.log(`Migration applied: ${file}`);
  }
}

module.exports = { runMigrations };
