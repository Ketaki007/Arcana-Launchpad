---
title: News
category: Widget
type: Analytical Widget
status: Draft
version: 1
tags:
  - widget
  - news
  - market-intelligence
  - events
related:
  - "[[Widget]]"
  - "[[Watchlist]]"
  - "[[Vertical Quote]]"
  - "[[04_Components/Chart]]"
  - "[[Financial Analysis]]"
---

# News

## Definition

The News widget presents a continuously updating stream of market-moving information relevant to the user's current analytical context. Rather than functioning as a generic news reader, it filters and prioritizes events based on the securities, portfolios, industries or markets currently under investigation.

Its primary role is to provide qualitative context that helps explain quantitative market movements.

---

# Purpose

Financial markets are influenced by events that extend far beyond numerical data. Earnings announcements, regulatory actions, macroeconomic developments, mergers, analyst ratings and geopolitical events all contribute to price movement and investment decisions.

The News widget ensures that analysts remain aware of these events without requiring them to leave their analytical workspace.

Instead of asking:

> "What happened?"

the widget answers:

> "Why might this be happening?"

---

# Mental Model

Think of the News widget as the workspace's real-time intelligence feed.

It continuously observes the outside world and surfaces only the information most relevant to the analyst's current context.

Unlike a search engine, users should rarely need to ask for information.

The widget should proactively deliver information that matters.

---

# Information Hierarchy

News should be prioritized according to analytical relevance rather than publication time alone.

Typical hierarchy:

1. High-impact market events
2. Company-specific news
3. Earnings and financial releases
4. Analyst upgrades and downgrades
5. Regulatory announcements
6. Industry developments
7. Broader macroeconomic news

Each item should communicate:

- Headline
- Source
- Timestamp
- Relevance
- Associated security or portfolio
- Event category

Users should understand the significance of an event before reading the full article.

---

# Primary Interactions

Users commonly:

- Scan recent headlines
- Open full articles
- Filter by company, sector or event type
- Search historical news
- Bookmark important stories
- Link news to the currently selected security
- View related events

Interactions should support investigation rather than interrupt it.

---

# Design Principles

### Relevance Before Recency

The newest article is not always the most important.

The widget should prioritize information based on likely analytical impact.

---

### Support Rapid Scanning

Analysts consume dozens or hundreds of headlines throughout the day.

Layouts should emphasize quick recognition rather than lengthy reading.

---

### Preserve Context

News should remain connected to the securities and portfolios being analysed.

Users should never wonder why a particular story is being shown.

---

### Reveal Importance

Different events deserve different levels of visual emphasis.

Major earnings announcements should stand out more than routine press releases.

---

# Typical Placement

The News widget is commonly positioned alongside other contextual widgets where it can explain observations made elsewhere in the workspace.

Typical neighbouring widgets include:

- Vertical Quote
- Chart
- Watchlist
- Financial Analysis

---

# Works Well With

### [[Watchlist]]

Selecting a security filters the news feed to that instrument.

### [[Vertical Quote]]

Price movement and market statistics gain additional meaning when viewed alongside relevant news.

### [[04_Components/Chart]]

Users frequently correlate significant headlines with price movement over time.

### [[Financial Analysis]]

Financial statements often require interpretation through recent business events.

---

# Common Mistakes

Displaying every available article regardless of relevance.

Prioritising chronological order over analytical importance.

Forcing users to leave the application to understand important events.

Showing duplicate stories from multiple sources without consolidation.

Treating news as passive content rather than analytical context.

---

# AI Interpretation

When generating interfaces:

- Treat the News widget as contextual intelligence rather than a news website.
- Prioritize relevance over recency.
- Support fast headline scanning.
- Keep the layout compact while allowing users to progressively explore details.
- Ensure the widget reacts automatically to the selected analytical context.
- Position it close to widgets that benefit from qualitative explanation.

---

# Related Concepts

[[Widget]]

[[Watchlist]]

[[Vertical Quote]]

[[04_Components/Chart]]

[[Financial Analysis]]

[[Relative Valuation]]

[[Widget Linking]]