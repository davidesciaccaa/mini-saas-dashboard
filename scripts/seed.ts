/**
 * scripts/seed.ts
 *
 * Seed script – creates the `projects` table (if not exists) and
 * inserts sample data.  Run once with:
 *
 *   npx tsx scripts/seed.ts
 *
 * Requires a running PostgreSQL instance with connection settings
 * matching your .env.local file.
 */
import pool from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── 1. Create table ───────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id           UUID         PRIMARY KEY,
        title        TEXT         NOT NULL,
        status       TEXT         NOT NULL CHECK (status IN ('active', 'on_hold', 'completed')),
        deadline     DATE         NOT NULL,
        assigned_to  TEXT         NOT NULL,
        budget       NUMERIC(12, 2) NOT NULL,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // ── 2. Insert sample rows ─────────────────────────────────────────────
    const now = new Date().toISOString();

    const samples = [
      {
        id: uuidv4(),
        title: 'Redesign Company Website',
        status: 'active',
        deadline: '2026-09-30',
        assignedTo: 'Alice Johnson',
        budget: 12000,
      },
      {
        id: uuidv4(),
        title: 'Mobile App MVP',
        status: 'active',
        deadline: '2026-10-15',
        assignedTo: 'Bob Smith',
        budget: 35000,
      },
      {
        id: uuidv4(),
        title: 'ERP Integration',
        status: 'on_hold',
        deadline: '2026-12-01',
        assignedTo: 'Carol White',
        budget: 55000,
      },
      {
        id: uuidv4(),
        title: 'Annual Report Dashboard',
        status: 'completed',
        deadline: '2026-06-01',
        assignedTo: 'David Lee',
        budget: 8500,
      },
      {
        id: uuidv4(),
        title: 'Security Audit & Hardening',
        status: 'active',
        deadline: '2026-08-20',
        assignedTo: 'Eva Martín',
        budget: 22000,
      },
    ];

    for (const p of samples) {
      await client.query(
        `INSERT INTO projects (id, title, status, deadline, assigned_to, budget, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.title, p.status, p.deadline, p.assignedTo, p.budget, now, now]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed complete – 5 projects inserted (or already existed).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
