# SDD-010 Locale and demo clock

## Requirement

### Locale

- Primary product language: **Bahasa Indonesia** (nav, Copilot answers, demo cards, dashboard titles such as “Ikhtisar Eksekutif”)
- Market geography: Indonesia regions (not APAC/EMEA)
- Money formatting: IDR via `id-ID`

### Demo clock

The analytics time engine SHALL treat “today” as fixed:

```
DEMO_AS_OF = 2026-09-05
```

Implemented in `src/server/analytics/time-range.ts`.

| Range | Meaning relative to DEMO_AS_OF |
|-------|--------------------------------|
| `last_month` | August 2026 |
| `previous_period` (with last_month) | July 2026 |
| `last_6_months` | Mar–Aug 2026 (inclusive window as implemented) |

Relative phrases in user prompts (“bulan lalu”, “enam bulan terakhir”) SHALL resolve through QueryPlan `time.range`, not wall-clock `Date.now()`.

## Acceptance

- Given DEMO_AS_OF is 2026-09-05
- When the agent plans `last_month` revenue
- Then evidence time window covers August 2026
- And Copilot narration for a revenue answer is in Bahasa Indonesia
