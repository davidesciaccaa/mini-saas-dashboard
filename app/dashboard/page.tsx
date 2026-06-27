import type { Metadata } from "next";
import ProjectsTable from "@/components/ProjectsTable";
import type { Project } from "@/types/project";

export const metadata: Metadata = {
  title: "Dashboard | Mini SaaS",
  description: "Manage your projects — view, create, filter and track all work in one place.",
};

/**
 * Dashboard page – Server Component.
 *
 * Fetches projects from the API route so the data layer stays consistent
 * with the client-side (no direct DB calls from a page).
 */
async function getProjects(): Promise<Project[]> {
  // Use an absolute URL so this works in both dev and production.
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/projects`, {
    // Opt out of caching so the table always shows fresh data.
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 md:px-12">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Projects
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {projects.length} project{projects.length !== 1 ? "s" : ""} total
        </p>
      </header>

      {/* ── Toolbar placeholder (search / filter / create — coming in Step 2) */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-white/5" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <ProjectsTable projects={projects} />
    </main>
  );
}
