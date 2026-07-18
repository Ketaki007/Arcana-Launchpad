---
title: Chart
category: Widget
type: Analytical Widget
status: Draft
version: 1.0

tags:
  - widget
  - visualization
  - chart
  - analytics
  - market-data

related:
  - "[[Widget]]"
  - "[[Watchlist]]"
  - "[[Vertical Quote]]"
  - "[[News]]"
  - "[[Relative Valuation]]"
---

# Chart

## Definition

The Chart widget provides a visual representation of market and financial data over time, enabling users to identify trends, patterns and anomalies that are difficult to recognise from tabular data alone. It transforms numerical information into an interactive visual model that supports exploration, comparison and decision-making.

Unlike the Vertical Quote, which represents the current state of a security, the Chart explains how that state evolved.

---

# Purpose

Financial analysis is inherently temporal. Understanding a company's current price is rarely sufficient without understanding how it has changed over time.

The Chart widget enables analysts to investigate historical performance, identify emerging trends, evaluate market reactions and compare securities across different periods.

Its primary purpose is not simply to display data, but to support analytical reasoning through visual exploration.

---

# Mental Model

Think of the Chart as a visual investigation workspace.

Users interact with it to ask questions such as:

- What changed?
- When did it change?
- How significant was the movement?
- What caused it?
- Is this behaviour unusual?

The chart should encourage exploration rather than passive observation.

---

# Information Hierarchy

The visual hierarchy should prioritize the data itself rather than interface controls.

Typical hierarchy:

1. Primary visualization
2. Current value and trend
3. Time scale
4. Comparative overlays
5. Indicators and annotations
6. Interactive controls
7. Supporting metadata

Controls should remain discoverable without competing with the visualization.

---

# Primary Interactions

Common interactions include:

- Zooming and panning
- Changing time ranges
- Hovering for detailed values
- Comparing multiple securities
- Adding or removing indicators
- Drawing annotations
- Viewing historical events
- Synchronizing with linked widgets

Interactions should feel fluid and encourage iterative exploration.

---

# Design Principles

### The Data Is the Interface

The visualization should remain the primary focus. Controls should support analysis without distracting from the underlying data.

---

### Support Exploration

Charts should invite users to investigate rather than present a fixed story. Every interaction should reveal additional insight or perspective.

---

### Preserve Context

Changing the selected security or time range should update the visualization while maintaining relationships with linked widgets such as News and Financial Analysis.

---

### Reveal Detail Progressively

Users should be able to understand the overall trend immediately while accessing increasingly detailed information through interaction.

---

### Maintain Visual Integrity

Scales, axes and annotations should accurately represent the underlying data. Visual embellishments should never distort analytical interpretation.

---

# Typical Placement

The Chart is commonly positioned near contextual widgets that explain or complement market movement.

Typical neighbouring widgets include:

- Vertical Quote
- News
- Financial Analysis
- Relative Valuation

The Chart often occupies one of the largest areas within a workspace because it supports sustained interaction.

---

# Works Well With

### [[Vertical Quote]]

The Vertical Quote summarizes the current market state, while the Chart explains how that state developed over time.

### [[News]]

Users frequently correlate price movements with significant news events.

### [[Watchlist]]

Selecting a security updates the chart automatically, allowing rapid comparison across instruments.

### [[Relative Valuation]]

Historical performance often complements valuation comparisons.

---

# Common Mistakes

Treating the chart as a static visualization instead of an analytical tool.

Displaying excessive controls that compete with the visualization.

Using inconsistent scales or misleading visual encodings.

Overloading a single chart with unrelated metrics.

Breaking interaction continuity by forcing users to reset zoom levels or filters unnecessarily.

---

# AI Interpretation

When generating interfaces:

- Treat the Chart as an exploratory analytical tool rather than a reporting component.
- Allocate sufficient space for interaction.
- Prioritize the visualization over surrounding controls.
- Support direct manipulation through zooming, panning and comparison.
- Synchronize the chart with other contextual widgets.
- Avoid unnecessary decorative elements that reduce analytical clarity.

---

# Related Concepts

[[Widget]]

[[Watchlist]]

[[Vertical Quote]]

[[News]]

[[Financial Analysis]]

[[Relative Valuation]]

[[Widget Linking]]