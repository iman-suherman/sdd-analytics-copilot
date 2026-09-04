# ADR-004: Dashboard DSL

## Decision

Dashboards are JSON documents (`DashboardSpec` / `WidgetSpec`) rendered by a generic React renderer.

## Rationale

Agent mutations become schema-validated patches instead of codegen. Specs stay reviewable and testable.
