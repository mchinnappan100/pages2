**GitFlow in Copado** is Copado's Git-based branching strategy for managing Salesforce development across multiple environments (Development → QA → UAT → Production). It builds on the general GitFlow model but automates much of the branching, merging, promotion, and deployment process specifically for Salesforce metadata.

## Traditional GitFlow

A standard GitFlow model looks like this:

```text
                 +------------------+
                 |      main        |  (Production)
                 +------------------+
                         ^
                         |
                    Release Merge
                         |
                 +------------------+
                 |     release      |
                 +------------------+
                   ^            |
                  /              \
         Feature Merge      Hotfix Merge
                /                |
+------------------+      +------------------+
| feature/ABC-123  |      | hotfix/BUG-101   |
+------------------+      +------------------+
                ^
                |
         +------------------+
         |    develop       |
         +------------------+
```

---

## GitFlow in Copado

Copado adapts this model to Salesforce using **User Stories**, **Promotions**, and **Pipeline Environments**.

```mermaid
flowchart LR
    D[Developer Org]
    G[Feature Branch]
    DEV[Development Branch]
    QA[QA Branch]
    UAT[UAT Branch]
    MAIN[Main / Production]

    D --> G
    G --> DEV
    DEV --> QA
    QA --> UAT
    UAT --> MAIN

    MAIN -->|Hotfix| HF[Hotfix Branch]
    HF --> MAIN
    HF --> DEV
```

---

## How it works

### 1. User Story creates a Feature Branch

When a developer starts work:

```
main
  |
develop
  |
feature/US-123
```

Each User Story gets its own Git branch.

Developer changes:

* Apex
* LWC
* Flows
* Objects
* Layouts
* Permission Sets

are committed into that feature branch.

---

### 2. Promote to QA

Once development is complete:

```
feature/US-123
        |
        v
develop
        |
 Promotion
        |
        v
QA
```

Copado automatically

* validates metadata
* merges branches
* deploys metadata
* runs tests
* updates promotion status

---

### 3. Promote to UAT

After QA approval:

```
develop
    |
    v
QA
    |
 Promotion
    |
    v
UAT
```

Only approved User Stories are promoted.

---

### 4. Promote to Production

```
UAT
  |
 Promotion
  |
main
```

Production deployment is generated from selected User Stories.

This provides:

* traceability
* approvals
* deployment history

---

## Hotfix Flow

Production bug:

```text
main
  |
hotfix/BUG-201
  |
main
  |
back merge
  |
develop
```

Copado automatically back-merges so future releases don't overwrite the fix.

---

## Branch hierarchy example

```text
main
 │
 ├───────────────┐
 │               │
release/2.5      hotfix/BUG-18
 │
develop
 │
 ├── feature/US-100
 ├── feature/US-101
 ├── feature/US-102
```

---

## Copado objects involved

| Object      | Purpose                                   |
| ----------- | ----------------------------------------- |
| User Story  | Unit of work                              |
| Promotion   | Moves User Stories between environments   |
| Commit      | Git commit tied to a User Story           |
| Deployment  | Deploys metadata to an org                |
| Pipeline    | Defines DEV → QA → UAT → PROD flow        |
| Environment | Maps a Salesforce org to a pipeline stage |

---

## Advantages

* One branch per User Story
* Automatic branch creation
* Automatic Git merges
* Automatic deployments
* Full audit trail
* Approval gates
* Rollback capability
* Git history linked to Salesforce work items

---

## Common challenges

For large Salesforce programs, GitFlow can become difficult when:

* Many developers modify the same metadata (profiles, layouts, flows).
* Long-lived feature branches diverge significantly, leading to merge conflicts.
* Large bundled deployments make it hard to isolate failures.
* Multiple release trains require careful cherry-picking and back-merging.
* Manual post-deployment steps are not represented in Git.

These are some of the reasons many organizations complement or modify classic GitFlow with trunk-based practices, feature flags, or automated release orchestration.

---

## Best practices

* Keep User Stories small and focused.
* Merge frequently to reduce conflicts.
* Avoid long-lived feature branches.
* Use selective promotions rather than deploying everything in QA or UAT.
* Automate validation and testing at each pipeline stage.
* Back-merge production hotfixes promptly.
* Treat metadata like Profiles, Permission Sets, and Flows with extra care because they are common sources of merge conflicts.

For large enterprise Salesforce implementations, teams often customize Copado's GitFlow to support **parallel release trains**, **hotfix pipelines**, and **multiple production releases**, balancing Git discipline with the realities of Salesforce metadata development.
