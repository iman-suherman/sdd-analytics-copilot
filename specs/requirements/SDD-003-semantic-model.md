# SDD-003 Semantic model

## Requirement

The system SHALL expose a YAML semantic model (`semantic/commerce.yaml`) defining metrics and dimensions.

The agent SHALL resolve business terms only against this model.

## Metrics (minimum)

- revenue (sum of completed `orders.net_amount`)
- orders (count distinct)
- customers (count distinct)
- average_order_value (calculated: revenue / orders)

## Dimensions (minimum)

- region, segment, product_category, order_date (time)
