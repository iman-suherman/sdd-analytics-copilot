# Ops scripts inventory

All operator scripts that MUST be regenerated with the app (see SDD-011, SDD-013).

## npm

| Script | Implementation | Spec |
|--------|----------------|------|
| `demo` | `db:seed` + `next dev` | SDD-001 |
| `db:seed` | `data/seed.ts` (CSV preferred) | SDD-002, 011 |
| `db:seed:generate` | `data/seed.ts --generate` | SDD-002 |
| `data:export-csv` | `data/export-csv.ts` | SDD-011 |
| `login` | `scripts/gcp-adc-login.cjs` | SDD-013 |
| `generate-env` | `scripts/generate-env.cjs` | SDD-013 |
| `test` | vitest + `AGENT_BACKEND=mock` | SDD-004+ |

## scripts/

| File | Role |
|------|------|
| `gcp-adc-login.cjs` | Interactive ADC login + project + `.env` upsert |
| `gcp-config.cjs` | Resolve project/email; upsert env keys; default `personal-suherman` |
| `gcp-lib-adc.cjs` | Copy ADC into `.gcloud/application_default_credentials.json` |
| `prompt-gcp-email.cjs` | CLI email prompt |
| `prompt-gcp-project.cjs` | CLI project list/prompt (ensure default appears) |
| `generate-env.cjs` | Copy `.env.example` → `.env` if missing |
| `terminal-colors.cjs` | TTY styling for prompts |

## data/

| File | Role |
|------|------|
| `seed.ts` | Schema + CSV load or generator + dashboards |
| `export-csv.ts` | SQLite → sector CSVs |
| `csv-profiles.ts` | Column maps per company |
| `csv-io.ts` | CSV codec |
| `samples/**` | Exported sample data (source of truth for seed) |
