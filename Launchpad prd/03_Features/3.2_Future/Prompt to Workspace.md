# Prompt to Workspace

## Overview

Prompt to Workspace reimagines how users begin analytical work in Launchpad. Instead of manually assembling widgets, configuring layouts and linking context before analysis can begin, users simply describe what they want to accomplish in natural language.

The system interprets the user's intent and generates a workspace tailored to the investigation, complete with relevant widgets, initial configurations and contextual relationships.

Rather than replacing the analyst's workflow, Prompt to Workspace accelerates the setup process by providing an intelligent starting point. The generated workspace remains fully editable, allowing users to refine and adapt it according to their own analytical preferences.

---

## Why This Feature Matters

Every analytical investigation begins with preparation.

Whether an analyst is reviewing quarterly earnings, comparing competitors or investigating unusual market activity, they typically spend the first few minutes building an appropriate workspace by selecting widgets, arranging layouts and configuring each component.

Although these tasks are necessary, they contribute little to the actual analytical process.

Prompt to Workspace shifts the interaction from interface construction to analytical intent.

Instead of asking:

- Which widgets should I add?
- Which company should I configure first?
- Which layout should I use?

Users simply describe the question they want to answer.

By reducing repetitive setup work, analysts can begin exploring insights almost immediately while retaining complete ownership of the generated workspace.

---

## Design Objectives

Prompt to Workspace is guided by four primary objectives.

### Start with Intent

Allow users to express what they want to investigate rather than manually constructing the environment required to support it.

---

### Reduce Operational Friction

Automate repetitive workspace creation while preserving flexibility and user control.

---

### Generate Relevant Starting Points

Create workspaces that are appropriate for the requested task without assuming they are complete or final.

---

### Preserve Transparency

Users should understand why a workspace has been generated in a particular way and should be able to modify every aspect of it.

---

## The Proposed Experience

Users can create a new workspace either from the traditional Workspace Builder or by choosing **Prompt to Workspace**.

Instead of selecting templates or manually adding widgets, they enter a natural language prompt.

Examples include:

> Compare NVIDIA, AMD and Intel after the latest earnings announcement.

> Help me investigate Tesla before tomorrow's earnings call.

> Create a workspace to monitor banking stocks impacted by recent interest rate changes.

Launchpad interprets the request and assembles a workspace containing the most relevant widgets for the investigation.

For a peer comparison, the generated workspace may include:

- Monitor
- Description (DES)
- News (NEWS)
- Graph Price (GP)
- Financial Analysis (FA)
- Relative Valuation (RV)
- Notes

Where possible, widgets are preconfigured using the companies, filters and relationships inferred from the prompt.

The analyst can immediately begin working, making any changes they feel are necessary.

---

## Key Capabilities

### Natural Language Workspace Creation

Users create analytical workspaces by describing their objective instead of manually selecting every component.

---

### Intelligent Widget Selection

Launchpad identifies the widgets most relevant to the requested investigation based on the user's intent.

---

### Automatic Widget Configuration

Generated widgets are preconfigured with relevant securities, comparisons, date ranges and filters wherever appropriate.

---

### Shared Context

Widgets are automatically connected so that selecting a company or security updates related components across the workspace.

---

### Fully Editable Workspaces

Every generated workspace can be modified, expanded or reorganized after creation.

The generated layout serves as a starting point rather than a completed solution.

---

## Design Considerations

Prompt to Workspace should be viewed as an assistant rather than an autonomous analyst.

Its responsibility is to prepare an environment for analysis—not perform the analysis itself.

The generated workspace should always be understandable, predictable and easy to modify.

Equally important is avoiding overconfidence.

The system should not attempt to infer complex analytical intent beyond what the user has expressed.

Instead, it should generate a sensible first draft that reflects common analytical workflows while encouraging users to refine the workspace based on their own expertise.

Maintaining transparency throughout the generation process helps build trust and ensures users remain in control of their investigation.

---

## Measuring Success

Prompt to Workspace should reduce the effort required to begin a new investigation.

Success can be evaluated through indicators such as:

- Reduced time required to create a new workspace.
- Decreased manual widget additions during setup.
- Increased adoption of AI-generated workspaces.
- Positive user feedback regarding relevance and ease of customization.
- High rates of workspace refinement rather than complete regeneration.

Ultimately, success is measured by how quickly users can transition from describing an analytical objective to actively exploring information.

---

## Looking Ahead

Prompt to Workspace represents the next evolution of Workspace Builder.

As Launchpad develops a deeper understanding of user workflows, future generations of this feature could consider previous investigations, preferred layouts and recurring research patterns when generating workspaces.

Over time, analysts may spend less time constructing interfaces and more time expressing intent.

The role of the product evolves from providing tools to intelligently preparing the environment in which meaningful analysis can begin.