# Widget Configuration

## Overview

Widgets are the building blocks of an analyst's workspace. While each widget serves a specific purpose, every analyst has slightly different preferences for how information should be displayed, filtered and organized. Widget Configuration aims to make these customizations fast, intuitive and always within reach.

Rather than treating configuration as a separate task hidden behind multiple menus, the feature brings the most commonly used settings closer to where users are already working. The goal is to reduce the effort required to personalize widgets while preserving the depth and flexibility expected by professional users.

---

## Why This Feature Matters

Modern financial platforms offer powerful widgets, but many of their configuration options are buried behind layered dialogs or secondary menus. Although this keeps the interface visually clean, it also creates unnecessary friction for actions that users perform repeatedly throughout the day.

A typical analyst might regularly:

- Change the selected security
- Update a benchmark or peer group
- Adjust the chart timeframe
- Modify displayed columns
- Apply filters to news
- Change the data period for financial statements

None of these actions fundamentally change the analysis, yet they often require several clicks and repeated navigation through configuration panels.

As users become more experienced, these small interruptions accumulate and slow down everyday workflows.

Widget Configuration addresses this by making common actions immediate while keeping advanced capabilities available when required.

---

## Design Objectives

The feature is guided by four key principles.

### Prioritize Frequent Actions

Settings that users interact with regularly should be visible and accessible directly within the widget.

Advanced options should remain available but should not compete for attention during everyday use.

---

### Maintain Consistency

Every widget should follow a consistent configuration pattern.

Regardless of whether a user is interacting with News, Graph (GP) or Financial Analysis (FA), they should quickly understand where configuration options live and how they behave.

A predictable interaction model reduces the learning curve across the product.

---

### Preserve Analytical Context

Changing a widget's configuration should feel lightweight.

Users should not feel as though they are leaving their current analysis simply to adjust a setting.

Configuration should happen within the flow of work rather than interrupting it.

---

### Support Progressive Complexity

New users should see only the controls they need.

Experienced users should still be able to access advanced configuration without limitations.

The interface should reveal complexity only when requested.

---

## The Proposed Experience

Each widget provides two levels of configuration.

### Quick Configuration

The widget header contains the controls most frequently used during analysis.

Depending on the widget, these may include:

- Security selector
- Date range
- Compare security
- View type
- Sorting
- Refresh
- Filter

These controls are immediately visible and can be changed without opening a separate configuration panel.

---

### Advanced Configuration

Selecting the Configure action opens a dedicated side panel.

Rather than presenting a long list of settings, options are grouped into logical sections such as:

- Data
- Display
- Layout
- Filters
- Behaviour

Changes update the widget immediately, allowing users to understand the impact of their choices without repeatedly closing the configuration panel.

---

## Key Capabilities

### Inline Controls

Frequently used settings remain directly accessible from the widget itself.

For example:

- GP allows users to switch between time ranges.
- NEWS allows quick filtering by source or relevance.
- Monitor enables rapid sorting and column visibility.
- FA allows changing reporting periods.

---

### Configuration Panel

Less frequently used settings are organized within a dedicated side panel.

This keeps widgets uncluttered while still exposing the full range of customization available.

---

### Personal Preferences

Whenever appropriate, Launchpad remembers a user's preferred widget settings.

For example, if an analyst consistently views GP in a one-year timeframe or prefers quarterly financial statements in FA, these preferences can be restored automatically when new instances of those widgets are created.

This reduces repetitive configuration without removing user control.

---

### Reset to Default

Users can restore the original widget configuration at any time.

This provides confidence when experimenting with different settings and prevents users from feeling locked into previous customizations.

---

## User Journey

An analyst is reviewing NVIDIA ahead of its earnings announcement.

Within the workspace, they open the Graph (GP) widget.

Instead of navigating through multiple menus, they simply change the timeframe from one month to five years using the controls in the widget header.

Next, they add AMD as a comparison security using the same toolbar.

Finally, they open the configuration panel to enable moving averages and adjust the chart style.

All of these changes happen within the existing workspace without interrupting the investigation or requiring additional dialogs.

The experience feels immediate and responsive, allowing the analyst to remain focused on interpretation rather than interface mechanics.

---

## Design Considerations

The goal of Widget Configuration is not to expose every available option all the time.

Doing so would increase visual complexity and make widgets harder to scan.

Instead, the interface intentionally distinguishes between actions that support the user's current analysis and actions that fundamentally redefine how the widget behaves.

Frequently used controls remain visible because they are part of everyday analytical workflows.

Less common settings remain available but are progressively disclosed through the configuration panel.

This balance keeps widgets approachable while preserving the flexibility expected from professional financial software.

Another important consideration is consistency.

Even though every widget exposes different settings, the overall interaction pattern should remain predictable. Users should never need to relearn how configuration works simply because they switch from one widget to another.

---

## Measuring Success

Widget Configuration should reduce the interaction cost of customizing analytical views.

Success can be evaluated through measures such as:

- Reduced time spent configuring widgets.
- Fewer clicks for common configuration tasks.
- Increased use of inline controls.
- Reduced reliance on advanced configuration panels.
- Positive user feedback regarding discoverability and ease of customization.

Ultimately, users should feel that the product adapts to the way they work rather than forcing them to adapt to the interface.

---

## Looking Ahead

Widget Configuration establishes the foundation for more intelligent customization in future releases.

As Launchpad develops a better understanding of user preferences, commonly used settings could be suggested automatically or carried across similar widgets. These recommendations should always remain transparent and optional, ensuring that analysts retain complete ownership of their workspace.

The long-term goal is not to eliminate configuration, but to reduce the amount of repetitive effort required to achieve a familiar analytical environment.