---
title: Modal vs Side Panel

layer: Reasoning

node_type: Decision Rule

purpose: |
  Help AI determine whether a workflow should be presented
  in a modal dialog or a side panel.

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
  - interaction

status: Draft

last_updated: 2026-07-15
---

# Purpose

Determine whether users should temporarily leave their current workflow using a modal or continue working alongside additional information using a side panel.

The decision should preserve context whenever possible.

---

# Use a Modal when...

The user's primary task is to:

- Confirm an important action
- Complete a short, focused workflow
- Create a new object
- Prevent accidental interactions
- Resolve a blocking decision

Examples:

- Delete Portfolio
- Confirm Changes
- Create Watchlist
- Import Data
- Share Portfolio

---

# Use a Side Panel when...

The user's primary task is to:

- Review supporting information
- Inspect an object without losing context
- Edit an existing object
- Compare information while continuing analysis
- Navigate between related objects

Examples:

- Portfolio Details
- Security Information
- Risk Breakdown
- Attribution Details
- Edit Portfolio Metadata

---

# Tradeoffs

## Modal

Advantages

- Focuses user attention
- Reduces distractions
- Suitable for high-impact decisions
- Supports short workflows

Limitations

- Interrupts analysis
- Hides surrounding context
- Prevents comparison

---

## Side Panel

Advantages

- Preserves workflow context
- Supports comparison
- Allows quick exploration
- Enables lightweight editing

Limitations

- Limited available space
- Less suitable for complex workflows
- Can become crowded

---

# Decision Rule

Choose a **Modal** when the task requires the user's full attention or confirmation before proceeding.

Choose a **Side Panel** when users benefit from keeping the primary workspace visible while viewing or editing related information.

When in doubt, prefer a side panel to preserve analytical context.

---

# AI Interpretation

Before choosing a modal, ask:

1. Does this task block the user's workflow?
2. Is confirmation required before continuing?
3. Will hiding the underlying page reduce understanding?

Before choosing a side panel, ask:

1. Does the user need to compare information?
2. Should the current workspace remain visible?
3. Is this an exploratory or review task?

If preserving context improves the user experience, prefer a side panel.

---

# Related Knowledge

- [[Design Principles]]
- [[Decision Framework]]
- [[Inline vs Dialog]]

---

# References

- Design Principles