# AI Agent Instructions

## Goal

Build production-ready SaaS application.

## Stack

Frontend:

- Next.js 15
- React 19
- TypeScript

Styling:

- Tailwind CSS
- Shadcn UI
- Aceternity UI
- Magic UI

Backend:

- Supabase

Database:

- PostgreSQL

Deployment:

- Vercel

State:

- TanStack Query
- Zustand

Validation:

- Zod

Forms:

- React Hook Form

---

# Rules

Always:

- Use TypeScript strict mode
- Use feature-based architecture
- Use reusable components
- Use server components by default
- Use server actions where possible
- Use Zod validation
- Use TanStack Query

Never:

- Use any
- Duplicate business logic
- Put database logic inside UI components

---

# Multi Tenant

Every business table must contain:

tenant_id

All queries must be tenant-scoped.

---

# Database

All tables must support:

- created_at
- updated_at
- deleted_at

Soft delete required.
