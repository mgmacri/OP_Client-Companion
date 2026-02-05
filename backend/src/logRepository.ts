import type { DbHandle } from './db.js';

export type ClientLogEntryRow = {
  id: string;
  client_id: string;
  log_type: string;
  fields_json: string;
  consent: 0 | 1;
  submitted_at_utc: string;
  idempotency_key: string | null;
};

export type CreateLogInput = {
  id: string;
  client_id: string;
  log_type: string;
  fields: unknown;
  consent: boolean;
  submitted_at_utc: string;
  idempotency_key: string;
};

export class LogRepository {
  constructor(private readonly handle: DbHandle) {}

  findByIdempotencyKey(idempotency_key: string): ClientLogEntryRow | null {
    const stmt = this.handle.db.prepare(
      'SELECT id, client_id, log_type, fields_json, consent, submitted_at_utc, idempotency_key FROM client_log_entries WHERE idempotency_key = ?'
    );
    stmt.bind([idempotency_key]);
    try {
      if (!stmt.step()) {
        return null;
      }
      const row = stmt.getAsObject() as unknown as ClientLogEntryRow;
      return {
        id: String(row.id),
        client_id: String(row.client_id),
        log_type: String(row.log_type),
        fields_json: String(row.fields_json),
        consent: (Number(row.consent) as 0 | 1) ?? 0,
        submitted_at_utc: String(row.submitted_at_utc),
        idempotency_key: row.idempotency_key === null ? null : String(row.idempotency_key)
      };
    } finally {
      stmt.free();
    }
  }

  create(input: CreateLogInput): ClientLogEntryRow {
    const stmt = this.handle.db.prepare(
      'INSERT INTO client_log_entries (id, client_id, log_type, fields_json, consent, submitted_at_utc, idempotency_key) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    try {
      stmt.run([
        input.id,
        input.client_id,
        input.log_type,
        JSON.stringify(input.fields ?? null),
        input.consent ? 1 : 0,
        input.submitted_at_utc,
        input.idempotency_key
      ]);
    } finally {
      stmt.free();
    }

    this.handle.save();

    const created = this.findByIdempotencyKey(input.idempotency_key);
    if (!created) {
      throw new Error('INTERNAL_CREATE_FAILED');
    }
    return created;
  }
}
