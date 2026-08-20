# Best Practices for Copado–Jira Integration

## 1. Purpose

This document defines recommended practices for integrating **Copado** with **Jira** to provide a controlled, traceable, and auditable change-management process for Salesforce development and deployment.

The goal is to establish a clear relationship:

**Jira Issue → Copado User Story → Git Change → Copado Promotion → Salesforce Environment → Production Release**

Copado supports synchronization of Jira issues, sprints, and releases with Copado user stories and related release-management processes.

---

## 2. Guiding Principles

The integration should follow these principles:

1. **Jira is the system of record for business requirements and work management.**
2. **Copado is the system of record for Salesforce deployment orchestration.**
3. **Git is the system of record for source-code and metadata versions.**
4. Every production change must be traceable back to an approved Jira issue.
5. Developers should not manually modify deployment relationships to bypass the normal workflow.
6. Production deployments should be controlled through Copado promotions and approvals.
7. Integration credentials must use least-privilege access.
8. Automation should be preferred over manual synchronization.
9. Failed integrations must be detectable and recoverable.
10. The Jira issue, Copado user story, Git commit, and deployment should remain correlated throughout the lifecycle.

---

# 3. Recommended End-to-End Flow

The recommended lifecycle is:

```text
┌──────────────────┐
│      JIRA        │
│ Requirement /    │
│ Story / Defect   │
└────────┬─────────┘
         │
         │ Jira ↔ Copado
         ▼
┌──────────────────┐
│     COPADO       │
│   User Story     │
└────────┬─────────┘
         │
         │ Developer work
         ▼
┌──────────────────┐
│       GIT        │
│ Feature Branch   │
│ Commit / PR      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│      COPADO      │
│ Promotion /      │
│ Quality Gates    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Salesforce       │
│ Dev → QA → UAT   │
│ → Production     │
└──────────────────┘
```

Copado user stories associate development information such as the developer, environment, credential, base branch, Git branch, and latest commit information.

---

# 4. System-of-Record Responsibilities

| System                | Primary Responsibility                                                                |
| --------------------- | ------------------------------------------------------------------------------------- |
| Jira                  | Requirements, defects, acceptance criteria, priority, business approval               |
| Copado                | Salesforce change orchestration, user stories, promotions, deployments, quality gates |
| Git                   | Source-code and metadata version control                                              |
| Salesforce            | Runtime environments                                                                  |
| CI/CD / Quality Tools | Automated validation, testing, static analysis                                        |
| Change Management     | Production approval and release governance                                            |

### Important Rule

Do not allow the same piece of information to have multiple uncontrolled sources of truth.

For example:

* Jira should own the business requirement.
* Git should own the actual code.
* Copado should own deployment execution.
* Salesforce should represent the deployed state.

---

# 5. Jira Issue Design

## 5.1 Recommended Jira Issue Types

At minimum, establish standardized issue types such as:

* Story
* Bug / Defect
* Task
* Epic
* Change Request

For Salesforce production fixes, use a dedicated **Defect** issue type.

If your organization requires an explicit production-fix classification, use a mandatory Jira label such as:

```text
PRODFIX
```

This makes production fixes searchable, reportable, and auditable.

---

## 5.2 Required Jira Fields

For Salesforce-related work, consider making the following fields mandatory:

| Field                 | Purpose                             |
| --------------------- | ----------------------------------- |
| Summary               | Concise description                 |
| Description           | Business/technical requirement      |
| Acceptance Criteria   | Definition of done                  |
| Priority              | Business priority                   |
| Issue Type            | Story / Defect / Task               |
| Assignee              | Responsible developer               |
| Sprint                | Development iteration               |
| Release / Fix Version | Target release                      |
| Environment           | Target environment where applicable |
| Component             | Salesforce application/domain       |
| Labels                | Classification such as `PRODFIX`    |
| Business Owner        | Requirement owner                   |
| Technical Owner       | Technical responsibility            |

Avoid creating excessive custom Jira fields. Every custom field increases administration, integration complexity, reporting complexity, and synchronization risk.

---

# 6. Jira Key as the Primary Correlation Identifier

The Jira issue key should be the primary identifier used to correlate the systems.

Example:

```text
Jira:
WML-1842

Copado:
User Story → WML-1842

Git:
feature/WML-1842-product-pricing

Commit:
WML-1842 Fix pricing calculation

Promotion:
WML-1842

Production:
WML-1842
```

This creates a simple audit trail.

### Recommended naming convention

```text
<JIRA-KEY>-<short-description>
```

Examples:

