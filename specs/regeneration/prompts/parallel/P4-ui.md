# P4 — UI (OWNED PATHS ONLY)

You are agent **P4-ui** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `src/app/copilot/page.tsx`, `src/app/dashboards/page.tsx`, `src/app/semantic-model/page.tsx`, `src/app/traces/page.tsx`
- `src/components/**`
- `src/lib/**`

Do **not** create `src/app/api/**`. Do not edit server or data.

## Specs
- `specs/requirements/SDD-001`, `SDD-010`, `SDD-012`
- `specs/product/demo-journey.md`
- `AGENTS.md` north star

## UX requirements
- Bahasa Indonesia copy throughout
- `CompanyProvider` + header company switcher (`x-company-id` / localStorage)
- Floating Copilot dock bottom-right: bubble, open chat, resize from top-left, fullscreen below ~`top-14` header, Esc/minimize, typewriter for assistant text, charts/evidence immediately
- Waiting state: explicit `loading` for the full `/api/agent/chat` round-trip (not `useTransition` `isPending` alone); visible Bahasa text `Merencanakan & mengeksekusi…` plus three dots (never `sr-only`)
- `CopilotProvider.ask(prompt)` used by home flow cards
- Home hero with TokoRaya demo cards for the 4-step journey
- `/copilot?q=` deep-link: open dock with prompt, redirect home
- Pages for dashboards, semantic model, traces calling `/api/*` with company header
- Tailwind 4 + existing logo under `public/logo.png`; company logos `public/companies/*`
- Keep visual language practical (product app, not marketing landing)

## Done when
All owned UI files exist and wire to the OpenAPI routes (even if API not yet present).
