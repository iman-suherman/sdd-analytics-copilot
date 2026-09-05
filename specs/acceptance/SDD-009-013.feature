Feature: SDD-009 Multi-tenant isolation
  Scenario: Same metric differs by company
    Given companies tokoraya and gocepat are seeded
    When revenue for last_month is executed for each company_id
    Then the numeric results may differ
    And each evidence SQL contains a company_id predicate

Feature: SDD-010 Demo clock
  Scenario: Last month resolves to August 2026
    Given DEMO_AS_OF is 2026-09-05
    When a QueryPlan uses time.range last_month
    Then the evidence time window is within August 2026

Feature: SDD-011 CSV seed
  Scenario: Seed from samples
    Given data/samples/companies.csv exists
    When npm run db:seed runs
    Then six companies and commerce rows are loaded
    And GoCepat sample files use partner_id headers

Feature: SDD-012 Copilot dock
  Scenario: Bubble opens analytics panel
    Given the app is running
    When the user opens the bottom-right bubble and sends a prompt
    Then while the agent request is in flight a visible status shows "Merencanakan & mengeksekusi…" with typing dots
    And that waiting state uses an explicit loading flag for the full round-trip (not useTransition isPending alone)
    And assistant text appears with typewriter behaviour
    And charts render when the payload includes result

Feature: SDD-013 Vertex ops
  Scenario: Mock backend for tests
    Given AGENT_BACKEND=mock
    When acceptance tests run
    Then the agent does not require Vertex ADC
