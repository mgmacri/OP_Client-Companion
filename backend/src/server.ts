import { openDb } from './db.js';
import { buildApp } from './app.js';

const port = Number(process.env.PORT ?? '8787');
const host = process.env.HOST ?? '127.0.0.1';
const dbPath = process.env.DB_PATH ?? 'op_client_companion.sqlite';

const db = await openDb({ dbPath });
const app = await buildApp({ db });

app.addHook('onClose', async () => {
	db.close();
});

await app.listen({ port, host });
