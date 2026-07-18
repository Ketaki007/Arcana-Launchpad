---
title: React (shadcn)

layer: Implementation

node_type: Renderer

purpose: |
  Define how design decisions from the NEO Design Knowledge System
  are translated into React interfaces using shadcn/ui.

source:
  - shadcn/ui Documentation

confidence: High

consumers:
  - AI Coding Agent
  - Developers

relationships:
  - Design Generation Agent
  - Components
  - Patterns

tags:
  - implementation
  - react
  - shadcn

status: Draft

last_updated: 2026-07-15
---

# Objective

Implement design decisions using React and shadcn/ui.

This renderer is responsible for translating approved design decisions into production-ready code.

It does **not** make design decisions.

---

# Inputs

- User Request
- Design Knowledge
- Selected Pattern
- Selected Components

---

# Responsibilities

- Use shadcn/ui as the default component library.
- Reuse existing components whenever possible.
- Compose components instead of recreating them.
- Follow React best practices.
- Preserve accessibility.
- Generate maintainable code.

---
# Theme

The default rendered interface should use the application's dark theme.

Requirements:

- Default to dark mode.
- Provide a visible theme toggle.
- Preserve accessibility and contrast in both themes.
- Ensure all generated components support light and dark themes.

---

# Implementation Workflow

1. Receive design decisions from the Design Generation Agent.
2. Map patterns to shadcn components.
3. Compose the required interface.
4. Generate React code.
5. Ensure accessibility and consistency.

---

# Success Criteria

The generated implementation should:

- Reflect the design reasoning.
- Reuse existing components.
- Be production-ready.
- Follow shadcn conventions.
- Remain easy to extend.

---

# Related Knowledge

- [[Design Generation Agent]]
- [[Patterns]]
- [[Components]]