```text
WML-1842-product-pricing
WML-1910-fix-order-validation
WML-2044-update-permission-set
```

---

# 7. Copado User Story Best Practices

A Copado User Story should normally represent one coherent unit of Salesforce change.

### Good

```text
WML-1842
Update product pricing calculation
```

### Avoid

```text
WML-1842
Pricing + Account changes + Security changes + Data migration
```

Large unrelated changes should be decomposed into separate Jira issues and Copado user stories.

This improves:

* deployment isolation
* rollback analysis
* testing
* code review
* troubleshooting
* release reporting
* auditability

---

# 8. One-to-One Mapping

Whenever practical, use:

```text
1 Jira Issue
      ↓
1 Copado User Story
      ↓
1 Feature Branch
```

There can be legitimate exceptions, but many-to-many mappings should be minimized.

For example:

```text
Jira WML-1842
      ↓
Copado User Story WML-1842
      ↓
feature/WML-1842
      ↓
multiple commits
```

This is significantly easier to understand than:

```text
Jira WML-1842
       ↘
        Copado US-101
       ↘
        Copado US-108
       ↘
        Copado US-119
```

unless there is a deliberate architectural reason for doing so.

---

# 9. Git Branching

Use a consistent branch convention.

Recommended:

```text
feature/<jira-key>-<short-description>
```

Examples:

```text
feature/WML-1842-product-pricing
feature/WML-1910-order-validation
feature/WML-2044-permission-update
```

Commit messages should include the Jira key:

```text
WML-1842 Fix product pricing calculation
```

For multiple commits:

```text
WML-1842 Add pricing validation
WML-1842 Add unit tests
WML-1842 Fix null handling
```

The Jira key should therefore be visible in:

* branch name
* commit message
* Copado User Story
* deployment/promotion
* release documentation

---

# 10. Do Not Use Git as a Shortcut Around Copado

The repository is the source of truth for versioned Salesforce metadata, but deployment governance should remain in Copado.

Avoid:

```text
Developer
   ↓
Git
   ↓
sf deploy metadata
   ↓
Production
```

when the organization requires Copado-controlled deployments.

Instead:

```text
Developer
   ↓
Copado User Story
   ↓
Git
   ↓
Copado Promotion
   ↓
Quality Gates
   ↓
Approval
   ↓
Salesforce
```

Copado documentation also identifies deployments performed outside Copado as a limitation in certain Source Format Pipeline configurations, reinforcing the importance of defining one controlled deployment path.

---

# 11. Quality Gates

Quality gates should be applied before promotion to higher environments.

Typical gates include:

```text
Git validation
      ↓
Code review
      ↓
Compile / deployment validation
      ↓
Apex tests
      ↓
Static analysis
      ↓
Security checks
      ↓
Automated tests
      ↓
Business validation
      ↓
Promotion
```

Where applicable, configure gates centrally rather than allowing individual developers to bypass them.

Copado supports deployment-step and quality-gate orchestration as part of promotion execution.

---

# 12. Jira Status Synchronization

Keep Jira statuses business-oriented.

Example:

```text
Jira

Open
  ↓
In Progress
  ↓
Code Review
  ↓
Ready for QA
  ↓
QA
  ↓
UAT
  ↓
Ready for Production
  ↓
Released
```

Copado can represent the technical deployment lifecycle.

Do not attempt to make Jira reproduce every Copado technical state.

For example, Jira does not need statuses such as:

```text
Git Snapshot Created
Promotion Branch Created
Deployment Job Created
Deployment Step 17 Running
Metadata Validation Started
```

Those belong in Copado.

---

# 13. Recommended Jira ↔ Copado Status Model

A useful conceptual mapping is:

| Jira                 | Copado                            |
| -------------------- | --------------------------------- |
| Open                 | User Story Created                |
| In Progress          | Development                       |
| Code Review          | Commit / Review                   |
| Ready for QA         | Ready for Promotion               |
| QA                   | QA Environment                    |
| UAT                  | UAT Environment                   |
| Ready for Production | Ready to Promote                  |
| Released             | Production Deployment Successful  |
| Blocked              | Deployment / Quality Gate Failure |

Keep the mapping simple.

---

# 14. Production Deployment Governance

Production deployments should have stronger controls than lower environments.

Recommended process:

```text
Jira Defect / Change
       ↓
Business Approval
       ↓
Copado User Story
       ↓
Code Review
       ↓
Automated Tests
       ↓
QA/UAT
       ↓
Production Approval
       ↓
Copado Promotion
       ↓
Production Deployment
       ↓
Validation
       ↓
Jira → Released
```

