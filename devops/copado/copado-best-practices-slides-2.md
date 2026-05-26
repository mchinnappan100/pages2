# DevOps Best Practices with Copado
### Proven patterns for world-class Salesforce release management

**8 Practice Domains · 35+ Best Practices · 14 Code Examples · 4 Quality Gate Layers**

---

## Agenda

1. Foundational Principles
2. Pipeline Hygiene
3. Git Practices
4. Testing & Code Quality
5. Governance & Compliance
6. Team Culture & Collaboration
7. Advanced Patterns
8. Production Hotfixes
9. Quick Reference

---

## 01 — Foundational Principles
### The non-negotiable rules every high-performing Copado team lives by

| Principle | Rule |
|---|---|
| **Source of truth** | Git is the single source of truth — no side-door changes |
| **Automation** | Quality gates are non-negotiable — no bypassing without documented justification |
| **Traceability** | Every change must link to a User Story |
| **Size** | Small, focused User Stories minimize merge conflicts and enable surgical rollback |
| **Compliance** | Audit trail is automatic — every deployment action is logged natively |
| **Separation** | Developer who writes code must never approve it for Production |

---

## 02 — Pipeline Hygiene
### Designing reliable pipelines safe to run every day

**Recommended Gate Configuration:**

```
Dev → QA → UAT → Prod
       |     |      |       |
  PMD 0crit  80%  E2E ✅  CAB ✅
```

- **Gate 1:** PMD Scan → 0 Critical violations
- **Gate 2:** Apex Tests → ≥ 80% coverage
- **Gate 3:** Robotic E2E → all suites green
- **Gate 4:** CAB Approval → Release Manager sign-off

> Override policy: document justification + senior approval

---

## 02 — Pipeline Hygiene (cont.)
### Scheduling & configuration best practices

**Deployment Windows**
- ✅ Tuesday 10:00–14:00 local time
- ✅ Wednesday 10:00–14:00 local time
- ⚠️ Thursday only if hotfix is truly critical
- ❌ Friday afternoon — avoid entirely
- ❌ Holiday eve — avoid entirely

**Environment Variables**
Never hardcode org-specific values. Use Copado's Environment Variables so the same User Story deploys cleanly across all orgs.

```
PARTNER_API_URL
  Dev  → https://api-sandbox.partner.com
  QA   → https://api-qa.partner.com
  Prod → https://api.partner.com
```

---

## 02 — Pipeline Hygiene (cont.)
### Tag releases with Milestones

Use Copado Release records and Milestones to group related User Stories.

```
Release: "Spring '25 — Wave 1"
  Milestone: Core Platform (due Mar 1)
    ├── US-101 Custom Lead Scoring
    └── US-102 Opportunity Kanban View
  Milestone: Integrations (due Mar 8)
    ├── US-110 DocuSign Envelope Trigger
    └── US-112 Jira Auto-Sync
```

---

## 03 — Git Practices
### A clean Git repo is the backbone of a healthy Copado implementation

**Always Retrieve Before You Commit**

1. Make changes in Dev sandbox
2. Click **"Retrieve Changes"** in Copado
3. Review diff — confirm only *your* changes appear
4. Commit to Git branch

> ⚠️ Skipping the retrieve step is the **single most common cause** of "phantom changes" appearing in deployments.

---

## 03 — Git Practices (cont.)
### Trunk-based branching & commit hygiene

**Trunk-Based Branching Model**
```
main ← Production baseline
└── integration/dev
    └── feature/US-042  ← Lives ≤ 1 sprint
integration/qa
integration/uat
```

**Meaningful Commit Messages**
```
✓ feat(US-042): Add Renewal Date field to Contract
✓ fix(US-047): Correct validation rule on Opportunity
✓ chore(US-050): Remove deprecated workflow rule

✗ "fixed stuff"   ✗ "WIP"   ✗ "asdf"
```

**Monthly Git Hygiene Checklist**
- Delete merged feature branches older than 30 days
- Run a full Git Snapshot on Production
- Verify integration branches are up-to-date with main

---

## 04 — Testing & Code Quality
### Catch issues in Dev and QA — not on release day

