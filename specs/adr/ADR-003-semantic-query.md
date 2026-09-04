# ADR-003: Semantic query layer

## Decision

Natural language → QueryPlan → validated compile → parameterised SQL.

## Rationale

Prevents arbitrary SQL from the LLM, makes governance visible, and yields a testable contract at the QueryPlan boundary.
