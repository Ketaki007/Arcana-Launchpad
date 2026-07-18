---
title: Chart vs Table

layer: Reasoning

node_type: Decision Rule

purpose: |
  Help AI determine whether information should be presented
  as a visualization or a table based on the user's task.

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
  - Performance Attribution
  - Risk

tags:
  - tradeoff
  - visualization

status: Draft

last_updated: 2026-07-15
---

# Purpose

Determine whether a chart or a table better supports the user's task.

The decision should be based on the type of insight users are seeking rather than visual preference.

---

# Use a Chart when...

The user's primary task is to:

- Understand trends over time
- Compare patterns
- Identify anomalies
- Explore distributions
- Understand relationships between variables
- Communicate high-level insights

Examples:

- Portfolio performance over time
- Risk trend
- Sector allocation
- Factor exposure
- Return distribution

---

# Use a Table when...

The user's primary task is to:

- Review exact values
- Compare multiple attributes
- Sort or filter information
- Inspect individual records
- Export or validate data

Examples:

- Holdings
- Attribution reports
- Transaction history
- Risk metrics
- Security lists

---

# Tradeoffs

## Charts

Advantages

- Reveal trends quickly
- Reduce cognitive effort for pattern recognition
- Excellent for summaries and storytelling

Limitations

- Poor for precise values
- Difficult to compare many attributes simultaneously
- Limited sorting and filtering

---

## Tables

Advantages

- Precise
- High information density
- Supports comparison, sorting and filtering

Limitations

- Trends are harder to identify
- Can overwhelm users when used for summaries

---

# Decision Rule

Choose a **Chart** when users need to understand patterns.

Choose a **Table** when users need to inspect details.

When both tasks are important:

- Use charts to summarize.
- Use tables to support detailed exploration.

---

# AI Interpretation

Before selecting a visualization, ask:

1. Is the user looking for patterns or exact values?
2. Will the user need sorting or filtering?
3. Is trend recognition more important than precision?

If understanding trends is the primary goal, prefer a chart.

If accuracy, comparison or detailed analysis is the primary goal, prefer a table.

Whenever possible, pair a chart with a supporting table instead of forcing users to choose one.

---

# Related Knowledge

- [[Design Principles]]
- [[Decision Framework]]
- [[Portfolio]]
- [[Performance Attribution]]
- [[Risk]]

---

# References

- Design Principles