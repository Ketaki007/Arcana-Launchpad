---
title: Decision Framework

layer: Reasoning

node_type: Reasoning Framework

purpose: |
  Define the reasoning process AI should follow before making design decisions.
  This framework ensures interfaces are generated from user intent and product
  principles rather than directly selecting components.

source:
  - Product Philosophy
  - Design Principles
  - UX Inference

confidence: High

consumers:
  - AI Design Agent
  - AI Coding Agent

relationships:
  - Design Principles
  - Decision Rules
  - Product Goals
  - User Goals

tags:
  - reasoning
  - framework

status: Draft

last_updated: 2026-07-15
---

# Purpose

The Decision Framework defines the sequence of reasoning AI should follow before proposing a design solution.

The objective is to ensure design decisions are driven by user intent, product principles and established patterns rather than component availability.

---

# Decision Flow

## Step 1 — Understand the User Goal

Identify the primary task the user is trying to accomplish.

Examples:

- Compare portfolios
- Investigate performance
- Analyze risk
- Explore scenarios
- Review recommendations

---

## Step 2 — Identify the Primary Information

Determine what information is most important for the task.

Examples:

- Metrics
- Comparisons
- Trends
- Relationships
- Explanations

---

## Step 3 — Apply Design Principles

Evaluate the task using the design principles.

Ask:

- How can context be preserved?
- Does the user need comparison?
- Should evidence be surfaced?
- Is progressive disclosure appropriate?
- Are important relationships visible?

---

## Step 4 — Select the Interaction Pattern

Choose the interaction pattern that best supports the user's goal.

Examples:

- Table
- Chart
- Form
- Detail Panel
- Dashboard
- Modal

Pattern selection should be driven by the problem, not personal preference.

---

## Step 5 — Select Components

Choose components that implement the selected interaction pattern.

Components should support consistency while remaining secondary to user intent.

---

## Step 6 — Review the Solution

Before finalizing the interface, evaluate it against the Design Principles.

Ask:

- Is context preserved?
- Is comparison easy?
- Are insights supported by evidence?
- Is complexity introduced gradually?
- Are important relationships visible?
- Does the interface inspire confidence?

---

# AI Interpretation

Always reason in the following order:

1. User Goal
2. Product Context
3. Design Principles
4. Interaction Pattern
5. Components
6. Review

Never begin by selecting UI components.

The interface should emerge from the problem being solved rather than the available component library.

---

# Related Knowledge

- [[Design Principles]]
- [[Product Philosophy]]
- [[User Goals]]
- [[Table vs cards]]
- [[Chart vs Table]]
- [[Modal vs Side Panel]]

---

# References

- Product Philosophy
- Design Principles