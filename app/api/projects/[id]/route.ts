/**
 * app/api/projects/[id]/route.ts
 *
 * Handlers: PUT /api/projects/:id  |  DELETE /api/projects/:id
 *
 * Uses the RouteContext<> global helper (Next.js 16+) so params are
 * fully type-safe. params must be awaited (breaking change in v16).
 */

import { NextRequest } from 'next/server';
import { updateProject, deleteProject } from '@/services/projectService';
import type { UpdateProjectInput } from '@/types/project';

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as UpdateProjectInput;

    const updated = await updateProject(id, body);
    if (!updated) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    return Response.json(updated);
  } catch (err) {
    console.error('[PUT /api/projects/:id]', err);
    return Response.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/projects/[id]'>
) {
  try {
    const { id } = await ctx.params;
    const deleted = await deleteProject(id);
    if (!deleted) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err);
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
