# SDD-008 Agent trace

## Requirement

Every Copilot turn SHALL persist a runtime trace with ordered steps (intent, metric resolution, QueryPlan, validation, SQL execution, analysis, answer).

The Trace UI SHALL list traces and reveal SQL/params for execution steps.

The Semantic Model surface SHALL show specification traces linking requirement → contract → implementation → tests → runtime.
