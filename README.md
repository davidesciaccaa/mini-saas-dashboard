# Mini SaaS Dashboard

A full-stack project management dashboard built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- Project CRUD operations (Create, Read, Update, Delete)
- Project status tracking (active, on_hold, completed)
- Deadline management
- Team assignment support
- Budget tracking
- REST API built with Next.js Route Handlers
- Clean service-layer architecture

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL (node-postgres)
- REST API (Route Handlers)

## Architecture

The project follows a layered architecture:

- `app/api` → API routes (HTTP layer)
- `services/` → Business logic & DB queries
- `lib/` → Database connection pool
- `types/` → Shared TypeScript types
- `components/` → UI components

## Getting Started

```bash
npm install
npm run db:seed
npm run dev