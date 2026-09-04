# Demo journey

```
Specification (specs/)
    ↓
Implementation generated from specs
    ↓
Seeded SQLite (data/samples CSV → demo.sqlite)
    ↓
Operator: npm run login (optional Vertex) + npm run demo
    ↓
User opens floating Kopilot dock (Bahasa Indonesia)
    ↓
Agent creates governed QueryPlan (Vertex or mock)
    ↓
Validate → compile (company-scoped SQL) → SQLite
    ↓
Answer + evidence + chart (typewriter text; charts immediate)
    ↓
User: "Tambahkan investigasi ini ke dasbor eksekutif"
    ↓
DashboardSpec updated → Dasbor surface renders
```

## Scripted prompts (Bahasa Indonesia)

Use the active company (default **TokoRaya Digital**). Prompts may vary slightly per sector via `company-prompts`.

1. `Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?`
2. `Kenapa Sumatera turun?` *(demo driver: intentional August Sumatera decline)*
3. `Tambahkan investigasi ini ke dasbor eksekutif.`
4. `Ganti wilayah dengan segmen pelanggan.`

Optional: `Tampilkan pendapatan per wilayah selama enam bulan terakhir.`

## Demo clock

**As-of date:** `2026-09-05` (fixed in `src/server/analytics/time-range.ts`).

- “Bulan lalu” / `last_month` → **2026-08-01 … 2026-08-31**
- Comparison `previous_period` → July 2026
- Intentional seed pattern: **Sumatera** completed revenue drop in August 2026 (strongest on TokoRaya)

## Surfaces touched

| Step | Surface |
|------|---------|
| Ask / explain | Floating Kopilot dock |
| Evidence / QueryPlan | Dock extras + Jejak |
| Persist | Dasbor |
| Semantic vocabulary | Model Semantik |
