import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export type Db = import('sql.js').Database;

export type DbHandle = {
  db: Db;
  save: () => void;
  close: () => void;
};

export type DbOptions = {
  dbPath: string;
};

function resolveSqlWasmPath(file: string): string {
  // backend/src/db.ts -> backend/node_modules/sql.js/dist/<file>
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, '..', 'node_modules', 'sql.js', 'dist', file);
}

export async function openDb({ dbPath }: DbOptions): Promise<DbHandle> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => resolveSqlWasmPath(file)
  });

  const db =
    dbPath !== ':memory:' && existsSync(dbPath)
      ? new SQL.Database(new Uint8Array(readFileSync(dbPath)))
      : new SQL.Database();

  migrate(db);

  const save = () => {
    if (dbPath === ':memory:') {
      return;
    }
    const binary = db.export();
    writeFileSync(dbPath, Buffer.from(binary));
  };

  const close = () => {
    // sql.js doesn't require close, but it exists and is safe.
    try {
      save();
    } finally {
      db.close();
    }
  };

  return { db, save, close };
}

export function migrate(db: Db): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS client_log_entries (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      log_type TEXT NOT NULL,
      fields_json TEXT NOT NULL,
      consent INTEGER NOT NULL,
      submitted_at_utc TEXT NOT NULL,
      idempotency_key TEXT UNIQUE
    );
  `);
}
