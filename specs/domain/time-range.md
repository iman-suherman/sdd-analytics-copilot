# Domain: Time range

## Fixed clock

```
DEMO_AS_OF = 2026-09-05   // ISO date, not Date.now()
```

File: `src/server/analytics/time-range.ts`.

## Supported `time.range` values

`last_month` | `previous_month` | `last_7_days` | `last_30_days` | `last_90_days` | `last_6_months` | `last_12_months` | `ytd` | `all_time`

## Comparison

When `comparison: "previous_period"`, execute the same metric for the immediately preceding window of equal length (for `last_month` → prior calendar month).

## Demo implication

Questions about “bulan lalu” always hit **August 2026**, preserving the Sumatera decline story indefinitely.
