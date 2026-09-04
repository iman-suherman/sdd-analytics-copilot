# Domain: CSV profiles

Canonical SQLite columns vs per-company CSV headers. Source of truth implementation: `data/csv-profiles.ts`.

## Canonical tables

| Table | Columns |
|-------|---------|
| customers | id, company_id, name, segment, region, created_at |
| products | id, company_id, name, category, price |
| orders | id, company_id, customer_id, order_date, status, net_amount |
| order_items | id, company_id, order_id, product_id, quantity, amount |

## Marketplace profile (`tokoraya`, `bukadagang`, `belinusa`)

| File | CSV → SQL |
|------|-----------|
| sellers.csv | seller_id→id, seller_name→name, seller_tier→segment, onboarded_at→created_at |
| listings.csv | sku→id, listing_title→name, list_price_idr→price |
| orders.csv | order_id→id, seller_id→customer_id, fulfillment_status→status, gmv_idr→net_amount |
| order_lines.csv | line_id→id, sku→product_id, units→quantity, line_gmv_idr→amount |

## On-demand (`gocepat`)

| File | Notable headers |
|------|-----------------|
| partners.csv | partner_id, partner_type, service_city_region, joined_at |
| services.csv | service_id, service_category, base_fare_idr |
| bookings.csv | booking_id, booked_at, booking_status, fare_idr |
| booking_legs.csv | leg_id, fare_component_idr |

## Travel (`jelajahid`)

| File | Notable headers |
|------|-----------------|
| travelers.csv | traveler_id, traveler_segment, origin_region, member_since |
| packages.csv | package_id, travel_category, package_price_idr |
| trip_bookings.csv | booking_id, travel_date, booking_value_idr |
| trip_lines.csv | stay_line_id, guests, line_amount_idr |

## Logistics (`angkutprima`)

| File | Notable headers |
|------|-----------------|
| shippers.csv | shipper_id, shipper_segment, origin_hub, contract_start |
| cargo_services.csv | service_sku, cargo_type, rate_idr |
| shipments.csv | shipment_id, ship_date, shipment_status, revenue_idr |
| parcels.csv | parcel_id, parcels, charge_idr |

Round-trip: `data:export-csv` inverts maps; `db:seed` applies maps.
