---
title: Table vs Cards

layer: Reasoning

node_type: Decision Rule

purpose: |
  Help AI determine when information should be presented as a table
  versus a card-based layout.

source:
  - Design Principles
  - UX Inference

confidence: High

consumers:
  - AI Design Agent
  - Designers

relationships:
  - Design Principles
  - Decision Framework
  - Portfolio
  - Benchmark
  - Performance Attribution

tags:
  - tradeoff
  - layout

status: Draft

last_updated: 2026-07-15
---

# Purpose

Determine the most appropriate presentation for structured information based on the user's task.

The decision should be driven by the type of analysis users are performing rather than visual preference.

---

# Use a Table when...

The user's primary task is to:

- Compare multiple records
- Scan large datasets
- Sort information
- Filter information
- Review many attributes simultaneously
- Identify trends across rows
- Perform analytical work

Examples:

- Portfolio holdings
- Security lists
- Performance reports
- Risk metrics
- Attribution breakdowns

---

# Use Cards when...

The user's primary task is to:

- Browse a small number of items
- Explore summaries
- Understand individual entities
- Consume high-level information
- Focus on one object at a time

Examples:

- Dashboard summaries
- Insight recommendations
- Portfolio overview
- Featured opportunities

---

# Tradeoffs

## Tables

Advantages

- Excellent for comparison
- High information density
- Supports sorting and filtering
- Efficient for expert users

Limitations

- Less suitable for storytelling
- Can overwhelm new users
- Poor for visual hierarchy when datasets are small

---

## Cards

Advantages

- Easy to scan individually
- Better visual hierarchy
- More approachable
- Flexible layouts

Limitations

- Difficult to compare many items
- Consumes more space
- Reduces information density

---

# Decision Rule

Choose a **Table** when the user's goal is analytical comparison.

Choose **Cards** when the user's goal is exploration or summary.

When both needs exist, combine both approaches:

- Cards for high-level summaries
- Tables for detailed analysis

---

# AI Interpretation

Before selecting a layout, ask:

1. Is the user comparing many items?
2. Does the user need sorting or filtering?
3. Will users inspect multiple attributes simultaneously?

If the answer to most of these questions is **Yes**, prefer a table.

Otherwise, consider cards.

Never choose cards solely because they appear more modern.

---

# Related Knowledge

- [[Design Principles]]
- [[Decision Framework]]
- [[Portfolio]]
- [[Benchmark]]

---

# References

- Design Principles