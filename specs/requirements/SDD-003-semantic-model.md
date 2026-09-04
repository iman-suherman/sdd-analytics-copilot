# SDD-003 Semantic model

## Requirement

The system SHALL expose a YAML semantic model (`semantic/commerce.yaml`) defining metrics and dimensions with **Bahasa Indonesia labels**.

The agent SHALL resolve business terms only against this model (see `specs/domain/semantic-model.md`).

## Metrics (minimum)

| id | label | definition |
|----|-------|------------|
| revenue | Pendapatan | sum completed `orders.net_amount` |
| orders | Pesanan | count distinct completed orders |
| customers | Pelanggan | count distinct customers |
| average_order_value | Nilai Rata-rata Pesanan | revenue / orders |

## Dimensions (minimum)

| id | label |
|----|-------|
| region | Wilayah |
| segment | Segmen |
| product_category | Kategori Produk |
| order_date | Tanggal Pesanan (time) |
