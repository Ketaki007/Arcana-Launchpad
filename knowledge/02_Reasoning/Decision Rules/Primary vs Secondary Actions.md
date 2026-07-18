
---
title: Primary vs Secondary Actions

layer: Reasoning

node_type: Decision Rule

purpose: |
  Help AI determine the appropriate emphasis for actions within an interface,
  ensuring users can easily identify the most important next step.

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

tags:
  - tradeoff
  - actions

status: Draft

last_updated: 2026-07-15
---

# Purpose

Determine which action should receive the greatest visual emphasis based on the user's primary goal.

Every screen should have one clear primary action.

---

# Use a Primary Action when...

The action directly advances the user's main objective.

Examples:

- Save Changes
- Create Portfolio
- Run Analysis
- Compare Portfolios
- Apply Filters

---

# Use Secondary Actions when...

The action supports the workflow but is not the primary objective.

Examples:

- Cancel
- Reset
- Export
- Duplicate
- Share
- View Details

---

# Tradeoffs

## Primary Action

Advantages

- Creates a clear visual hierarchy.
- Guides user attention.
- Reduces decision effort.

Limitations

- Multiple primary actions create confusion.
- Excessive emphasis reduces effectiveness.

---

## Secondary Action

Advantages

- Supports optional workflows.
- Keeps the interface balanced.
- Reduces visual competition.

Limitations

- Can be overlooked if used for important tasks.

---

# Decision Rule

Choose a **Primary Action** for the single action that best helps users achieve their current goal.

Use **Secondary Actions** for supporting, optional or alternative tasks.

Avoid presenting multiple primary actions within the same decision context.

---

# AI Interpretation

Before assigning action hierarchy, ask:

1. What is the user's primary objective?
2. Which action moves the user closest to completing that objective?
3. Are any actions optional or reversible?

Highlight only the primary task.

Supporting actions should remain discoverable without competing for attention.

---

# Related Knowledge

- [[Design Principles]]
- [[Decision Framework]]

---

# References

- Design Principles