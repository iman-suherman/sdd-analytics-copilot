# SDD-011 CSV seed pipeline

## Requirement

Commerce seed data SHALL be maintainable as **per-company CSV samples** with **business-specific column names**, mapped into canonical SQLite tables.

### Layout

```
data/samples/
  companies.csv
  {companyId}/
    README.md
    <sector-specific CSV files>
```

### Commands

| Script | Behaviour |
|--------|-----------|
| `npm run db:seed` | If `data/samples/companies.csv` exists → load CSVs into fresh `demo.sqlite`; else generate |
| `npm run db:seed:generate` | Procedural generator only (`--generate`) |
| `npm run data:export-csv` | Export current `demo.sqlite` → samples with sector column names |

### Column profiles (summary)

Profiles live in `data/csv-profiles.ts` / `specs/domain/csv-profiles.md`.

| Companies | customers file | products file | orders file | items file |
|-----------|----------------|---------------|-------------|------------|
| tokoraya, bukadagang, belinusa | `sellers.csv` | `listings.csv` | `orders.csv` | `order_lines.csv` |
| gocepat | `partners.csv` | `services.csv` | `bookings.csv` | `booking_legs.csv` |
| jelajahid | `travelers.csv` | `packages.csv` | `trip_bookings.csv` | `trip_lines.csv` |
| angkutprima | `shippers.csv` | `cargo_services.csv` | `shipments.csv` | `parcels.csv` |

Example marketplace map: `seller_id→id`, `gmv_idr→net_amount`, `list_price_idr→price`.

### Implementation modules

- `data/csv-io.ts` — parse/serialize CSV
- `data/csv-profiles.ts` — profiles
- `data/export-csv.ts` — export
- `data/seed.ts` — schema create + CSV or generator + executive dashboards

## Acceptance

- Given samples exported from a seeded DB
- When `demo.sqlite` is deleted and `npm run db:seed` runs
- Then company/order counts match the export summary
- And GoCepat files use `partner_id` / `fare_idr` headers (not generic `customer_id` in the CSV)
