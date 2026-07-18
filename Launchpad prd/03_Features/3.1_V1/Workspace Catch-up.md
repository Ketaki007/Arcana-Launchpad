# Workspace Catch-up

## Overview

Financial analysis is rarely completed in a single sitting. Analysts constantly switch between companies, attend meetings, respond to requests, and return to investigations hours or even days later. During that time, markets move, companies publish news, financial data changes, and the workspace itself may evolve.

Workspace Catch-up helps users quickly understand what has changed since they last worked on a page. Rather than asking users to manually reconstruct context, it provides a concise summary of meaningful updates so they can continue their investigation with confidence.

The feature is designed to reduce the cognitive effort of resuming work—not to analyze or interpret the information on behalf of the user.

---

## Why This Feature Matters

One of the biggest hidden costs in analytical work is context switching.

An analyst may spend the morning researching NVIDIA, switch to preparing a client presentation, attend meetings through the afternoon, and return to the investigation before market close.

By then, several things may have changed:

- New earnings commentary has been published.
- The stock price has moved significantly.
- Peer companies have reported news.
- Financial estimates have been revised.
- Notes from the previous session are no longer top of mind.

Today, the analyst must manually inspect every widget to understand what changed before meaningful work can continue.

This repetitive process slows investigations and increases the risk of overlooking important developments.

Workspace Catch-up exists to shorten the gap between opening a workspace and becoming productive again.

---

## Design Objectives

Workspace Catch-up is guided by four principles.

### Restore Context Quickly

Users should understand the current state of their investigation within seconds rather than minutes.

---

### Highlight Meaningful Changes

The feature should focus attention on information that is likely to influence ongoing analysis.

Routine updates that do not materially affect the investigation should remain unobtrusive.

---

### Preserve User Control

Workspace Catch-up should summarize information, not interpret it.

It should never recommend investment decisions or draw conclusions.

The analyst remains responsible for understanding the significance of every update.

---

### Integrate Naturally

Catch-up should feel like a lightweight layer on top of the existing workspace rather than a separate application.

Users should be able to dismiss it and immediately continue working.

---

## The Proposed Experience

Whenever a workspace has been inactive for a meaningful period, Launchpad presents a Workspace Catch-up panel when the user returns.

Rather than listing every change chronologically, the summary groups updates into meaningful categories.

Examples include:

### Market Activity

Highlights notable price movement for the selected company or securities within the workspace.

Example:

> NVIDIA +4.8% since your last session.

---

### News

Summarizes important news articles published since the previous session.

Rather than displaying every headline, the feature prioritizes articles related to companies already being investigated.

---

### Financial Updates

Identifies newly available financial data or estimate revisions relevant to the investigation.

---

### Workspace Activity

Highlights changes made within the workspace itself, such as:

- New notes
- Modified layouts
- Updated widget configurations

---

### Resume Previous Context

Displays the page that was previously active along with the last viewed security, allowing users to continue from exactly where they left off.

---

## Key Capabilities

Workspace Catch-up provides a concise overview rather than a detailed report.

Core capabilities include:

- Summary of important changes
- Direct links to affected widgets
- Resume previous page and selected security
- Dismiss or review later
- Context-aware summaries based on the current investigation

The emphasis is on reducing navigation rather than replacing it.

---

## User Journey

An analyst finishes researching NVIDIA before leaving for the day.

The following morning they reopen Launchpad.

Instead of immediately seeing the workspace, they are presented with a brief summary.

The summary highlights:

- NVIDIA is up 5.2%.
- Two major news articles were published overnight.
- Consensus EPS estimates have been revised.
- Their previous investigation ended on the Relative Valuation page.

The analyst clicks the highlighted news item and is taken directly to the NEWS widget.

After reviewing the updates, they continue the investigation without needing to manually inspect every widget.

The experience feels less like reopening software and more like returning to an ongoing conversation.

---

## Design Considerations

Workspace Catch-up should remain intentionally concise.

The purpose is not to replace the workspace with another dashboard, but to reduce the time required to regain context.

Information overload would undermine the value of the feature.

The summary should therefore prioritize relevance over completeness.

Another important consideration is trust.

The feature should clearly distinguish between facts and summaries.

For example:

- "Three news articles published."

is preferable to

- "Sentiment appears positive."

The former reports observable changes, while the latter introduces interpretation that may not align with the analyst's own judgement.

Maintaining this distinction helps position the feature as an assistant rather than an advisor.

---

## Measuring Success

Workspace Catch-up should reduce the effort required to resume investigations.

Success can be measured through indicators such as:

- Reduced time between opening a workspace and the first meaningful interaction.
- Increased engagement with highlighted updates.
- Reduced manual navigation immediately after returning.
- Positive user feedback regarding continuity and context restoration.

Ultimately, users should feel that the product remembers where they left off, even though the analysis remains entirely their own.

---

## Looking Ahead

Workspace Catch-up lays the foundation for richer contextual assistance across the platform.

As Launchpad evolves, summaries could become more personalized by considering previous investigations, user notes and historical workspace activity.

Combined with Investigation Memory, the experience could evolve from simply answering:

> "What changed?"

to helping users understand:

> "How has this investigation evolved since the last time you worked on it?"

Even as these capabilities mature, the guiding principle remains unchanged: help users regain context quickly while leaving interpretation and decision-making firmly in their hands.