# Domain: Dashboard

```json
{
  "id": "executive-overview",
  "title": "Executive Overview",
  "widgets": [
    { "id": "revenue", "type": "kpi", "metric": "revenue", "comparison": "previous_period" },
    { "id": "revenue-trend", "type": "line", "metric": "revenue", "dimension": "order_date", "granularity": "month" },
    { "id": "region", "type": "bar", "metric": "revenue", "dimension": "region" }
  ]
}
```

Patch example:

```json
{
  "operation": "replace_widget",
  "widgetId": "region",
  "widget": { "id": "segment", "type": "bar", "metric": "revenue", "dimension": "segment" }
}
```
