---
title: Design Principles

layer: Reasoning

node_type: Design Principles

purpose: |
  Define the core principles that guide all product and interface decisions.
  These principles should be applied before selecting patterns or components.

source:
  - Product Philosophy
  - Arcana Public Website
  - UX Inference

confidence: High

consumers:
  - AI Design Agent
  - AI Coding Agent
  - Designers
  - Developers

relationships:
  - Product Philosophy
  - Decision Framework
  - Decision Rules

tags:
  - reasoning
  - principles

status: Draft

last_updated: 2026-07-15
---

# Purpose

Design principles define the values that guide interface decisions across the product.

They act as decision-making heuristics rather than implementation rules.

When multiple valid design solutions exist, these principles should be used to evaluate and prioritize the best option.

---

# Principles

## 1. Preserve Context

Users should never lose the context of their analysis while navigating the product.

### Implications

- Maintain the active portfolio across workflows.
- Avoid unnecessary page transitions.
- Keep relevant filters and selections persistent where appropriate.

---

## 2. Design for Comparison

Comparison is a primary analytical activity.

Interfaces should make it easy to compare portfolios, benchmarks, scenarios and performance drivers.

### Implications

- Prefer layouts that support side-by-side analysis.
- Highlight differences instead of isolated values.
- Preserve alignment between comparable information.

---

## 3. Explain Before You Recommend

Insights should be accompanied by the evidence that generated them.

### Implications

- Surface contributing factors.
- Avoid presenting recommendations without explanation.
- Make calculations and assumptions discoverable.

---

## 4. Progressive Disclosure

Present the right amount of information at the right time.

Complexity should be revealed gradually without hiding critical information.

### Implications

- Prioritize essential information.
- Allow users to drill into detail.
- Avoid overwhelming first-time views.

---

## 5. Reveal Relationships

Help users understand how data points influence one another.

### Implications

- Connect metrics with their underlying drivers.
- Show relationships instead of isolated values.
- Preserve traceability throughout analytical workflows.

---

## 6. Build Trust Through Transparency

Interfaces should communicate uncertainty, assumptions and limitations clearly.

### Implications

- Distinguish observed data from projections.
- Explain confidence where appropriate.
- Avoid hiding important system behavior.

---

# AI Interpretation

When multiple interface solutions satisfy the same user goal:

1. Preserve user context.
2. Optimize for comparison.
3. Support understanding before action.
4. Explain insights whenever possible.
5. Reveal relationships between information.
6. Prefer transparent interactions over simplified ones.

Design decisions should be justified using these principles before selecting patterns or components.

---

# Related Knowledge

- [[Product Philosophy]]
- [[Decision Framework]]
- [[Portfolio]]
- [[Benchmark]]
- [[Risk]]
- [[Performance Attribution]]
- [[Scenario Analysis]]

---

# References

- Product Philosophy
- Arcana Public Website