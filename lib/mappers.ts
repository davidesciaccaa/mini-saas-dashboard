/**
 * lib/mappers.ts
 *
 * Converts raw PostgreSQL rows to canonical application types.
 *
 * Why this exists:
 *   - node-postgres returns NUMERIC columns as strings (not numbers).
 *   - TIMESTAMPTZ columns come back as JS Date objects, not ISO strings.
 *   - Centralising these coercions keeps the service layer free of
 *     ad-hoc casts and makes the shape contract explicit.
 */

import type { Project, ProjectStatus } from '@/types/project';

/** Shape of a raw row as node-postgres returns it from the DB. */
export interface ProjectRow {
  id: string;
  title: string;
  status: string;           // matches ProjectStatus values, but untyped from pg
  deadline: string;         // DATE cast to text in SQL → "YYYY-MM-DD"
  assignedTo: string;       // aliased in SQL as "assignedTo"
  budget: string | number;  // NUMERIC → string from pg driver
  createdAt: Date | string; // TIMESTAMPTZ → JS Date from pg driver
  updatedAt: Date | string; // TIMESTAMPTZ → JS Date from pg driver
}

/**
 * Maps a raw DB row to the Project application type.
 *
 * Guarantees:
 *   - `budget`    is a JS number
 *   - `deadline`  is a "YYYY-MM-DD" string
 *   - `createdAt` / `updatedAt` are ISO-8601 strings
 *   - `status`    is cast to the ProjectStatus union
 */
export function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    status: row.status as ProjectStatus,
    deadline: toDateString(row.deadline),
    assignedTo: row.assignedTo,
    budget: Number(row.budget),
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a value that may be a JS Date or an ISO string to a plain
 * ISO-8601 string (e.g. "2026-09-30T00:00:00.000Z").
 */
function toISOString(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  // Already a string — normalise to ISO just in case it isn't already.
  return new Date(value).toISOString();
}

/**
 * Ensures a deadline value is always a bare "YYYY-MM-DD" string,
 * regardless of whether the DB returned a Date object or a text cast.
 */
function toDateString(value: Date | string): string {
  if (value instanceof Date) {
    // Use UTC parts to avoid local-timezone offset shifting the date.
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Text cast from SQL (deadline::text) → already "YYYY-MM-DD".
  return value;
}
