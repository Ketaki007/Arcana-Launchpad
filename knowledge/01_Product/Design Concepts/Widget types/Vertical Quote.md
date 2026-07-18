---
title: Vertical Quote
category: Widget
type: Analytical Widget
status: Draft
version: 1
tags:
  - widget
  - analytics
  - market-data
  - security
related:
  - "[[Widget]]"
  - "[[Watchlist]]"
  - "[[04_Components/Chart]]"
  - "[[News]]"
  - "[[Financial Analysis]]"
---

# Vertical Quote

## Definition

The Vertical Quote widget provides a comprehensive snapshot of a single financial instrument. It consolidates key market data, trading statistics and reference information into a compact, vertically organized layout, allowing analysts to quickly understand the current state of a security before diving into deeper analysis.

Unlike a Watchlist, which is designed for comparing multiple securities, the Vertical Quote focuses entirely on one selected instrument. It serves as the primary source of context for many other analytical widgets within the workspace.

---

# Purpose

Enterprise analysts frequently shift their attention between securities throughout the day. Every transition begins with answering a simple question:

> "What is happening with this security right now?"

The Vertical Quote answers this question by presenting the most important market information in one place. It establishes context before users move into charts, financial statements, news or valuation analysis.

---

# Mental Model

Think of the Vertical Quote as the **information cockpit** for a single security.

It is not intended to perform analysis. Instead, it provides a trusted reference point that summarizes the current state of an instrument and anchors the rest of the analytical workflow.

If the Watchlist helps users decide **what** to investigate, the Vertical Quote helps them understand **where to begin**.

---

# Information Hierarchy

The information presented should follow the natural order in which analysts consume market data.

Typical hierarchy:

1. Company name and ticker
2. Current market price
3. Absolute and percentage change
4. Market status (Open, Closed, Halted, etc.)
5. High, Low, Open and Previous Close
6. Volume and trading activity
7. Market capitalization
8. Sector and industry
9. Exchange and currency
10. Additional reference attributes

The most time-sensitive information should always receive the highest visual priority.

---

# Primary Interactions

Users commonly interact with the widget to:

- View real-time market information
- Change the selected security
- Copy identifiers or symbols
- Navigate to related analytical tools
- Inspect additional market statistics
- Synchronize context across linked widgets

Most interactions should preserve analytical flow rather than interrupt it with navigation.

---

# Design Principles

### Prioritize Immediate Understanding

The widget should communicate the current state of a security within seconds. Users should not need to scan extensively before locating the most important metrics.

---

### Organize Information by Importance

Primary market data should remain visually dominant, while secondary reference information should support rather than compete with it.

---

### Support Continuous Monitoring

Because market conditions change throughout the day, the interface should clearly communicate updates without overwhelming users through excessive animation or visual noise.

---

### Optimize for Dense Information

Enterprise users value information density over decorative presentation. Spacing, typography and alignment should improve readability without unnecessarily increasing the widget's footprint.

---

# Typical Placement

The Vertical Quote is commonly positioned near the Watchlist or immediately adjacent to other detailed analytical widgets.

It often acts as the contextual bridge between navigation and deeper analysis.

Typical neighboring widgets include:

- Chart
- News
- Financial Analysis
- Relative Valuation

---

# Works Well With

### [[Watchlist]]

Selecting a security in the Watchlist updates the Vertical Quote, allowing users to transition seamlessly from comparison to detailed inspection.

### [[04_Components/Chart]]

The Chart provides historical and technical context for the market information summarized in the Vertical Quote.

### [[News]]

Relevant market events help explain price movements and unusual trading activity displayed within the quote.

### [[Financial Analysis]]

After understanding current market conditions, users frequently transition into company fundamentals and financial performance.

---

# Common Mistakes

Treating the widget as a dashboard by exposing every available market metric.

Duplicating analytical functionality that belongs in other widgets.

Using excessive visual emphasis for secondary statistics.

Breaking the visual hierarchy by giving all values equal prominence.

Requiring users to navigate away for frequently accessed reference information.

---

# AI Interpretation

When generating interfaces:

- Treat the Vertical Quote as the primary contextual widget for a selected security.
- Optimize for rapid comprehension rather than exploration.
- Emphasize current market price and movement above secondary statistics.
- Keep the layout compact and vertically structured.
- Design the widget to respond automatically to linked context from the Watchlist.
- Position it close to widgets that provide deeper analytical capabilities.

---

# Related Concepts

[[Widget]]

[[Watchlist]]

[[04_Components/Chart]]

[[News]]

[[Financial Analysis]]

[[Relative Valuation]]

[[Widget Linking]]