# Demo journey

```
Specification
    ↓
Implementation generated from specs
    ↓
Seeded SQLite database
    ↓
User asks analytics question
    ↓
Agent creates governed query plan
    ↓
SQLite query executes
    ↓
Answer + evidence + chart
    ↓
User says "Add this to a dashboard"
    ↓
Dashboard spec is updated
    ↓
Dashboard renders
```

## Scripted prompts

1. `How was revenue last month compared with the previous month?`
2. `Why did APAC decline?`
3. `Add this investigation to an executive dashboard.`
4. `Replace region with customer segment.`

Demo clock: **2026-09-05** → last month = **August 2026**, with intentional APAC revenue decline in the seed.
