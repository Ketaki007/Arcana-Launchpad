---
title: Relative Valuation
category: Widget
type: Analytical Widget
status: Draft
version: 1
tags:
  - widget
  - valuation
  - peer-analysis
  - comparison
  - enterprise
related:
  - "[[Widget]]"
  - "[[Financial Analysis]]"
  - "[[Vertical Quote]]"
  - "[[01_Product/Design Concepts/Widget types/Chart]]"
  - "[[Watchlist]]"
---

# Relative Valuation

## Definition

The Relative Valuation widget enables analysts to compare the valuation and financial characteristics of a company against a selected group of peers. It combines market-derived valuation multiples with key financial metrics to help users assess whether a company appears overvalued, undervalued or fairly priced relative to comparable businesses.

Rather than analysing a company in isolation, the widget provides the comparative perspective that is central to equity research and investment decision-making.

---

# Purpose

A company's valuation has little meaning without context.

A Price-to-Earnings ratio of 30x may appear expensive until compared with a peer group trading at 40x. Similarly, high revenue growth may justify premium valuation multiples when viewed alongside industry competitors.

The Relative Valuation widget exists to answer one of the most common analytical questions in finance:

> "Compared to similar companies, where does this business stand?"

By bringing together peer companies, financial metrics and valuation multiples, the widget helps analysts understand relative positioning rather than absolute performance.

---

# Mental Model

Think of this widget as a comparison table for businesses.

Every row represents a company.

Every column represents a comparable metric.

The analyst's task is not simply to observe values but to identify differences, patterns and outliers that explain why one company trades differently from another.

The widget transforms individual financial data into comparative insight.

---

# Information Hierarchy

Information should be organised to support side-by-side comparison.

Typical hierarchy:

1. Peer company identifiers
2. Market capitalization
3. Enterprise value
4. Valuation multiples
   - P/E
   - EV / EBITDA
   - EV / Revenue
   - Price / Book
5. Growth metrics
6. Profitability metrics
7. Financial health metrics
8. Analyst estimates
9. Summary statistics (Average, Median, High, Low)

Columns should remain consistent across the comparison to maximise scanability.

---

# Primary Interactions

Users commonly:

- Define or modify the peer group
- Add or remove comparable companies
- Change displayed valuation metrics
- Sort companies by any metric
- Filter peer groups
- Highlight outliers
- View historical valuation trends
- Export comparison tables
- Synchronize selections with other widgets

Interactions should encourage exploration rather than static reporting.

---

# Design Principles

### Comparison First

The widget exists to support comparison.

Layouts, alignment and typography should maximise the user's ability to compare values across companies.

---

### Preserve Consistency

Comparable metrics should remain in consistent positions across the table.

Changing layouts unnecessarily increases cognitive effort.

---

### Surface Outliers

Exceptional values often deserve more attention than average values.

The interface should help analysts quickly identify companies that differ significantly from the peer group.

---

### Support Flexible Peer Groups

Peer groups differ across industries, investment strategies and analytical objectives.

Users should be able to customise comparison sets without rebuilding the entire workspace.

---

### Balance Density and Readability

Professional analysts routinely compare dozens of companies across numerous metrics.

The widget should embrace information density while preserving clear visual structure.

---

# Typical Placement

The Relative Valuation widget is commonly positioned alongside Financial Analysis and Chart widgets.

Together they allow analysts to understand:

- Business performance
- Market behaviour
- Relative pricing

without leaving the analytical workspace.

---

# Works Well With

### [[Financial Analysis]]

Financial statements provide the underlying business metrics that explain valuation differences between companies.

---

### [[Vertical Quote]]

Current market data provides context for valuation multiples and market positioning.

---

### [[01_Product/Design Concepts/Widget types/Chart]]

Historical price movements often explain changes in relative valuation over time.

---

### [[Watchlist]]

Peer companies can be selected directly from watchlists to simplify comparative analysis.

---

# Common Mistakes

Comparing companies that do not belong to the same industry or business model.

Displaying excessive metrics without prioritisation.

Breaking table alignment between comparable values.

Mixing historical and forward-looking metrics without clear distinction.

Presenting valuation multiples without sufficient financial context.

---

# AI Interpretation

When generating interfaces:

- Treat Relative Valuation as a comparison workspace rather than a reporting table.
- Optimise layouts for rapid cross-company comparison.
- Maintain consistent column alignment.
- Support flexible peer group management.
- Prioritise sortable, filterable and configurable tables.
- Position the widget close to Financial Analysis and Chart widgets to encourage integrated analysis.

---

# Related Concepts

[[Widget]]

[[Financial Analysis]]

[[Vertical Quote]]

[[01_Product/Design Concepts/Widget types/Chart]]

[[Watchlist]]

[[Widget Linking]]