# SDD-001 Workspace

## Requirement

The system SHALL provide a single-repo web application with four primary surfaces: Copilot, Dashboard, Semantic Model, and Trace.

The workspace SHALL load against a local SQLite demo database without external infrastructure.

## Acceptance

- Given a fresh clone
- When the operator runs `npm run demo`
- Then the app starts and the four surfaces are reachable
