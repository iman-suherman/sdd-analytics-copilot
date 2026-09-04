# Prompt: regenerate data + ops scripts only

Use when `src/` still exists but `data/` seed pipeline and/or `scripts/` GCP login were deleted.

---

Rebuild the **CSV seed pipeline** and **GCP login scripts** for sdd-analytics-copilot using:

- `specs/requirements/SDD-011-csv-seed-pipeline.md`
- `specs/requirements/SDD-013-vertex-ops.md`
- `specs/domain/csv-profiles.md`
- `specs/domain/company.md`
- `specs/regeneration/README.md` (npm scripts section)

## Required files

### Data

- `data/csv-io.ts` — robust CSV parse/escape
- `data/csv-profiles.ts` — marketplace / gocepat / jelajahid / angkutprima column maps exactly as in the domain spec
- `data/export-csv.ts` — export `demo.sqlite` → `data/samples/{company}/…` + `companies.csv`
- `data/seed.ts` — create schema; prefer CSV load; `--generate` procedural path with Sumatera August drop; seed executive dashboards per company

### Scripts

- `scripts/gcp-adc-login.cjs` — email prompt → ADC login → project prompt (default personal-suherman) → sync `.gcloud/` → upsert `GCP_PROJECT_ID`, `GCP_USER_EMAIL`, `GOOGLE_APPLICATION_CREDENTIALS`
- `scripts/gcp-config.cjs`, `gcp-lib-adc.cjs`, `prompt-gcp-email.cjs`, `prompt-gcp-project.cjs`, `generate-env.cjs`, `terminal-colors.cjs`

### package.json scripts

`db:seed`, `db:seed:generate`, `data:export-csv`, `login`, `generate-env`

## Verify

```bash
npm run db:seed:generate
npm run data:export-csv
rm data/demo.sqlite
npm run db:seed
# counts should match
```
