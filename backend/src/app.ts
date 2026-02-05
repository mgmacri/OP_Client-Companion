import Fastify from 'fastify';
import type { DbHandle } from './db.js';
import { LogRepository } from './logRepository.js';
import { registerLogRoutes } from './routes/logs.js';

export type BuildAppOptions = {
  db: DbHandle;
};

export async function buildApp({ db }: BuildAppOptions) {
  const app = Fastify({ logger: false });

  const repo = new LogRepository(db);
  await registerLogRoutes(app, { repo });

  return app;
}
