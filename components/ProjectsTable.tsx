"use client";

import type { Project } from "@/types/project";

const STATUS_STYLES: Record<Project["status"], string> = {
  active:    "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  on_hold:   "bg-amber-500/15  text-amber-400  ring-1 ring-amber-500/30",
  completed: "bg-sky-500/15    text-sky-400    ring-1 ring-sky-500/30",
};

const STATUS_LABELS: Record<Project["status"], string> = {
  active:    "Active",
  on_hold:   "On Hold",
  completed: "Completed",
};

interface Props {
  projects: Project[];
}

export default function ProjectsTable({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          {/* folder icon */}
          <svg
            className="h-8 w-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-slate-200">No projects yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first project to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Assigned To</th>
            <th className="px-6 py-3">Deadline</th>
            <th className="px-6 py-3 text-right">Budget</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="bg-transparent transition-colors duration-150 hover:bg-white/4"
            >
              <td className="px-6 py-4 font-medium text-slate-100">
                {project.title}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLES[project.status]
                  }`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-300">{project.assignedTo}</td>
              <td className="px-6 py-4 text-slate-400">
                {new Date(project.deadline).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-right font-mono text-slate-300">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(project.budget)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
