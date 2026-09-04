# P1 — data + ops (OWNED PATHS ONLY)

You are agent **P1-data-ops** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `data/csv-io.ts`
- `data/csv-profiles.ts`
- `data/export-csv.ts`
- `data/seed.ts`
- `scripts/gcp-adc-login.cjs`
- `scripts/gcp-config.cjs`
- `scripts/gcp-lib-adc.cjs`
- `scripts/prompt-gcp-email.cjs`
- `scripts/prompt-gcp-project.cjs`
- `scripts/generate-env.cjs`
- `scripts/terminal-colors.cjs`

Do **not** edit `src/`, `tests/`, or `package.json`.

## Specs
- `specs/requirements/SDD-002-demo-dataset.md`, `SDD-011-csv-seed-pipeline.md`, `SDD-013-vertex-ops.md`
- `specs/domain/csv-profiles.md`, `company.md`
- `specs/regeneration/prompts/regenerate-data-and-ops.md`
- `specs/regeneration/scripts-inventory.md`
- `specs/regeneration/contracts/database-schema.ts.txt` (seed must create matching tables)
- Keep using existing `data/samples/**` CSVs

## Must export
- `seedDatabase(dbPath?: string): void` from `data/seed.ts` — used by tests and `ensure.ts` (other agents). Prefer CSV seed; support `--generate`. Sumatera August 2026 decline for tokoraya. Seed executive dashboards per company. Default DB `data/demo.sqlite`.
- Default GCP project `personal-suherman`. Scripts write `.gcloud/application_default_credentials.json` and upsert `.env`.

## Done when
All owned files exist; `npx tsx -e "import('./data/seed.ts')"` typechecks conceptually; seed prefers samples.
