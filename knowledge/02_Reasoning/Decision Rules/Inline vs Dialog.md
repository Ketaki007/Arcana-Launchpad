---
title: Inline vs Dialog

layer: Reasoning

node_type: Decision Rule

purpose: |
  Help AI determine whether an interaction should occur inline
  within the current context or inside a dialog.

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

Determine whether a user task should be completed inline or within a dialog.

The decision should minimize unnecessary interruptions while protecting users during high-impact actions.

---

# Use Inline when...

The user's primary task is to:

- Edit existing information
- Make small changes
- Update values
- Correct mistakes
- Continue an existing workflow

Examples:

- Renaming a portfolio
- Editing tags
- Updating notes
- Adjusting filters
- Editing table values

---

# Use a Dialog when...

The user's primary task is to:

- Confirm a destructive action
- Complete a focused workflow
- Review important information before proceeding
- Collect several related inputs
- Prevent accidental actions

Examples:

- Delete portfolio
- Create a new portfolio
- Import data
- Share portfolio
- Confirm irreversible actions

---

# Tradeoffs

## Inline

Advantages

- Preserves user context
- Faster interactions
- Less disruptive
- Encourages continuous workflows

Limitations

- Limited available space
- Less suitable for complex tasks
- Can become cluttered

---

## Dialog

Advantages

- Focuses user attention
- Supports multi-step input
- Separates important tasks
- Reduces accidental actions

Limitations

- Interrupts workflow
- Removes surrounding context
- Requires opening and closing

---

# Decision Rule

Choose **Inline** whenever the task is lightweight and users benefit from staying in context.

Choose a **Dialog** when users need focused attention, additional information or confirmation before proceeding.

Avoid dialogs for simple edits.

---

# AI Interpretation

Before choosing a dialog, ask:

1. Can this task be completed without interrupting the user's workflow?
2. Does the user need additional focus?
3. Is the action destructive or irreversible?
4. Does the interaction require multiple related inputs?

If the answer to these questions is mostly **No**, prefer an inline interaction.

Dialogs should be used intentionally, not by default.

---

# Related Knowledge

- [[Design Principles]]
- [[Decision Framework]]

---

# References

- Design Principles