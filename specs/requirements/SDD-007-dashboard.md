# SDD-007 Dashboard

## Requirement

Dashboards SHALL be stored as declarative JSON (`DashboardSpec`), not generated React source.

The agent SHALL be able to create and patch dashboards via structured operations (e.g. `replace_widget`).

The Dashboard UI SHALL render widgets by executing governed QueryPlans derived from the spec.

## Acceptance

```gherkin
Scenario: Persist investigation to dashboard
  Given an analytics investigation about revenue decline
  When the user says "Add this investigation to an executive dashboard"
  Then a DashboardSpec is saved
  And the Dashboard surface renders KPI, trend, and breakdown widgets
```
