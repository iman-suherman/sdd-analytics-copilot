Feature: SDD-004 Conversational Analytics

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
