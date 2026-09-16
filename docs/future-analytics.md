# Future analytics

The free Meritt dashboard is intentionally minimal. It answers four questions:

1. What is my current reputation?
2. How much customer feedback do I have?
3. Where is my QR code?
4. What should I do next?

The product still stores the data needed to interpret those answers more deeply later. Do not promise the features below to businesses yet. Do not display them as locked or coming-soon cards.

## Data already collected

Keep collecting and storing:

- `reputation_feedback.created_at`
- `reputation_feedback.business_id`
- `reputation_feedback.location_id`
- `reputation_feedback.qr_code_id`
- `reputation_feedback.verified`
- `reputation_feedback.experience_type`
- `reputation_feedback.would_recommend`
- `reputation_snapshots` and reputation history
- QR codes, labels, locations, and `scan_count`

Do not delete these fields to “simplify” the dashboard.

## Potential future paid modules

These are product areas, not current features.

### Reputation Trends

How has our reputation changed over the last 6 months?

### QR Performance

Which QR locations generate the most feedback?

### Location Comparison

Which location has the strongest reputation?

### Feedback Trends

What are customers consistently saying?

### Customer Experience

Are customers becoming more or less likely to recommend us?

### Reputation History

When did our reputation change?

### Advanced Analytics

Deeper interpretation across locations, time, and QR attribution.

## Implementation note

When these modules are built, they should live as separate dashboard areas rather than expanding the free home dashboard. The free home page should stay tiny.
