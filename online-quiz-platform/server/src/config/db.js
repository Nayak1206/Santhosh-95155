import { createClient } from '@libsql/client';

let client = null;

export function initDb() {
  if (client) return client;

  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  }

  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  console.log('✅ Turso DB client initialized.');
  return client;
}

export function getDb() {
  if (!client) throw new Error('DB not initialized. Call initDb() first.');
  return client;
}
