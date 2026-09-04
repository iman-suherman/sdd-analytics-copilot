# ADR-007 Vertex via ADC + mock fallback

## Decision

Use Google Gen AI SDK (`@google/genai`) with `vertexai: true` and project-local ADC from `npm run login`. Keep a deterministic mock agent for offline/tests.

## Consequences

- Copilot quality depends on Vertex IAM (`roles/aiplatform.user`) when online
- QueryPlan boundary is unchanged: model output is structured JSON only
