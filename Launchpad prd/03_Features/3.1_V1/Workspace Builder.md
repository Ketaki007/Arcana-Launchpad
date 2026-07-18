# Workspace Builder

## Overview

Workspace Builder reimagines how users create analytical workspaces in Arcana Launchpad. Rather than starting with an empty canvas and manually assembling every widget, it provides a guided yet flexible way to compose a workspace tailored to the user's task.

The objective is not to automate analytical work, but to reduce the operational effort required before meaningful analysis can begin. Whether a user is starting a new company investigation, preparing for an earnings call, or comparing a group of competitors, Workspace Builder helps them get to a usable workspace faster while preserving complete control over the final layout.

---

## Why This Feature Matters

Professional analysts rarely work within a single static workspace. Throughout the day they create new layouts for different investigations, duplicate existing pages, or adapt previous analyses for a different company.

Although every investigation is unique, the setup process is often repetitive. Users repeatedly:

- Search for the same widgets
- Rearrange layouts
- Resize panels
- Configure widgets
- Link related widgets together

This setup work provides little analytical value but consumes valuable time, particularly when investigations are time-sensitive.

Workspace Builder addresses this problem by making workspace creation significantly faster without changing how professionals prefer to work.

---

## Design Objectives

Workspace Builder is guided by four primary objectives:

### Reduce setup time

Users should be able to create a functional workspace within a few interactions instead of assembling every widget manually.

### Preserve flexibility

Every generated workspace should remain fully editable. Users should never feel constrained by templates or predefined layouts.

### Encourage reuse

Users naturally develop layouts that suit their way of working. The system should encourage saving and reusing successful workspace configurations without forcing standardization.

### Lower the learning curve

For new users, creating an effective analytical workspace can feel intimidating. Workspace Builder should provide sensible starting points while allowing users to grow into more advanced workflows over time.

---

## The Proposed Experience

Workspace Builder is available whenever a user creates a new page within a workspace.

Instead of presenting an empty canvas immediately, Launchpad offers three ways to begin:

### Start from Blank

For experienced users who already know exactly what they need.

This option opens an empty page where widgets can be added manually.

---

### Use a Template

Launchpad provides a small set of curated templates based on common analytical workflows.

Examples include:

- Company Research
- Earnings Review
- Peer Comparison
- Market Monitoring

Templates are intended as starting points rather than fixed solutions. Every widget, layout and configuration remains editable after creation.

---

### Duplicate an Existing Page

Users can duplicate one of their own pages and adapt it for a new investigation.

This is particularly useful when analysts repeatedly perform similar research across different companies while preferring to maintain a familiar layout.

---

## Key Capabilities

Workspace Builder introduces several capabilities that simplify workspace creation without changing existing workflows.

### Template Library

A collection of curated page layouts aligned with common research activities.

Templates demonstrate best practices while remaining fully customizable.

---

### Widget Discovery

Widgets are grouped into logical categories, making them easier to browse and search.

Rather than requiring users to remember exact widget names, they can discover relevant tools based on their task.

---

### Drag-and-Drop Composition

Users can rearrange widgets directly on the canvas.

Layouts update dynamically while preserving alignment and spacing.

---

### Save as Template

Any completed page can be saved as a personal template.

This allows users to gradually build a library of layouts tailored to their own workflows.

---

### Duplicate Page

Existing pages can be copied and modified without affecting the original.

This supports iterative investigations while reducing repetitive setup work.

---

## User Journey

A typical experience might look like this:

An analyst wants to investigate a company ahead of its quarterly earnings announcement.

They create a new page within their Research View.

Instead of beginning with an empty canvas, they choose the **Earnings Review** template.

Launchpad creates a page containing:

- Monitor
- Description (DES)
- News (NEWS)
- Graph (GP)
- Financial Analysis (FA)
- Relative Valuation (RV)
- Notes

The analyst removes one widget they don't need, enlarges the chart, and adds another News widget filtered to industry news.

Within a minute, the workspace is ready for analysis.

The experience feels familiar because the user remains in complete control, yet significantly faster because repetitive setup has been eliminated.

---

## Design Considerations

Workspace Builder intentionally avoids becoming an AI-powered workspace generator.

Although automation could generate layouts automatically, analysts often have highly personal preferences regarding how information is organized. Enforcing a generated layout would reduce trust and increase the amount of corrective work required.

Instead, Workspace Builder focuses on accelerating composition while allowing users to shape the workspace according to their own mental model.

Templates are therefore recommendations rather than prescriptions.

Similarly, saving personal templates acknowledges that there is no single "correct" analytical layout. Different analysts solve the same problem in different ways, and the product should respect those differences.

---

## Measuring Success

Workspace Builder should improve both efficiency and confidence during workspace creation.

Success can be measured through indicators such as:

- Reduced time to create a new analytical page.
- Increased use of reusable templates.
- Fewer manual widget additions during setup.
- Higher adoption of saved personal layouts.
- Reduced abandonment during workspace creation.

While quantitative metrics are useful, qualitative feedback is equally important. Users should describe the feature as helping them get to analysis faster rather than changing the way they work.

---

## Looking Ahead

Workspace Builder establishes the foundation for future AI-assisted workspace creation.

In future releases, Prompt to Workspace could generate an initial layout from a natural language request such as:

> "Compare NVIDIA with AMD and Intel after the latest earnings."

Rather than replacing Workspace Builder, this capability would extend it by providing another starting point. Users would still retain full control over the generated workspace, ensuring that automation remains assistive rather than prescriptive.