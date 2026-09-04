Feature: SDD-007 Dashboard

  Scenario: Persist investigation to dashboard
    Given an analytics investigation about revenue decline
    When the user says "Add this investigation to an executive dashboard"
    Then a DashboardSpec is saved
    And the Dashboard surface can render widgets from the spec
