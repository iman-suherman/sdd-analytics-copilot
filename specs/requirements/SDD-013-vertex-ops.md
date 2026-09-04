# SDD-013 Vertex AI and GCP ops

## Requirement

### Agent backends

| Backend | When | Behaviour |
|---------|------|-----------|
| `vertex` | Default if ADC file + `GCP_PROJECT_ID` present | Gemini plans QueryPlan JSON + narrates answers |
| `mock` | `AGENT_BACKEND=mock`, tests, or missing ADC | Deterministic Bahasa rule agent |

Vitest SHALL force `AGENT_BACKEND=mock`.

### Hard boundary

The LLM SHALL **never** author or execute SQL. Only emit structured plans consumed by validate → compile → execute.

### Env (`.env.example`)

```
GCP_PROJECT_ID=personal-suherman
GOOGLE_APPLICATION_CREDENTIALS=.gcloud/application_default_credentials.json
VERTEX_AI_LOCATION=global
VERTEX_MODEL=gemini-2.5-flash
# AGENT_BACKEND=vertex|mock
```

### Scripts (must regenerate with the app)

| npm script | Entry | Purpose |
|------------|-------|---------|
| `login` | `scripts/gcp-adc-login.cjs` | Prompt email → `gcloud auth application-default login` → pick project (default `personal-suherman`) → copy ADC to `.gcloud/` → upsert `.env` |
| `generate-env` | `scripts/generate-env.cjs` | Create `.env` from `.env.example` if missing |

Supporting modules: `gcp-config.cjs`, `gcp-lib-adc.cjs`, `prompt-gcp-email.cjs`, `prompt-gcp-project.cjs`, `terminal-colors.cjs`.

Runtime helpers: `src/server/gcp/credentials.ts`, `vertex-client.ts`, `vertex-llm.ts`, `vertex-agent.ts`.

### Fallback

If Vertex planning/narration fails, the agent SHALL fall back to mock for that turn and record a trace step (`vertex_fallback`).

## Acceptance

- Given valid ADC after `npm run login`
- When Copilot answers without `AGENT_BACKEND=mock`
- Then traces include `backend: "vertex"` (or `vertex_plan`) steps
- Given `AGENT_BACKEND=mock`
- Then acceptance tests remain deterministic offline
