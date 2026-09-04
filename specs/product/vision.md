# Product vision

**SDD Analytics Copilot** is a **reference implementation** demonstrating Spec-Driven Development for agentic analytics software.

It proves that an AI analytics product can be specified first — requirements, semantic contracts, agent tools, ops scripts, and acceptance criteria — then implemented so every major capability is traceable from spec → code → test → runtime.

If application source is deleted, these specs (plus `specs/regeneration/`) SHALL be sufficient to regenerate the full demo.

## Goals

1. Natural-language analytics over a realistic **Indonesian multi-tenant** commerce dataset
2. Governed query planning (**never** arbitrary SQL from the LLM)
3. Evidence-backed answers with charts (Bahasa Indonesia UI + narration)
4. Conversational dashboard authoring via declarative JSON specs
5. Visible specification and runtime traces inside the product UI
6. Floating Copilot dock usable from every page
7. Vertex AI (Gemini) for planning/narration via `npm run login` ADC, with deterministic mock fallback
8. CSV sample pipeline with **sector-specific columns** per company

## In scope (demo tenancy)

- Soft multi-tenancy: six fictional companies in one SQLite file, scoped by `company_id` / `x-company-id`
- Fixed demo clock `2026-09-05` so “bulan lalu” = August 2026

## Non-goals (v1)

- Full SaaS auth / SSO / org billing hardening
- Warehouse connectors (Snowflake / BigQuery / Kafka)
- Separate microservices for agent, API, and UI (keep Next.js monolith)
