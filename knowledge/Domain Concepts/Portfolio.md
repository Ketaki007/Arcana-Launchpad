---
title: Portfolio

layer: Product

node_type: Domain Concept

purpose: |
  Define the primary entity around which most user workflows are organized.
  Help AI understand that portfolio is the central object in the product.

source:
  - Arcana Public Website

confidence: High

consumers:
  - AI Design Agent
  - AI Coding Agent
  - Designers
  - Developers

relationships:
  - Benchmark
  - Performance Attribution
  - Risk
  - Scenario Analysis

tags:
  - portfolio
  - finance
  - domain

status: Draft

last_updated: 2026-07-15
---

# Purpose

A portfolio is the primary object users analyze throughout the product.

Most analytical workflows begin with a selected portfolio and progressively explore its performance, composition, risk and behavior.

---

# Why It Matters

Users are rarely interested in isolated metrics.

Instead, they want to understand:

- how a portfolio is performing
- what contributed to that performance
- what risks exist
- how it compares to expectations or benchmarks
- what actions should be taken next

---

# Design Implications

The selected portfolio should remain the primary context throughout analytical workflows.

Interfaces should:

- preserve portfolio context across pages
- make it easy to compare multiple portfolios
- allow users to drill into contributing factors
- avoid forcing users to repeatedly select the active portfolio

---

# AI Interpretation

When a workflow references a portfolio:

- Treat it as the primary context.
- Preserve context during navigation.
- Prefer layouts that support comparison.
- Surface related concepts such as [[Risk]], [[Benchmark]] and [[Performance Attribution]].

---

# Related Knowledge

- [[Benchmark]]
- [[Risk]]
- [[Performance Attribution]]
- [[Scenario Analysis]]

---

# References

Arcana Public Website