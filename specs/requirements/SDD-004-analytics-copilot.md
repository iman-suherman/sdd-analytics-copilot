# SDD-004 Conversational Analytics

## Requirement

The system SHALL allow a user to ask an analytical question using natural language.

The agent SHALL resolve requested business metrics against the configured semantic model.

The agent SHALL NOT directly execute arbitrary SQL.

The agent SHALL generate a QueryPlan.

The analytics engine SHALL validate the QueryPlan before database execution.

The system SHALL return:

- answer
- result data
- evidence
- visualisation recommendation
- QueryPlan

## Acceptance criteria

```gherkin
Scenario: Ask for monthly revenue
  Given the commerce semantic model is loaded
  And the SQLite demo database contains order data
  When the user asks "What was revenue last month?"
  Then the agent resolves the "revenue" metric
  And creates a governed QueryPlan
  And the analytics engine executes the query
  And the answer contains the resulting revenue
  And the evidence shows the metric definition
  And the execution trace is persisted
```
