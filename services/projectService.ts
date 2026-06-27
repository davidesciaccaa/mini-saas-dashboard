/**
 * services/projectService.ts
 *
 * Data Access Layer for the Projects resource.
 * All PostgreSQL queries live here — route handlers MUST NOT import `pool` directly.
 *
 * Raw DB rows are converted to the canonical Project type via mapProject()
 * from lib/mappers.ts, which handles type coercions (NUMERIC → number,
 * TIMESTAMPTZ → ISO string, etc.).
 */

import pool from '@/lib/db';
import { mapProject, type ProjectRow } from '@/lib/mappers';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

// ---------------------------------------------------------------------------
// Shared RETURNING clause – keeps column list in one place.
// Columns are aliased to match the ProjectRow interface so mapProject()
// can reference them by camelCase name without extra transformation.
// ---------------------------------------------------------------------------
const RETURNING = `
  RETURNING
    id,
    title,
    status,
    deadline::text        AS "deadline",
    assigned_to           AS "assignedTo",
    budget,
    created_at            AS "createdAt",
    updated_at            AS "updatedAt"
`;

const SELECT_COLUMNS = `
  SELECT
    id,
    title,
    status,
    deadline::text        AS "deadline",
    assigned_to           AS "assignedTo",
    budget,
    created_at            AS "createdAt",
    updated_at            AS "updatedAt"
  FROM projects
`;

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function getAllProjects(): Promise<Project[]> {
  const { rows } = await pool.query<ProjectRow>(
    `${SELECT_COLUMNS} ORDER BY created_at DESC`
  );
  return rows.map(mapProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { rows } = await pool.query<ProjectRow>(
    `${SELECT_COLUMNS} WHERE id = $1`,
    [id]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

// ---------------------------------------------------------------------------
// WRITE
// ---------------------------------------------------------------------------

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const { rows } = await pool.query<ProjectRow>(
    `INSERT INTO projects (id, title, status, deadline, assigned_to, budget, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ${RETURNING}`,
    [id, input.title, input.status, input.deadline, input.assignedTo, input.budget, now, now]
  );
  return mapProject(rows[0]);
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project | null> {
  // Build a dynamic SET clause from only the provided fields.
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (input.title !== undefined)      { fields.push(`title = $${idx++}`);       values.push(input.title); }
  if (input.status !== undefined)     { fields.push(`status = $${idx++}`);      values.push(input.status); }
  if (input.deadline !== undefined)   { fields.push(`deadline = $${idx++}`);    values.push(input.deadline); }
  if (input.assignedTo !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(input.assignedTo); }
  if (input.budget !== undefined)     { fields.push(`budget = $${idx++}`);      values.push(input.budget); }

  if (fields.length === 0) return getProjectById(id); // nothing to update

  fields.push(`updated_at = $${idx++}`);
  values.push(new Date().toISOString());
  values.push(id); // WHERE clause param

  const { rows } = await pool.query<ProjectRow>(
    `UPDATE projects
     SET ${fields.join(', ')}
     WHERE id = $${idx}
     ${RETURNING}`,
    values
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
