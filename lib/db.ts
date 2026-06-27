import { Pool } from 'pg';

console.log("DATABASE_URL =", process.env.DATABASE_URL);

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

const pool: Pool =
  process.env.NODE_ENV === 'production'
    ? createPool()
    : (globalThis._pgPool ??= createPool());

export default pool;