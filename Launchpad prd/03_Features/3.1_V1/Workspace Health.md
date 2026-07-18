# Workspace Health

## Overview

Over time, analytical workspaces naturally become more complex. New widgets are added for temporary investigations, layouts are adjusted to accommodate new information, and configurations evolve as users experiment with different ways of working.

While this flexibility is valuable, it also leads to workspaces becoming increasingly difficult to manage. Redundant widgets, outdated pages and inconsistent layouts gradually accumulate, making it harder for users to locate information and maintain an efficient analytical environment.

Workspace Health acts as a proactive assistant that helps users maintain a clean, organized and effective workspace. Rather than modifying layouts automatically, it periodically surfaces recommendations that help users optimize the way they work.

The goal is not to create a "perfect" workspace, but to help users avoid unnecessary complexity as their workspace evolves.

---

## Why This Feature Matters

Unlike traditional applications, Launchpad workspaces are designed to be long-lived.

Analysts often spend weeks or months refining layouts that support their individual workflow. Over time, these workspaces become highly personalized—but they also become cluttered.

Common issues include:

- Widgets that are no longer used.
- Multiple widgets displaying similar information.
- Pages created for one investigation but never revisited.
- Inconsistent layouts across similar research pages.
- Widgets that are no longer connected to the rest of the workspace.

None of these problems are immediately visible, but collectively they increase cognitive load and make analytical work less efficient.

Workspace Health helps users identify these opportunities for improvement without disrupting the way they already work.

---

## Design Objectives

Workspace Health is guided by four principles.

### Encourage Better Organization

The feature should promote maintainable workspaces without enforcing rigid standards.

Users should feel supported rather than evaluated.

---

### Reduce Visual Clutter

Recommendations should help remove unnecessary complexity while preserving information that users genuinely value.

The objective is simplification, not minimalism.

---

### Respect User Ownership

A workspace is a reflection of how an individual analyst thinks.

The system should never automatically delete widgets, rearrange layouts or override user decisions.

Every recommendation should remain optional.

---

### Be Context Aware

Recommendations should consider how the workspace is actually being used.

A rarely used widget may still be valuable during earnings season, while another widget may genuinely be redundant.

The system should avoid making simplistic assumptions based solely on frequency of use.

---

## The Proposed Experience

Workspace Health runs quietly in the background and periodically evaluates the current workspace.

Rather than interrupting the user, recommendations are presented through a lightweight notification or an optional Workspace Health panel.

Each recommendation clearly explains:

- What was detected.
- Why it may be worth reviewing.
- What action the user can take.

Examples include:

> This page contains three News widgets with overlapping filters.

> You haven't opened this page in six months.

> Two widgets appear to display the same financial metrics.

> Several widgets are no longer linked to the selected security.

The user can review, dismiss or act on each recommendation individually.

---

## Key Capabilities

Workspace Health focuses on improving workspace quality through simple, actionable insights.

Capabilities include:

### Redundant Widget Detection

Identify widgets that provide overlapping information or duplicate functionality.

---

### Unused Page Identification

Highlight pages that have not been accessed for an extended period.

This helps users archive investigations that are no longer active without deleting them.

---

### Layout Consistency

Identify opportunities to improve alignment, spacing or organization where layouts have gradually become fragmented.

These suggestions remain visual recommendations rather than automatic changes.

---

### Broken Context Links

Detect widgets that are no longer participating in the shared analytical context.

For example, a News widget that is no longer linked to the selected company or a Chart that continues displaying an outdated security.

---

### Workspace Summary

Provide a high-level overview of workspace health, including:

- Number of pages
- Active widgets
- Archived investigations
- Outstanding recommendations

This gives users a simple snapshot without overwhelming them with unnecessary detail.

---

## User Journey

An analyst has been using the same Research Workspace for several months.

During this time they have created pages for multiple earnings seasons, temporary investigations and ad hoc company comparisons.

When opening the Workspace Health panel, they see several recommendations.

One page contains two identical Financial Analysis widgets.

Another page has not been opened in nearly a year.

A News widget is no longer linked to the currently selected security and continues displaying outdated information.

The analyst decides to archive one page, remove a redundant widget and reconnect the News widget.

Within a few minutes, the workspace becomes easier to navigate while preserving the layouts and workflows they rely on every day.

---

## Design Considerations

Workspace Health should never feel like an automated optimization tool.

Analytical work is highly personal, and what appears redundant to one user may be intentionally duplicated by another to support a specific workflow.

For this reason, recommendations should always explain *why* they are being made and allow users to ignore or dismiss them.

Transparency is equally important.

Users should understand the reasoning behind every suggestion instead of feeling that the system is making arbitrary judgements about their workspace.

Finally, Workspace Health should remain lightweight.

Its purpose is to maintain the quality of the workspace over time—not to become another dashboard that demands regular attention.

---

## Measuring Success

Workspace Health should help users maintain efficient workspaces without increasing management overhead.

Success can be measured through indicators such as:

- Increased adoption of workspace recommendations.
- Reduction in redundant widgets and inactive pages.
- Improved workspace consistency over time.
- Positive user feedback regarding organization and maintainability.

Ultimately, users should feel that Launchpad quietly helps them keep their workspace organized instead of requiring periodic clean-up sessions.

---

## Looking Ahead

Workspace Health establishes the foundation for more intelligent workspace management.

Future versions could identify patterns across multiple workspaces, suggest reusable layouts or recommend widgets based on frequently performed investigations.

These recommendations should remain assistive rather than prescriptive.

The long-term vision is not to build a self-managing workspace, but to create a product that helps users maintain an analytical environment that continues to support them as their work evolves.