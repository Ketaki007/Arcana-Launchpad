---
title: Widget
category: Design Concept
type: Analytical Application
status: Draft
version: 1.0

related:
  - "[[Page]]"
  - "[[Widget Linking]]"
---

# Widget

## Definition

A Widget is the smallest independently functioning analytical application within a Launchpad. Each widget encapsulates a single analytical capability—such as monitoring securities, displaying news, analysing financial statements or visualising market data—while remaining composable with other widgets on the same page.

Unlike a simple UI component, a widget owns its own data, interactions, configuration and presentation. It behaves as a self-contained application that participates in larger workflows through shared context rather than direct dependency.

---

# Purpose

Enterprise users frequently combine multiple analytical tools to answer a single question. Instead of forcing users through rigid, linear workflows, widgets allow them to assemble a personalised workspace that reflects how they think and work.

Widgets make complex analytical environments modular, reusable and adaptable.

---

# Mental Model

Think of a widget as an application inside an application.

Each widget has a clear responsibility and should be useful on its own, but it becomes significantly more powerful when combined with complementary widgets.

A News widget, for example, becomes more valuable when linked to a Watchlist. A Chart widget becomes more meaningful when it responds to selections in a Quote widget.

---

# Characteristics

A widget typically owns:

- A single analytical responsibility
- Its own state and configuration
- A dedicated interaction model
- Independent rendering
- Support for contextual linking
- The ability to resize without losing usability

Widgets should be reusable across multiple Views and Pages rather than being tightly coupled to a single layout.

---

# Design Principles

### One Responsibility

Each widget should solve one primary analytical problem exceptionally well. If users need to mentally switch between unrelated tasks within the same widget, it is likely taking on too much responsibility.

### Modular Composition

Widgets should collaborate through shared context instead of embedding one another's functionality. This encourages flexibility and makes layouts easier to personalise.

### Progressive Disclosure

Enterprise widgets often contain dense information, but they should reveal complexity gradually. Users should be able to scan the widget quickly while still having access to detailed information when needed.

### Context Awareness

Widgets should react intelligently to changes in the surrounding workspace. Selecting a security in one widget should update linked widgets where appropriate, reducing repetitive user actions.

---

# Common Mistakes

Treating widgets as visual containers rather than analytical tools.

Combining multiple unrelated responsibilities into a single widget.

Overloading widgets with excessive controls that distract from their primary purpose.

Breaking contextual relationships between widgets by requiring unnecessary manual input.

---

# AI Interpretation

When generating interfaces:

- Treat widgets as independent analytical applications rather than UI panels.
- Prefer several focused widgets over one large multifunction widget.
- Group complementary widgets together to support natural workflows.
- Design widgets to exchange context through linking rather than duplication.
- Ensure every widget communicates a clear primary purpose.

---

# Related Concepts

[[Page]]

[[Launchpad]]

[[Widget Linking]]