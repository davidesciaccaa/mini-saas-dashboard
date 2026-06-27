/**
 * app/api/projects/route.ts
 *
 * Handlers: GET /api/projects  |  POST /api/projects
 */

import { NextRequest } from 'next/server';
import { getAllProjects, createProject } from '@/services/projectService';
import type { CreateProjectInput } from '@/types/project';

export async function GET(_req: NextRequest) {
  try {
    const projects = await getAllProjects();
    return Response.json(projects);
  } catch (err) {
    console.error('[GET /api/projects]', err);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateProjectInput;

    // Basic validation
    if (!body.title || !body.status || !body.deadline || !body.assignedTo || body.budget == null) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const project = await createProject(body);
    return Response.json(project, { status: 201 });
  } catch (err) {
    console.error('[POST /api/projects]', err);
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