**Apex Code Coverage Gate**
```
Metric   : Apex Code Coverage
Operator : Greater than or equal to
Value    : 80%
On Fail  : Block promotion, notify developer
```

**PMD — Zero Tolerance for Critical Violations**
```
[CRITICAL] Line 42: SOQL inside for loop → BLOCKED ❌
[MEDIUM]   Line 78: Empty catch block    → Warning ⚠️
```
- Critical violations **always** block promotion
- Medium violations generate a warning

---

## 04 — Testing & Code Quality (cont.)
### Robotic Testing & Scratch Orgs

**Automate E2E Tests with Robotic Testing**
```
Test Suite: Opportunity E2E
  Step 1: Navigate to New Opportunity
  Step 2: Assert modal = "New Opportunity"
  Step 3: Fill Name & Stage
  Step 4: Click Save
  Step 5: Assert record created successfully
On failure: block promotion, link to User Story
```

**Test in Scratch Orgs (2GP)**
```bash
# Create a fresh scratch org
sfdx force:org:create \
  -f config/project-scratch-def.json \
  -a FinanceCore-Test --durationdays 7
```

---

## 05 — Governance & Compliance
### Enterprise-grade controls, auditable by default

**Role-Based Access Control**
```
Sarah (Admin)    → Configure pipelines, manage Git
James (Dev)      → Create stories, commit, promote Dev/QA
Lisa (Rel Mgr)   → Promote to UAT and Production
Bob (Read Only)  → View history and logs only
```

**Monthly Compliance Report Fields**
- Deployed By (user)
- Deployment Date/Time
- Target Environment
- Metadata Components changed
- Approval chain

**Multi-Org All-or-Nothing Releases**
Use Copado Release records to coordinate across pipelines. Partial releases that break cross-org integrations are the worst outcome.

---

## 06 — Team Culture & Collaboration
### The best pipelines fail when teams don't support them

**Git Literacy for All Developers**
- What is a branch and why it matters
- How to read a diff and understand a conflict marker
- `git log`, `git status` — reading history
- How to recover from a bad commit with `git revert`

**Weekly Pipeline Health Review (15 min)**

| Metric | Question |
|---|---|
| Deployment frequency | Shipping small changes often, or batching large risky releases? |
| Gate failure rate | Which gates fire most? Where to invest in enablement? |
| Mean time to restore | How quickly can the team detect and roll back? |

**Shift-Left on Conflict Prevention:** Check open User Stories before starting work · Flag shared metadata in standups

---

## 07 — Advanced Patterns
### For teams ready to push to the next level

**Copado Functions** — Custom serverless logic as a first-class pipeline citizen
```python
def run(context):
    for story in context.get("userStories"):
        if jira_api.get_status(story["jiraKey"]) != "Approved":
            return {"success": False}
    return {"success": True}
```

**Copado AI** — Risk prediction and AI-generated test cases
```
Story: "Allow Sales reps to clone Opportunities"
AI Test Cases: Clone without Products, with Products,
               verify stage resets, non-owner sharing
Risk: MEDIUM — Opp trigger touched by 3 active stories
```

**Copado REST API** — Trigger promotions from GitHub Actions or Jenkins
```json
POST /services/apexrest/copado/v1/promote
{ "userStoryId": "a0B5g000001XkLm",
  "targetEnvironment": "QA", "runTests": true }
```

---

## 07 — Advanced Patterns (cont.)
### 2nd-Gen Packaging (2GP)

Shift from org-based deployments to modular, versioned packages.

```json
{
  "packageDirectories": [
    { "package": "FinanceCore",    "versionNumber": "2.4.0.NEXT" },
    { "package": "FinanceReports", "dependencies": [
        { "package": "FinanceCore@2.4.0.1" }
    ]}
  ]
}
```

- Dependencies become explicit
- Versions are reproducible
- Rollback is a version number change

---

## 08 — Production Hotfixes
### Speed matters — but so does discipline

**Hotfix Pipeline (Fast-Track)**
```
P1 Incident → HF Branch → HF Sandbox → Prod → Back-merge
```