For emergency production fixes:

```text
Jira Issue Type = Defect
Label = PRODFIX
```

The production-fix classification should be mandatory for emergency changes.

---

# 15. Prevent Unauthorized Production Changes

Establish technical controls so that:

* Developers cannot directly deploy to Production.
* Production credentials are restricted.
* Production deployment requires appropriate Copado permissions.
* Jira approval is required where organizational policy mandates it.
* Quality gates cannot be casually bypassed.
* Emergency changes are explicitly classified.
* All production deployments have a Jira reference.

A production deployment without a Jira reference should be treated as a governance exception.

---

# 16. Integration Account

Use a dedicated integration identity for Jira ↔ Copado where supported.

Do not use an individual employee account such as:

```text
john.doe@company.com
```

as the permanent integration identity.

Prefer:

```text
copado-jira-integration@company.com
```

Benefits:

* employee-independent
* easier auditing
* easier credential rotation
* predictable permissions
* simpler incident investigation

Grant only the permissions required by the integration.

---

# 17. Credential and Security Best Practices

Never store:

* Jira passwords
* API tokens
* OAuth secrets
* Salesforce credentials
* client secrets

in:

* Git repositories
* Jira descriptions
* Copado User Stories
* deployment scripts
* Slack messages
* documentation

Use the supported authentication mechanism and rotate credentials according to corporate security policy.

For modern Atlassian integrations, verify which integration mechanism your Copado version supports. Copado's current AI platform documentation notes that its Jira integration uses Atlassian's official MCP implementation, replacing an earlier Copado-hosted third-party MCP implementation.

---

# 18. Network and Integration Reliability

For enterprise environments, document the complete connectivity path.

For example:

```text
Copado
   |
   | HTTPS
   v
Corporate Network / F5
   |
   v
Security Controls
   |
   v
Atlassian / Jira
```

If an F5 or other network gateway is involved, document:

* DNS
* certificates
* TLS termination
* outbound IP requirements
* firewall rules
* allowlists
* proxy requirements
* certificate renewal ownership
* monitoring
* failure escalation

A certificate change should have an explicit owner and renewal process.

---

# 19. Integration Monitoring

Monitor at least:

### Connectivity

```text
Jira reachable?
Copado reachable?
Authentication valid?
Certificate valid?
```

### Synchronization

```text
Jira → Copado successful?
Copado → Jira successful?
```

### Business synchronization

```text
Issue created
User Story created
Status synchronized
Sprint synchronized
Release synchronized
Comments synchronized
```

### Deployment correlation

```text
Jira Issue
   ↓
Copado User Story
   ↓
Promotion
   ↓
Deployment
```

Failures should generate actionable alerts.

---

# 20. Handling Integration Failures

Do not manually recreate records immediately when synchronization fails.

First determine:

1. Did Jira create the issue?
2. Did Copado receive the issue?
3. Was authentication successful?
4. Did field mapping fail?
5. Did a required field fail validation?
6. Did the integration timeout?
7. Did the integration create a duplicate?
8. Was the issue already synchronized?

Example:

```text
Jira
  |
  | create/update
  v
Integration
  |
  X
  |
  v
Copado
```

Capture the failure ID and integration logs before retrying.

---

# 21. Avoid Duplicate Issues

Duplicate Jira ↔ Copado records are one of the most dangerous integration problems because they can result in:

* duplicate deployments
* duplicate work
* incorrect reporting
* incorrect release status
* broken traceability

Use a stable correlation identifier.

Prefer:

```text
Jira Key = WML-1842
```

rather than:

```text
Jira Summary = "Fix pricing issue"
```

The summary is not a unique identifier.

---

# 22. Field Mapping

Keep field mapping deliberately small.

Example:

| Jira        | Copado                 |
| ----------- | ---------------------- |
| Issue Key   | Jira Issue Key         |
| Summary     | User Story Name        |
| Description | User Story Description |
| Assignee    | Developer              |
| Sprint      | Sprint                 |
| Fix Version | Release                |
| Priority    | Priority               |
| Status      | User Story Status      |
| Labels      | Labels                 |
| Issue URL   | Jira URL               |

Avoid synchronizing fields that have different meanings in the two systems.

---

# 23. Jira Releases and Copado Releases

Establish a clear relationship between:

```text
Jira Fix Version
        ↕
Copado Release
```

Use consistent release naming.

Example:

```text
Jira:
WML 2026.08

Copado:
WML-2026.08
```

Avoid situations where Jira calls a release:

