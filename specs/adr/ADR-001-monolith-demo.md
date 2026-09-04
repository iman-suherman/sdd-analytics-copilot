# ADR-001: Monolith demo

## Decision

Ship a single Next.js repository containing UI, API routes, agent, analytics engine, and SQLite.

## Rationale

Makes requirement → implementation tracing trivial for an SDD demonstration. Split services can come later without changing the semantic contracts.
