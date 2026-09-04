# SDD-002 Demo dataset

## Requirement

The system SHALL seed a deterministic SQLite commerce dataset with:

- customers, products, orders, order_items
- ~500 customers, ~50 products, ~5,000 orders across 12 months
- 4 regions and 3 customer segments
- An intentional **August APAC revenue decline** for analytical demos

## Acceptance

- Given `npm run db:seed`
- Then row counts are within expected ranges
- And August 2026 APAC completed revenue is materially lower than July 2026 APAC
