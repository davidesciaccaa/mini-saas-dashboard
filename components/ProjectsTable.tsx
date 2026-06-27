"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/types/project";

const STATUS_STYLES: Record<Project["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  on_hold: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  completed: "bg-sky-500/15    text-sky-400    ring-1 ring-sky-500/30",
};

const STATUS_LABELS: Record<Project["status"], string> = {
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
};

type StatusFilter = "all" | Project["status"];

interface Props {
  projects: Project[];
}

type ModalState = "create" | Project | null;

const EMPTY_FORM = {
  title: "",
  status: "active" as Project["status"],
  assignedTo: "",
  deadline: "",
  budget: "",
};

export default function ProjectsTable({ projects: initialProjects }: Props) {
  const [list, setList] = useState<Project[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function refetch() {
    const res = await fetch("/api/projects");
    if (res.ok) setList(await res.json());
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setModal("create");
  }

  function openEdit(project: Project) {
    setForm({
      title: project.title,
      status: project.status,
      assignedTo: project.assignedTo,
      deadline: project.deadline,
      budget: String(project.budget),
    });
    setModal(project);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    await refetch();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      title: form.title,
      status: form.status,
      assignedTo: form.assignedTo,
      deadline: form.deadline,
      budget: Number(form.budget),
    };
    if (modal === "create") {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else if (modal !== null) {
      await fetch(`/api/projects/${(modal as Project).id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    setSubmitting(false);
    setModal(null);
    await refetch();
  }

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return list.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        project.title.toLowerCase().includes(query) ||
        project.assignedTo.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [list, searchTerm, statusFilter]);

  const hasActiveFilters = searchTerm.trim().length > 0 || statusFilter !== "all";
  const isEditing = modal !== null && modal !== "create";

  return (
    <>
      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <h2 className="mb-5 text-lg font-semibold text-slate-100">
              {isEditing ? "Edit Project" : "Create Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as Project["status"] })
                  }
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Assigned To
                </label>
                <input
                  required
                  type="text"
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Deadline
                </label>
                <input
                  required
                  type="date"
                  value={form.deadline}
                  onChange={(e) =>
                    setForm({ ...form, deadline: e.target.value })
                  }
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Budget (USD)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="h-10 rounded-md border border-white/10 px-4 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/8"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50"
                >
                  {submitting ? "Saving…" : isEditing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {list.length === 0 ? (
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
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 h-10 rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Create Project
          </button>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/4 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="project-search">
                Search projects
              </label>
              <input
                id="project-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects or team..."
                className="h-10 w-full rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 sm:max-w-sm"
              />

              <label className="sr-only" htmlFor="project-status">
                Filter by status
              </label>
              <select
                id="project-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-10 rounded-md border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 md:justify-end">
              <p className="text-sm text-slate-400">
                {filteredProjects.length} shown
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="h-10 rounded-md border border-white/10 px-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/8"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={openCreate}
                className="h-10 rounded-md bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Create Project
              </button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-200">
                No matching projects
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Adjust the search text or status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3">Deadline</th>
                    <th className="px-6 py-3 text-right">Budget</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProjects.map((project) => (
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
                      <td className="px-6 py-4 text-slate-300">
                        {project.assignedTo}
                      </td>
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(project)}
                            className="rounded px-2 py-1 text-xs font-medium text-sky-400 transition hover:bg-sky-400/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project.id)}
                            className="rounded px-2 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-400/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}
