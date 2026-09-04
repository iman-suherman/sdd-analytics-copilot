# Domain: Semantic model

Runtime file: `semantic/commerce.yaml` (Zod-validated by `semantic-schema.ts`).

## Model

- `model: commerce`
- `label: Analitik Perdagangan Indonesia`

## Metrics (ids)

| id | label | type |
|----|-------|------|
| revenue | Pendapatan | sum `orders.net_amount` where status=completed |
| orders | Pesanan | count_distinct orders.id completed |
| customers | Pelanggan | count_distinct customers.id |
| average_order_value | Nilai Rata-rata Pesanan | calculated revenue/orders |

## Dimensions (ids)

| id | label | field |
|----|-------|-------|
| region | Wilayah | customers.region |
| segment | Segmen | customers.segment |
| product_category | Kategori Produk | products.category |
| order_date | Tanggal Pesanan | orders.order_date (time) |

## Tables / joins

customers ← orders ← order_items → products (as declared in YAML).

The agent and compiler MAY only reference metric/dimension **ids** from this model (SDD-003, SDD-005).
