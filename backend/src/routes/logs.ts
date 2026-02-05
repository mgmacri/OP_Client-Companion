import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'node:crypto';
import { ERRORS } from '../errors.js';
import { LogRepository } from '../logRepository.js';

type PostLogsBody = {
  client_id?: unknown;
  log_type?: unknown;
  fields?: unknown;
  consent?: unknown;
  // NOTE: client may attempt to send this; it is always ignored.
  submitted_at_utc?: unknown;
  // Preferred: body field, but header is also supported.
  idempotency_key?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function getIdempotencyKey(request: FastifyRequest): string | null {
  const headerKey = request.headers['idempotency-key'];
  if (typeof headerKey === 'string' && headerKey.trim().length > 0) {
    return headerKey.trim();
  }
  return null;
}

export async function registerLogRoutes(app: FastifyInstance, opts: { repo: LogRepository }) {
  app.post('/api/logs', async (request: FastifyRequest<{ Body: PostLogsBody }>, reply: FastifyReply) => {
    const body = request.body ?? {};

    const client_id = isNonEmptyString(body.client_id) ? body.client_id : null;
    const log_type = isNonEmptyString(body.log_type) ? body.log_type : null;
    const consent = isBoolean(body.consent) ? body.consent : null;

    const idempotencyFromBody = isNonEmptyString(body.idempotency_key) ? body.idempotency_key.trim() : null;
    const idempotencyFromHeader = getIdempotencyKey(request);
    const idempotency_key = idempotencyFromBody ?? idempotencyFromHeader;

    if (!idempotency_key) {
      return reply.status(400).send(ERRORS.IDEMPOTENCY_KEY_REQUIRED);
    }

    if (!client_id || !log_type || consent === null) {
      return reply.status(400).send(ERRORS.VALIDATION_ERROR);
    }

    if (!consent) {
      return reply.status(400).send(ERRORS.CONSENT_REQUIRED);
    }

    // #49: server stamps UTC; ignore any client-provided submitted_at_utc.
    const submitted_at_utc = new Date().toISOString();

    const existing = opts.repo.findByIdempotencyKey(idempotency_key);
    if (existing) {
      return reply.status(200).send({
        id: existing.id,
        client_id: existing.client_id,
        log_type: existing.log_type,
        submitted_at_utc: existing.submitted_at_utc
      });
    }

    try {
      const created = opts.repo.create({
        id: crypto.randomUUID(),
        client_id,
        log_type,
        fields: body.fields,
        consent,
        submitted_at_utc,
        idempotency_key
      });

      return reply.status(201).send({
        id: created.id,
        client_id: created.client_id,
        log_type: created.log_type,
        submitted_at_utc: created.submitted_at_utc
      });
    } catch (err: unknown) {
      // If we lost a race and the unique constraint fired, return existing deterministically.
      const after = opts.repo.findByIdempotencyKey(idempotency_key);
      if (after) {
        return reply.status(200).send({
          id: after.id,
          client_id: after.client_id,
          log_type: after.log_type,
          submitted_at_utc: after.submitted_at_utc
        });
      }

      return reply.status(500).send(ERRORS.INTERNAL_ERROR);
    }
  });
}
