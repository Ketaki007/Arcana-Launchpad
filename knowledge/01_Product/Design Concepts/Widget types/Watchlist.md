---
title: Watchlist
category: Widget
type: Analytical Widget
status: Draft
version: 1
related:
  - "[[Widget]]"
  - "[[Vertical Quote]]"
  - "[[04_Components/Chart]]"
  - "[[News]]"
---

# Watchlist

## Definition

The Watchlist widget displays a curated collection of securities that users actively monitor. Rather than serving as a static list, it acts as the primary navigation hub for analytical workflows. Selecting a security typically updates multiple linked widgets across the workspace.

For many users, the Watchlist becomes the starting point of analysis.

---

# Purpose

Analysts often monitor dozens or hundreds of securities throughout the day. The Watchlist provides a compact, information-dense overview that enables rapid scanning while allowing users to quickly shift analytical focus between instruments.

---

# Mental Model

Think of the Watchlist as the workspace navigator.

It is not intended for deep analysis. Instead, it helps users decide **what deserves attention next**.

---

# Information Hierarchy

Information should be ordered by scan priority.

Typical hierarchy:

1. Instrument name / ticker
2. Current price
3. Price change
4. Percentage change
5. Volume
6. Status indicators
7. Optional custom columns

Users should be able to compare multiple rows within seconds.

---

# Primary Interactions

- Search securities
- Sort columns
- Filter rows
- Select a security
- Open detailed analysis
- Configure displayed columns

Selecting a row should update linked widgets when widget linking is enabled.

---

# Design Principles

The Watchlist should prioritize scanning over reading.

Information density is desirable, but visual clutter is not.

Column alignment should improve comparison rather than decoration.

---

# Typical Placement

Usually positioned on the left side of the workspace where it acts as the primary navigation element.

---

# Works Well With

- [[Vertical Quote]]
- [[04_Components/Chart]]
- [[News]]
- [[Financial Analysis]]

---

# Common Mistakes

Turning the Watchlist into a data table with excessive columns.

Displaying information that users rarely compare.

Breaking keyboard navigation.

Using large row heights that reduce scanning efficiency.

---

# AI Interpretation

When generating interfaces:

- Prefer a narrow vertical layout.
- Prioritize fast scanning.
- Treat row selection as shared context.
- Use the Watchlist to drive updates in related widgets rather than duplicating search functionality elsewhere.

---

# Related Concepts

[[Widget]]

[[Widget Linking]]