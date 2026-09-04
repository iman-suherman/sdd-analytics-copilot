# Product vision

SDD Analytics Copilot is a **reference implementation** demonstrating Spec-Driven Development for agentic analytics software.

It proves that an AI analytics product can be specified first — requirements, semantic contracts, agent tools, and acceptance criteria — then implemented so every major capability is traceable from spec → code → test → runtime.

## Goals

1. Natural-language analytics over a realistic commerce dataset
2. Governed query planning (no arbitrary SQL from the model)
3. Evidence-backed answers with charts
4. Conversational dashboard authoring via declarative specs
5. Visible specification traces inside the product UI

## Non-goals (v1)

- Multi-tenant SaaS hardening
- Warehouse connectors / Snowflake / Kafka
- Separate microservices for agent, API, and UI
