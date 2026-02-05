import { describe, expect, it } from 'vitest';
import { openDb } from '../db.js';
import { buildApp } from '../app.js';

function isUtcIsoString(value: string): boolean {
  return /Z$/.test(value) && !Number.isNaN(Date.parse(value));
}

describe('POST /api/logs', () => {
  it('stamps submitted_at_utc server-side in UTC (#49)', async () => {
    const db = await openDb({ dbPath: ':memory:' });
    const app = await buildApp({ db });

    const res = await app.inject({
      method: 'POST',
      url: '/api/logs',
      payload: {
        client_id: 'c1',
        log_type: 'mood_diary',
        fields: { mood: 3 },
        consent: true,
        idempotency_key: 'k1'
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json() as { submitted_at_utc: string };
    expect(typeof body.submitted_at_utc).toBe('string');
    expect(isUtcIsoString(body.submitted_at_utc)).toBe(true);
  });

  it('ignores client-provided submitted_at_utc (#49)', async () => {
    const db = await openDb({ dbPath: ':memory:' });
    const app = await buildApp({ db });

    const res = await app.inject({
      method: 'POST',
      url: '/api/logs',
      payload: {
        client_id: 'c1',
        log_type: 'mood_diary',
        fields: { mood: 3 },
        consent: true,
        submitted_at_utc: '2000-01-01T00:00:00Z',
        idempotency_key: 'k2'
      }
    });

    expect(res.statusCode).toBe(201);
    const body = res.json() as { submitted_at_utc: string };
    expect(body.submitted_at_utc).not.toBe('2000-01-01T00:00:00Z');
    expect(isUtcIsoString(body.submitted_at_utc)).toBe(true);
  });

  it('returns same record on idempotent retry (#41) and keeps submitted_at_utc stable', async () => {
    const db = await openDb({ dbPath: ':memory:' });
    const app = await buildApp({ db });

    const first = await app.inject({
      method: 'POST',
      url: '/api/logs',
      payload: {
        client_id: 'c1',
        log_type: 'mood_diary',
        fields: { mood: 3 },
        consent: true,
        idempotency_key: 'k3'
      }
    });

    expect(first.statusCode).toBe(201);
    const firstBody = first.json() as { id: string; submitted_at_utc: string };

    const second = await app.inject({
      method: 'POST',
      url: '/api/logs',
      payload: {
        client_id: 'c1',
        log_type: 'mood_diary',
        fields: { mood: 3 },
        consent: true,
        idempotency_key: 'k3'
      }
    });

    expect(second.statusCode).toBe(200);
    const secondBody = second.json() as { id: string; submitted_at_utc: string };

    expect(secondBody.id).toBe(firstBody.id);
    expect(secondBody.submitted_at_utc).toBe(firstBody.submitted_at_utc);
  });

  it('rejects missing idempotency key deterministically (#41)', async () => {
    const db = await openDb({ dbPath: ':memory:' });
    const app = await buildApp({ db });

    const res = await app.inject({
      method: 'POST',
      url: '/api/logs',
      payload: {
        client_id: 'c1',
        log_type: 'mood_diary',
        fields: { mood: 3 },
        consent: true
      }
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toEqual({
      error_code: 'IDEMPOTENCY_KEY_REQUIRED',
      message: 'Idempotency key is required.'
    });
  });
});
