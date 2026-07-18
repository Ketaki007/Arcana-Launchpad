---
title: View
category: Design Concept
type: Workspace
status: Draft
version: 1.0

related:
  - "[[Launchpad]]"
  - "[[Page]]"
---

# View

## Definition

A View represents a focused analytical workspace within a Launchpad. It groups together one or more Pages that collectively support a specific objective, workflow or area of investigation.

While a Launchpad represents the user's overall working environment, a View represents a particular mode of work.

---

# Purpose

Analysts rarely work on every problem simultaneously.

They naturally organize work around goals such as monitoring markets, researching companies, analysing financials or reviewing portfolios.

Views allow these workflows to remain separated while still belonging to the same Launchpad.

---

# Mental Model

Think of a View as a project board.

It gathers together everything required to accomplish one category of work without mixing unrelated information.

Switching between Views changes the user's working context rather than simply navigating between screens.

---

# Characteristics

A View:

- Keeps related widgets/pages together
- Maintains its own layout
- Preserves widget state
- Represents a complete workflow
- Can be saved and revisited

---

# Design Principles

Views should be organised around user intent rather than application features.

Each View should answer a single question:

> "What kind of work is the user trying to accomplish?"

---

# Relationships

Belongs to [[Launchpad]]

Contains [[Page]]

---

# AI Interpretation

When generating interfaces:

- Create separate Views for distinct analytical workflows.
- Avoid mixing unrelated business tasks within the same View.
- Optimise navigation between Views rather than within them.

---

# Related Concepts

[[Launchpad]]

[[Page]]