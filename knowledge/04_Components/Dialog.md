---
title: Dialog

layer: Component

node_type: Component Knowledge

purpose: |
  Define when dialogs should interrupt the current workflow.

source:
  - Inline vs Dialog
  - Modal vs Side Panel

confidence: High

consumers:
  - AI Design Agent

relationships:
  - Inline vs Dialog
  - Modal vs Side Panel

tags:
  - component
  - dialog

status: Draft

last_updated: 2026-07-15
---

# Purpose

Focus user attention on a short, important task before returning to the primary workflow.

---

# Use When

- Confirming destructive actions
- Creating new objects
- Completing short workflows
- Preventing accidental actions

---

# Avoid When

- Editing simple values
- Viewing supporting information
- Reviewing details

---

# AI Interpretation

Dialogs should be intentional.

Prefer inline interactions or side panels whenever preserving context improves the experience.

---

# Related Knowledge

- [[Inline vs Dialog]]
- [[Modal vs Side Panel]]