**Severity Classification**
| Level | Definition |
|---|---|
| **P1** | Production down, data loss, payments/auth broken, compliance breach |
| **P2** | Core feature broken for majority, no acceptable workaround |
| **P3/P4** | Cosmetic issues, minor defects → normal pipeline |

> ⚠️ Invoking the hotfix pipeline for non-critical issues erodes quality and trust.

---

## 08 — Production Hotfixes (cont.)
### Branch & quality gate rules

**Always Branch Off `main`**
```
main
└── hotfix/HF-2025-001-payment-timeout  ✅

integration/dev
└── hotfix/...  ❌ risks pulling unreleased work to Prod
```

**Minimum Safety Floor (Don't Skip These)**
- ✅ PMD scan on changed files only
- ✅ Apex tests on directly affected classes
- ✅ Release Manager approval (expedited)
- ✅ Deployment to a hotfix sandbox first
- ⚡ Skip full E2E Robotic suite (streamlined)
- ❌ NEVER skip Apex tests on touched classes

> Rule: if the diff is **>200 lines**, it's not a hotfix.

---

## 08 — Production Hotfixes (cont.)
### War room & back-merge

**Hotfix War Room Roles**
- **Incident Commander** — owns war room, makes go/no-go calls
- **Developer** — writes the fix, scoped to issue only
- **Release Manager** — owns the Copado promotion and approval
- **QA / Verifier** — validates fix in hotfix sandbox
- **Comms Owner** — updates stakeholders throughout

**Back-Merge Within 24 Hours**
```bash
# After Production deploy — same day:
git merge hotfix/HF-2025-001 → main
git merge hotfix/HF-2025-001 → integration/dev
git merge hotfix/HF-2025-001 → integration/qa
```

> ⚠️ Missing the back-merge means the **next regular release overwrites your hotfix**.

---

## 08 — Production Hotfixes (cont.)
### Rollback decision tree & post-incident review

**Consider Rollback Before Writing a Fix**
```
Was a deployment made in the last 2 hrs?
  Yes → Can we rollback?
          Yes → ROLLBACK FIRST, fix in normal pipeline
          No  → Proceed with hotfix process
  No  → Is there a Salesforce platform issue?
          Yes → Open support case, monitor trust.salesforce.com
          No  → Proceed with hotfix process
```

**Post-Incident Review (within 48 hrs) — Blameless Checklist**
- [ ] Timeline of events (detection → resolution)
- [ ] Root cause identified
- [ ] Contributing factors (process, tooling, comms)
- [ ] Action items with owners and due dates
- [ ] Detection gap — why didn't monitoring catch this?
- [ ] Prevention — what pipeline/test change prevents recurrence?

---

## 09 — Quick Reference
### Anti-pattern vs. Best Practice

| Practice Area | Anti-pattern ✗ | Best Practice ✓ | Impact |
|---|---|---|---|
| User Story sizing | "Q4 Improvements" (50+ items) | One story per logical change | **High** |
| Metadata commit | Commit without retrieving first | Always retrieve before committing | **High** |
| Deploy timing | Friday afternoon | Tue–Wed 10:00–14:00 windows | Medium |
| Org-specific config | Hardcoded URLs in metadata | Copado Environment Variables | Medium |
| Code coverage | Allow below 75% | Gate at ≥80%, alert on downward trend | **High** |
| Git hygiene | Never delete old branches | Monthly cleanup + Git Snapshot | Low |
| Permissions | Everyone gets Copado Admin | Role-based, least privilege | **High** |
| Release tracking | Ad-hoc spreadsheet | Copado Release records + Milestones | Medium |
| Conflict prevention | Assume nobody touches your component | Flag shared metadata in standups | Medium |

---

## Key Takeaways

> These practices are a **baseline, not a ceiling**.

The highest-performing Salesforce DevOps teams revisit and raise their standards every quarter — using these north-star metrics:

- 📈 **Deployment Frequency** — ship small, ship often
- ⏱️ **Lead Time** — idea to production, measured in hours not weeks
- 📉 **Change Failure Rate** — quality gates catch issues, not users

---

*Copado Best Practices · A companion to the Complete Guide and Architecture Reference*