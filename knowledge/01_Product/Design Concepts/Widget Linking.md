---
title: Widget Linking
category: Design Concept
type: Interaction Model
status: Draft
version: 1
tags:
  - widget
  - interaction
  - linking
  - synchronization
  - enterprise
related:
  - "[[Widget]]"
  - "[[Watchlist]]"
  - "[[Vertical Quote]]"
  - "[[01_Product/Design Concepts/Widget types/Chart]]"
  - "[[News]]"
  - "[[Financial Analysis]]"
  - "[[Relative Valuation]]"
---

# Widget Linking

## Definition

Widget Linking is the mechanism through which independent analytical widgets share context and coordinate their behaviour. Rather than operating as isolated applications, linked widgets respond to common user interactions, allowing the entire workspace to evolve together as analytical focus changes.

A user should feel like they are interacting with one cohesive analytical environment rather than a collection of independent tools.

---

# Purpose

Enterprise users rarely analyse information in isolation.

Selecting a company affects market data.

Market data affects charts.

Charts lead to news.

News explains financial performance.

Financial performance influences valuation.

Without linking, users would need to manually repeat the same selection across every widget, introducing unnecessary friction and interrupting analytical flow.

Widget Linking eliminates this repetition by propagating shared context throughout the workspace.

---

# Mental Model

Think of widgets as specialists sitting around the same table.

Each widget performs a different task.

Instead of asking each specialist the same question individually, the user asks once.

Every relevant specialist hears the question and responds using their own expertise.

The user changes context once.

The workspace responds everywhere.

---

# Why It Matters

The value of an analytical workspace is not determined by the quality of individual widgets alone.

Its value comes from how effectively those widgets collaborate.

Poorly linked widgets create repetitive workflows.

Well-linked widgets create analytical momentum.

The less users think about synchronising tools, the more they can focus on solving problems.

---

# Types of Linking

## Entity Linking

Multiple widgets respond to the currently selected entity.

Example:

Selecting **Apple Inc.** in the Watchlist automatically updates:

- Vertical Quote
- Chart
- News
- Financial Analysis
- Relative Valuation
- Description

Entity linking is the most common form of synchronization.

---

## Portfolio Linking

Widgets synchronize around a selected portfolio or watchlist.

Changing the portfolio updates all portfolio-aware widgets.

---

## Time Linking

Widgets synchronize around a shared temporal context.

Changing the date range on a chart may update:

- Financial metrics
- Relative performance
- Historical news
- Portfolio returns

Temporal consistency reduces analytical errors.

---

## Filter Linking

Widgets respond to common filters such as:

- Sector
- Geography
- Asset Class
- Currency
- Strategy
- Industry

Rather than maintaining independent filters, widgets inherit shared workspace context whenever appropriate.

---

## Selection Linking

Selections made inside one widget become inputs for another.

Examples include:

- Selecting a peer company in Relative Valuation
- Selecting a news event
- Highlighting a chart interval

Selections should feel temporary, lightweight and reversible.

---

# Design Principles

## Shared Context

Context belongs to the workspace—not to individual widgets.

Whenever possible, widgets should consume shared context rather than maintaining duplicate state.

---

## Loose Coupling

Widgets should never depend directly on one another.

Instead, they respond to shared events or workspace context.

This keeps widgets reusable across different layouts.

---

## Predictable Behaviour

Users should quickly understand which widgets will respond to an interaction.

Unexpected updates reduce trust.

---

## Minimise User Effort

A single interaction should update as much of the workspace as possible without surprising the user.

Users should spend time analysing rather than configuring.

---

## Preserve User Control

Although automatic synchronization is valuable, users should always be able to:

- disable linking
- create independent widgets
- lock widget context
- compare multiple entities simultaneously

Automation should never remove analytical flexibility.

---

# Typical Workflow

A common analytical workflow demonstrates the power of widget linking.

1. The user selects a company in the Watchlist.
2. The Vertical Quote updates with current market information.
3. The Chart displays historical price movement.
4. The News widget filters to relevant events.
5. Financial Analysis loads company fundamentals.
6. Relative Valuation compares the selected company against peers.
7. Description provides background information.

The user performs one action.

The workspace performs many.

---

# Common Linking Patterns

## One-to-Many

One interaction updates multiple widgets.

Example:

Watchlist selection updates six widgets.

---

## Many-to-One

Multiple widgets contribute context to a single destination.

Example:

Chart selection and portfolio filter both influence Financial Analysis.

---

## Many-to-Many

Multiple widgets continuously share workspace context.

Common in advanced analytical workspaces.

---

# Common Mistakes

Synchronising every widget regardless of relevance.

Creating circular update behaviour between widgets.

Breaking user expectations through hidden linking.

Making linking impossible to disable.

Duplicating filters across every widget instead of sharing context.

Treating linking as navigation rather than collaboration.

---

# AI Interpretation

When generating interfaces:

- Assume widgets participate in a shared analytical workspace.
- Prefer shared context over duplicated controls.
- Generate interactions that update multiple relevant widgets together.
- Keep widgets loosely coupled and independently reusable.
- Support temporary context overrides when users compare multiple entities.
- Design workflows around analytical continuity rather than page navigation.

When reasoning about layouts:

- Place frequently linked widgets close together.
- Preserve visual relationships that reinforce shared context.
- Avoid separating widgets that users commonly interpret together.

---

# Related Concepts

[[Launchpad]]

[[View]]

[[Page]]

[[Widget]]

[[Watchlist]]

[[Vertical Quote]]

[[01_Product/Design Concepts/Widget types/Chart]]

[[News]]

[[Financial Analysis]]

[[Relative Valuation]]

[[Quote Monitor]]

[[Description]]