```text
August Release
```

while Copado calls it:

```text
Sprint 11 Production
```

unless there is a documented mapping.

Copado supports synchronization involving Jira sprints and releases, so release naming should be standardized before enabling synchronization at scale.

---

# 24. Sprint Management

Jira should remain the authoritative source for sprint planning.

Recommended:

```text
Jira Sprint
    ↓
Copado synchronization
    ↓
Copado User Stories
```

Do not maintain independent sprint definitions in both systems unless required.

---

# 25. Defect Management

For production defects:

```text
Jira
  ↓
Defect
  ↓
PRODFIX label
  ↓
Copado User Story
  ↓
Hotfix branch
  ↓
QA
  ↓
Production
```

The defect should contain:

* production impact
* root cause
* affected functionality
* reproduction information
* fix description
* test evidence
* deployment reference

---

# 26. Emergency Fixes

Emergency fixes should be exceptional.

Recommended control:

```text
Normal Change
   → Normal Pipeline

Emergency Change
   → Jira Defect
   → PRODFIX
   → Expedited Approval
   → Controlled Copado Promotion
   → Production
   → Mandatory Post-Deployment Review
```

Never use "emergency" as a justification for bypassing traceability.

---

# 27. Permission Model

Use role separation.

### Developer

* Create/update assigned work
* Create commits
* Work with development environments
* Cannot directly deploy Production

### QA

* Execute/validate tests
* Approve QA/UAT
* Report defects

### Release Manager

* Manage promotions
* Coordinate releases
* Approve production deployment

### Integration User

* Jira/Copado synchronization only
* No unnecessary Salesforce privileges

### Administrator

* Configure integration
* Manage mappings
* Manage credentials
* Monitor failures

Apply least privilege everywhere.

---

# 28. Change Management

Any change to the Jira ↔ Copado integration should itself be controlled.

Examples:

* authentication changes
* Jira URL changes
* certificate changes
* field mapping changes
* status mapping changes
* webhook changes
* network/F5 changes
* permission changes
* integration user changes

Maintain:

```text
Change Request
      ↓
Test in Non-Production
      ↓
Validation
      ↓
Approval
      ↓
Production Change
      ↓
Post-Change Verification
```

---

# 29. Testing the Integration

Maintain a dedicated integration test scenario.

Example:

### Test 1 — Jira → Copado

```text
Create Jira Story
       ↓
Verify Copado User Story
```

### Test 2 — Field Synchronization

```text
Change Jira Priority
       ↓
Verify Copado
```

### Test 3 — Status Synchronization

```text
Move Jira → Ready for QA
       ↓
Verify Copado
```

### Test 4 — Release Synchronization

```text
Create Jira Release
       ↓
Verify Copado Release
```

### Test 5 — Failure Recovery

```text
Break authentication
       ↓
Create/update Jira issue
       ↓
Verify failure detection
       ↓
Restore authentication
       ↓
Verify recovery
```

### Test 6 — Production Traceability

```text
Jira
  ↓
Copado
  ↓
Git
  ↓
Promotion
  ↓
Production
```

Verify that the entire chain is auditable.

---

# 30. Operational Runbook

Maintain a runbook containing:

## Integration Information

* Jira URL
* Copado org
* Integration owner
* Backup owner
* Integration account
* Authentication mechanism
* Network dependencies

## Security

* Credential owner
* Rotation process
* Certificate owner
* Expiration monitoring

## Troubleshooting

* Authentication failure
* Connection failure
* Synchronization failure
* Duplicate records
* Status mismatch
* Field mapping failure
* Jira API limits
* Copado integration failure

## Escalation

```text
L1 → DevOps Support
L2 → Copado Administrator
L3 → Network/Security
L4 → Copado Support / Atlassian Support
```

---

# 31. Reporting and Audit

A good integration should make it possible to answer:

> Why was this production change made?

Starting from a Production deployment, the organization should be able to identify:

```text
Production Deployment
       ↓
Copado Promotion
       ↓
Copado User Story
       ↓
Jira Issue
       ↓
Business Requirement
       ↓
Approval
```

Starting from Jira should provide the reverse path:

```text
Jira Issue
   ↓
Copado User Story
   ↓
Git Commit
   ↓
Promotion
   ↓
Deployment
   ↓
Production
```

This bidirectional traceability is one of the most important outcomes of the integration.

---

# 32. Recommended Production Release Dashboard

A release dashboard should show:

