const fs = require('fs');
const path = require('path');
const db = require('../config/db');

function splitSqlStatements(sql) {
  const statements = [];
  let statement = '';
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const nextCharacter = sql[index + 1];

    if (lineComment) {
      statement += character;
      if (character === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      statement += character;
      if (character === '*' && nextCharacter === '/') {
        statement += nextCharacter;
        index += 1;
        blockComment = false;
      }
      continue;
    }

    if (quote) {
      statement += character;
      if (character === '\\' && nextCharacter) {
        statement += nextCharacter;
        index += 1;
      } else if (character === quote) {
        if (nextCharacter === quote) {
          statement += nextCharacter;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }

    if ((character === '-' && nextCharacter === '-' && /\s/.test(sql[index + 2] || ''))
      || character === '#') {
      statement += character;
      if (character === '-') {
        statement += nextCharacter;
        index += 1;
      }
      lineComment = true;
      continue;
    }

    if (character === '/' && nextCharacter === '*') {
      statement += character + nextCharacter;
      index += 1;
      blockComment = true;
      continue;
    }

    if (character === '\'' || character === '"' || character === '`') {
      quote = character;
      statement += character;
      continue;
    }

    if (character === ';') {
      if (statement.trim()) statements.push(statement.trim());
      statement = '';
      continue;
    }

    statement += character;
  }

  if (statement.trim()) statements.push(statement.trim());
  return statements;
}

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
    const statements = splitSqlStatements(sql);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    await db.query('INSERT INTO _migrations (filename) VALUES (?)', [file]);
    console.log(`Migration applied: ${file}`);
  }
}

module.exports = { runMigrations, splitSqlStatements };
