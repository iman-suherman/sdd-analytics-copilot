# Implementation roadmap

## Phase 1 — Foundation
Next.js monolith, SQLite schema, company switcher, `npm run demo`. Exit: surfaces reachable (SDD-001, 009).

## Phase 2 — Dataset + semantic model
CSV profiles + seed/export, `commerce.yaml`, DEMO_AS_OF clock (SDD-002, 003, 010, 011).

## Phase 3 — Analytics engine
QueryPlan Zod, validation, company-scoped SQL compiler, execution, evidence (SDD-005).

## Phase 4 — Copilot (mock)
Chat API, mock agent, conversation persistence, traces (SDD-004, 008).

## Phase 5 — Evidence and visualisation
Chart recommendation, ECharts, Bahasa formatting (SDD-006, 010).

## Phase 6 — Dashboard DSL
DashboardSpec, renderer, agent patches (SDD-007, ADR-004).

## Phase 7 — Copilot dock UX
Floating bubble, resize, fullscreen, typewriter, deep-links (SDD-012).

## Phase 8 — Vertex + GCP ops
`npm run login`, ADC, Vertex plan/narrate, mock fallback (SDD-013, ADR-007).

## Phase 9 — SDD showcase
Spec traces UI, acceptance tests, regeneration prompts under `specs/regeneration/`.
