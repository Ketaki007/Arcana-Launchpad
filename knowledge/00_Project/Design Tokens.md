---
title: Design Tokens
category: Foundation
type: Tokens
status: Draft
version: 2.0

tags:
  - tokens
  - enterprise
  - analytics
---

# Design Tokens

These tokens define the physical dimensions of the Neo Design Language.

AI should treat these as preferred defaults unless a specific use case requires deviation.

---

# Border Radius

Panels
2px

Buttons
2px

Inputs
2px

Dropdowns
2px

Charts
2px

Dialogs
4px

Avoid large rounded corners.

---

# Borders

Default
1px solid

Panels
Visible border

Tables
Visible grid

Dividers
1px

Borders should define structure instead of shadows.

---

# Shadows

Default

None

Dialogs

Very subtle elevation only when necessary.

Floating card shadows should be avoided.

---

# Layout

Widget Gap

6px

Panel Padding

8px

Section Gap

12px

Content Margin

12px

Workspace Padding

8px

The workspace should feel compact and continuous.

---

# Widget Header

Height

30px

Padding

8px horizontal

Title

13px semibold

Actions

Right aligned

---

# Toolbar

Height

32px

Gap

4px

Buttons

28px

Dropdowns

28px

Search

28px

Toolbars should remain visually lightweight.

---

# Buttons

Height

28px

Padding

8–12px horizontal

Icon Size

14px

Radius

2px

Avoid oversized primary buttons.

---

# Inputs

Height

28px

Radius

2px

Padding

8px

Font

12px

---

# Dropdowns

Height

28px

Icon

12px

Radius

2px

---

# Tabs

Height

28px

Horizontal Padding

10px

Indicator

2px

---

# Typography

Primary Heading

16px

Widget Heading

13px

Section Heading

12px

Body

12px

Caption

11px

Table Cell

12px

Metric

20px

Avoid oversized typography.

---

# Tables

Header Height

26px

Row Height

24px

Cell Padding

6px horizontal

Grid

Visible

Numbers

Right aligned

Text

Left aligned

Headers

Semibold

Tables should maximise visible rows.

---

# Icons

Default

14px

Small

12px

Large

16px

Icons support actions.

They should not dominate layouts.

---

# Charts

Padding

8px

Gridlines

Visible

Stroke Width

1.5px

Legend

Compact

Axis Labels

11px

Charts should maximise plotting area.

---

# Colors

Positive

Green

Negative

Red

Neutral

Gray

Selection

Blue

Warning

Yellow

Background

Near black

Panels

Slightly lighter than background

Borders

Low contrast gray

---

# Density

Default Density

Compact

Prefer:

- maximum information visibility
- minimum scrolling
- tightly grouped controls
- efficient use of space

Avoid layouts that sacrifice information density for visual comfort.

---

# AI Interpretation

When generating interfaces:

- Use compact dimensions by default.
- Prefer visible borders over shadows.
- Keep widgets closely grouped.
- Reduce unused whitespace.
- Optimise tables for scanning.
- Optimise charts for analysis.
- Assume users value information density over visual spaciousness.