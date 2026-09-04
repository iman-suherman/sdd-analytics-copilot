# SDD-002 Demo dataset

## Requirement

The system SHALL provide a deterministic multi-tenant Indonesian commerce dataset in SQLite.

### Canonical tables

`companies`, `customers`, `products`, `orders`, `order_items`, plus `conversations`, `messages`, `dashboards`, `agent_traces`.

Every commerce row SHALL include `company_id`.

### Tenants (fictional — not real trademarks)

| id | name | sector |
|----|------|--------|
| `tokoraya` | TokoRaya Digital | Marketplace |
| `gocepat` | GoCepat Nusantara | Super-app & On-demand |
| `bukadagang` | BukaDagang | Marketplace UMKM |
| `belinusa` | BeliNusa | E-commerce |
| `jelajahid` | JelajahID | Travel & Lifestyle |
| `angkutprima` | AngkutPrima | Logistik |

Default active company: **`tokoraya`**.

### Dimensions (seed vocabulary)

- Regions: `Jabodetabek`, `Jawa`, `Sumatera`, `Indonesia Timur`
- Segments: `Korporasi`, `Menengah`, `UMKM`
- Categories: `Elektronik`, `Fashion`, `F&B`, `Rumah Tangga`
- Currency semantics: **IDR** (display with `id-ID` locale)

### Scale (approximate, after seed)

Across all companies: ~2,480 customers, ~255 products, ~24k orders, ~48k order_items over 12 months ending August 2026.

### Intentional analytical pattern

For companies with `augustSumateraDrop` (TokoRaya, BukaDagang, AngkutPrima): **August 2026 Sumatera** completed revenue is materially lower than July 2026 Sumatera (demo diagnosis: logistics / volume shock).

### Seed sources

1. **Preferred:** `data/samples/**` CSVs via `npm run db:seed` (see SDD-011)
2. **Fallback:** procedural generator `npm run db:seed:generate`

## Acceptance

- Given `npm run db:seed`
- Then six companies exist and each has customers/products/orders
- And TokoRaya August 2026 Sumatera completed revenue is lower than July 2026 Sumatera
- And analytics SQL always filters by `company_id`
