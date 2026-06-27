/**
 * Project status enum – kept as a string union for portability across
 * the DB layer, API, and UI without needing a separate enum package.
 */
export type ProjectStatus = 'active' | 'on_hold' | 'completed';

export interface Project {
  id: string; // uuid
  title: string;
  status: ProjectStatus;
  deadline: string; // ISO-8601 date string (YYYY-MM-DD)
  assignedTo: string;
  budget: number;
  createdAt: string; // ISO-8601 datetime
  updatedAt: string; // ISO-8601 datetime
}

/** Payload shape for creating a new project (id / timestamps are server-generated). */
export type CreateProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

/** Payload shape for updating an existing project (all fields optional). */
export type UpdateProjectInput = Partial<CreateProjectInput>;