| Metric                | Example |
| --------------------- | ------: |
| Jira Stories          |      42 |
| Defects               |       8 |
| PRODFIX               |       2 |
| Copado User Stories   |      42 |
| Ready for Production  |      35 |
| Successfully Deployed |      31 |
| Failed Deployments    |       2 |
| Blocked               |       2 |
| Pending Approval      |       4 |

Also track:

* deployment success rate
* deployment duration
* failed deployments
* rollback count
* emergency changes
* defects after deployment
* lead time
* change failure rate

---

# 33. Anti-Patterns to Avoid

### Anti-pattern 1 — Individual user owns integration

```text
Jira ↔ John's account ↔ Copado
```

**Problem:** integration breaks when the employee leaves or changes roles.

**Better:**

```text
Jira ↔ Dedicated Integration Identity ↔ Copado
```

---

### Anti-pattern 2 — Free-form Jira/Copado relationships

Developers manually create unrelated Copado User Stories.

**Problem:** poor traceability.

**Better:** require a Jira key.

---

### Anti-pattern 3 — Direct Production deployment

```text
Developer → Salesforce Production
```

**Problem:** bypasses governance.

**Better:**

```text
Jira → Copado → Quality Gates → Approval → Production
```

---

### Anti-pattern 4 — Duplicate release definitions

Different names for the same release in Jira and Copado.

**Problem:** reporting becomes unreliable.

**Better:** standardized release naming.

---

### Anti-pattern 5 — Too many synchronized fields

**Problem:** mapping becomes fragile.

**Better:** synchronize only fields that have clear business value.

---

### Anti-pattern 6 — Treating Jira as the deployment engine

Jira should describe and govern the work.

Copado should orchestrate Salesforce deployment.

---

# 34. Recommended Governance Checklist

* [ ] Every Salesforce change has a Jira issue.
* [ ] Every Jira issue requiring Salesforce changes has a Copado User Story.
* [ ] Jira issue key is used as the correlation identifier.
* [ ] Git branch contains the Jira key.
* [ ] Commit messages contain the Jira key.
* [ ] Copado promotions contain the associated user stories.
* [ ] Production deployments require appropriate approvals.
* [ ] Production changes are traceable to Jira.
* [ ] Emergency production fixes use a standardized classification such as `PRODFIX`.
* [ ] Dedicated integration identity is used.
* [ ] Least-privilege permissions are enforced.
* [ ] Integration credentials are securely managed.
* [ ] Certificate expiration is monitored.
* [ ] Jira/Copado field mappings are documented.
* [ ] Jira/Copado status mappings are documented.
* [ ] Release naming is standardized.
* [ ] Integration failures are monitored.
* [ ] Duplicate synchronization is prevented.
* [ ] Integration recovery procedures are documented.
* [ ] Integration configuration changes follow change management.
* [ ] Periodic access reviews are performed.
* [ ] End-to-end auditability is periodically tested.

---

# 35. Reference Architecture

```text
                    ┌──────────────────────┐
                    │        JIRA          │
                    │                      │
                    │ Stories              │
                    │ Defects              │
                    │ Sprints               │
                    │ Releases              │
                    │ Approvals             │
                    └──────────┬───────────┘
                               │
                         Jira Connector
                               │
                               ▼
                    ┌──────────────────────┐
                    │       COPADO         │
                    │                      │
                    │ User Stories          │
                    │ Pipelines             │
                    │ Promotions            │
                    │ Quality Gates         │
                    │ Deployments           │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │         GIT          │
                    │                      │
                    │ Feature Branches      │
                    │ Commits               │
                    │ Pull Requests         │
                    └──────────┬───────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │       SALESFORCE PIPELINE      │
              │                                │
              │ DEV → QA → UAT → Production    │
              └────────────────────────────────┘
```

---

# 36. Executive Recommendation

The strongest operating model is:

> **Jira manages the "why" and "what"; Git manages the "source"; Copado manages the "how and when"; Salesforce is the deployed runtime.**

The Jira–Copado connector should therefore be treated as a **change-management integration**, not simply a synchronization mechanism.

The most important design decision is to preserve a stable chain of identity:

```text
Jira Key
   ↓
Copado User Story
   ↓
Git Branch
   ↓
Git Commit
   ↓
Copado Promotion
   ↓
Deployment
   ↓
Salesforce Environment
```

If this chain is consistently enforced, the organization gains reliable release reporting, auditability, troubleshooting, production governance, and significantly better visibility into the Salesforce delivery lifecycle.

Copado's current documentation should be used as the authoritative source for the exact connector capabilities and configuration supported by the installed Copado version, because integration capabilities evolve over time.
