# DevOps Best Practices with Copado

### Field-tested guidance for Salesforce release management

---

## Agenda

1. Foundational Principles
2. Pipeline Hygiene
3. Git Practices
4. Testing & Code Quality
5. Governance & Compliance
6. Team Culture & Collaboration
7. Advanced Patterns
8. Quick Reference

---

## 01 · Foundational Principles

> Get these right first — everything else builds on them.

| Principle | Rule |
|---|---|
| Source of truth | Git is the **only** source of truth — no side-door changes |
| Automation | Quality gates are non-negotiable — no bypass without documented override |
| Traceability | Every metadata change must link to a User Story |
| Size | One story per logical change — keep them small and atomic |
| Compliance | Audit trail is automatic in Salesforce — use it |
| Separation | The developer who writes code must **not** approve it for Production |

---

## 01 · Key Principle: Git is the Single Source of Truth

```
All metadata changes → Git → Copado pipeline → Target org
```

**Why it matters:**
- Full history of who changed what and when
- Clean rollback at any granularity
- No "mystery changes" appearing in Production
- Pre-requisite for any meaningful audit trail

> "If a metadata change cannot be traced to a User Story, it should not exist in your pipeline."

---

## 01 · Key Principle: Separation of Duties

```
Developer writes code
       ↓
Peer reviewer approves
       ↓
Release Manager promotes to UAT/Production
       ↓
Compliance Officer signs off (regulated environments)
```

**Configure in Copado Approvals — not just a policy document nobody reads.**

---

## 02 · Pipeline Hygiene

> Reliable pipelines that are safe to run every day.

### Recommended 4-stage pipeline

```
Dev Org  →  QA Org  →  UAT Org  →  Production
```

### Production stage quality gates (in order)

| Gate | Tool | Threshold |
|---|---|---|
| 1 | PMD Static Analysis | 0 Critical violations |
| 2 | Apex Tests | Coverage ≥ 80% |
| 3 | Copado Robotic Tests | All E2E suites green |
| 4 | Manual CAB Approval | Release Manager sign-off |

---

## 02 · Protect Production with Layered Gates

```
Gate 1: PMD Scan     → 0 Critical violations
Gate 2: Apex Tests   → ≥ 80% coverage
Gate 3: Robotic E2E  → all suites green
Gate 4: CAB Approval → Release Manager sign-off

Override policy: document justification + senior approval
```

**No gate should be bypassed — even for "urgent" fixes.**  
Urgent fixes still need all gates. If the gates are too slow, speed up the gates.

---

## 02 · Never Deploy on Fridays

```
✓  Tuesday   10:00–14:00 local time
✓  Wednesday 10:00–14:00 local time
⚠  Thursday  only if hotfix is truly critical
✗  Friday    afternoon — avoid entirely
✗  Holiday eve — avoid entirely
```

**Why:**
- Full business days available to respond to incidents
- Prevents weekend emergency on-call burnout
- Reduces pressure to skip post-deployment validation

---

## 02 · Use Environment Variables for Config

**Never hardcode org-specific values inside metadata.**

```
Environment Variable: PARTNER_API_URL

Dev org  : https://api-sandbox.partner.com
QA org   : https://api-qa.partner.com
Prod org : https://api.partner.com
```

In Apex:
```apex
String url = System.Label.PARTNER_API_URL;
```

Same User Story deploys cleanly across all orgs — no code changes needed.

---

## 02 · Tag Releases with Milestones

```
Release: "Spring '25 — Wave 1"
  Milestone: Core Platform (due Mar 1)
  ├── US-101 Custom Lead Scoring
  ├── US-102 Opportunity Kanban View
  Milestone: Integrations (due Mar 8)
  ├── US-110 DocuSign Envelope Trigger
  └── US-112 Jira Auto-Sync
```

**Benefits:**
- Rollback an entire feature set as a unit
- Communicate scope and progress to stakeholders
- Coordinate cross-team delivery timelines

---

## 03 · Git Practices

> A clean Git repo is the backbone of a healthy Copado implementation.

### Trunk-based branching model

```
main                         ← Production baseline
└── integration/dev          ← Dev environment branch
│   └── feature/US-042       ← Lives ≤ 1 sprint
│   └── feature/US-043
└── integration/qa           ← QA environment branch
└── integration/uat          ← UAT environment branch
```

**Feature branches live only as long as the User Story they represent.**  
Long-lived feature branches = drift = painful merges.

---

## 03 · Always Retrieve Before You Commit

```
Step 1: Make changes in Dev sandbox
Step 2: Click "Retrieve Changes" in Copado   ← never skip this
Step 3: Review diff — confirm only your changes appear
Step 4: Commit to Git branch
```

> ⚠️ Skipping Step 2 is the single most common cause of "phantom changes" appearing in deployments — changes that nobody remembers making.

---

## 03 · Monthly Git Hygiene Checklist

```
□ Delete merged feature branches older than 30 days
□ Run a full Git Snapshot on Production
□ Verify integration branches are up-to-date with main
□ Review and close abandoned User Stories
□ Confirm branch naming conventions are followed
```

**Cadence: monthly, 30 minutes, assigned to a single owner.**

---

## 03 · Meaningful Commit Messages

**Good:**
```
feat(US-042): Add Renewal Date field to Contract
fix(US-047):  Correct validation rule on Opportunity
chore(US-050): Remove deprecated workflow rule
```

**Bad:**
```
"fixed stuff"
"WIP"
"asdf"
```

When something breaks at 2am, a clear commit history is  
the fastest path to understanding what changed and when.

---

## 04 · Testing & Code Quality

> Prevention is always cheaper than firefighting.

### The testing pyramid for Salesforce + Copado

```
         ▲ Manual UAT sign-off
        ▲▲▲ Copado Robotic E2E tests
       ▲▲▲▲▲ Apex unit & integration tests
      ▲▲▲▲▲▲▲ PMD static code analysis
```

**Each layer catches a different class of defect.**  
Skipping a layer just shifts where defects are discovered — always later and always more expensively.

---

## 04 · Enforce Code Coverage Minimums

```
Quality Gate config:
  Metric  : Apex Code Coverage
  Operator: Greater than or equal to
  Value   : 80
  On Fail : Block promotion, notify developer
```

**Trend monitoring:**
- If coverage drops > 5% week-over-week → alert #dev-leads
- Never let coverage degrade silently
- Coverage is a leading indicator of technical debt

---

## 04 · Zero Tolerance for Critical PMD Violations

```
PMD scan result on AccountService.cls:

[CRITICAL] Line 42: SOQL query inside a for loop
           Rule: AvoidSoqlInLoops

[MEDIUM]   Line 78: Empty catch block detected
           Rule: EmptyCatchBlock

Gate result: ❌ BLOCKED — 1 Critical violation
Fix: move SOQL outside loop, re-promote
```

- **Critical** → always blocks promotion
- **Medium** → warning only (configurable per stage)
- QA can be lenient; Production must be strict

---

## 04 · Automate E2E Tests with Robotic Testing

```
Test Suite: Opportunity E2E

Step 1: Navigate to /lightning/o/Opportunity/new
Step 2: Assert modal title = "New Opportunity"
Step 3: Fill Name = "Test Deal Q1"
Step 4: Select Stage = "Prospecting"
Step 5: Click Save
Step 6: Assert record created successfully

On failure: ❌ block promotion + link back to User Story
```

**Run automatically on every promotion to UAT.**  
E2E tests are the safety net that static analysis cannot provide.

---

## 05 · Governance & Compliance

> Change management that is auditable by default.

### What Copado provides natively

| Feature | Benefit |
|---|---|
| Deployment history | Full log of who deployed what and when |
| Approval workflows | Enforced sign-off chain, not just policy |
| Audit trail | Native Salesforce object — no extra infrastructure |
| Separation of duties | Configurable in Copado Approvals |
| Compliance reports | Export to PDF/CSV for auditors |

---

## 05 · Document Deployment Steps as Runbooks

```
Deployment Task: "Post-Deploy Data Load"

  □ Export Account records from QA (report: Acct_Backup)
  □ Run DataLoader import on Production
  □ Verify record count matches QA (expected: 1,240)
  □ Notify #salesforce-ops channel when complete
```

**These Deployment Task checklists become your runbook automatically.**  
No separate wiki page. No "I thought someone else did that."

---

## 05 · Configure Roles and Permissions Correctly

```
Sarah (Admin)   → Configure pipelines, manage Git settings
James (Dev)     → Create stories, commit, promote Dev/QA
Lisa (Rel Mgr)  → Promote to UAT and Production
Bob (Read Only) → View history and logs only

Org credentials: OAuth only — no plain-text passwords stored
```

**Do not give everyone Copado Admin "just for convenience."**  
Least-privilege access is the first line of defence against accidental Production changes.

---

## 05 · Multi-Org All-or-Nothing Releases

```
Release: Spring '25 — Wave 1

  Pipeline A: Sales Cloud NA → UAT ✅
  Pipeline B: Sales Cloud EU → UAT ✅
  Pipeline C: Service Cloud  → UAT ✅

  Release Gate: All 3 pipelines at UAT?
  → Yes: proceed to coordinated Production deploy
```

**Partial releases that break cross-org integrations are the worst outcome.**  
Use Copado Release records to coordinate the all-or-nothing gate.

---

## 06 · Team Culture & Collaboration

> The best pipelines fail when teams do not support them.

### The human factors that matter most

| Factor | Practice |
|---|---|
| Git knowledge | Train every developer on Git fundamentals |
| Visibility | Wire Slack & Jira notifications to Copado events |
| Metrics | Weekly 15-min pipeline health review |
| Conflict prevention | Flag shared metadata in daily standups |
| Psychological safety | Blameless post-mortems on deployment failures |

---

## 06 · Train Teams on Git Fundamentals

**Minimum Git literacy for every Copado developer:**

```
□ What is a branch and why it matters
□ How to read a diff and understand a conflict marker
□ git log, git status — reading history
□ What "rebase vs merge" means in plain English
□ How to recover from a bad commit with git revert
```

**Copado abstracts Git — but not completely.**  
A developer who doesn't understand Git will create conflicts  
that Copado's UI cannot save them from.

---

## 06 · Wire Slack and Jira Notifications

```
🚀 Copado Deployment — Production

Pipeline : Sales Cloud Release
Stories  : US-105, US-112, US-118
Status   : ✅ Success
Duration : 4m 22s
By       : Lisa Chen (Release Manager)

Jira: linked tickets auto-transition to "Done"
```

**No more "did it deploy yet?" messages in Slack.**  
The pipeline tells the team — the team doesn't have to ask.

---

## 06 · Weekly Pipeline Health Review

**15 minutes. Same time every week. Three questions:**

1. **Deployment frequency**  
   Are we shipping small changes often, or batching large risky releases?

2. **Gate failure rate**  
   Which Quality Gates fire most? That's where to invest in developer enablement.

3. **Mean time to restore (MTTR)**  
   When incidents occur, how quickly do we detect and roll back?

> "What gets measured gets managed."

---

## 07 · Advanced Patterns

> For teams who have mastered the basics.

### Extend pipelines with Copado Functions

```python
def run(context):
    stories = context.get("userStories")
    for story in stories:
        status = jira_api.get_status(story["jiraKey"])
        if status != "Approved":
            return {"success": False, "message": f"{story['jiraKey']} not approved"}
    return {"success": True}
```

Any custom logic — Jira validation, security checks, data migration scripts —  
becomes a first-class pipeline citizen with full result reporting back to Copado.

---

## 07 · Leverage Copado AI for Risk Prediction

```
Story: "Allow Sales reps to clone Opportunities with Products"

AI-Generated Test Cases:
  TC-01: Clone Opp without Products → verify empty clone
  TC-02: Clone Opp with 5 Products  → verify all copied
  TC-03: Clone closed/won Opp       → verify stage resets
  TC-04: Clone as non-owner         → verify sharing rules

Risk Prediction: MEDIUM RISK
  Reason: Opportunity trigger touched by 3 other active stories
```

Use AI risk scores to **prioritize testing effort** and make informed go/no-go decisions.

---

## 07 · Integrate via Copado REST API

```http
POST /services/apexrest/copado/v1/promote
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "userStoryId": "a0B5g000001XkLm",
  "targetEnvironment": "QA",
  "runTests": true,
  "notifySlack": true
}
```

**Trigger promotions from GitHub Actions, Jenkins, or any external system.**  
Full CI/CD automation — not limited to Salesforce-native tooling.

---

## 07 · Adopt 2nd-Gen Packaging (2GP)

```json
{
  "packageDirectories": [
    {
      "package": "FinanceCore",
      "versionNumber": "2.4.0.NEXT"
    },
    {
      "package": "FinanceReports",
      "dependencies": [
        { "package": "FinanceCore", "versionNumber": "2.4.0.1" }
      ]
    }
  ]
}
```

- Dependencies become **explicit** and **versioned**
- Rollback = install the previous package version
- Reproducible builds across all pipeline orgs

---

## 08 · Quick Reference

### Anti-pattern vs Best Practice

| Practice area | ✗ Anti-pattern | ✓ Best Practice | Impact |
|---|---|---|---|
| User Story sizing | "Q4 Improvements" (50+ items) | One story per logical change | 🔴 High |
| Metadata commit | Commit without retrieving first | Always retrieve before committing | 🔴 High |
| Deploy timing | Friday afternoon deployments | Tue–Wed 10:00–14:00 windows | 🟡 Medium |
| Org config | Hardcoded URLs in metadata | Copado Environment Variables | 🟡 Medium |
| Code coverage | Allow deployments below 75% | Gate at ≥80%, alert on trend | 🔴 High |
| Git hygiene | Never delete old branches | Monthly cleanup + Git Snapshot | 🟢 Low |
| Permissions | Everyone gets Copado Admin | Role-based, least privilege | 🔴 High |
| Release tracking | Ad-hoc spreadsheet | Copado Release records + Milestones | 🟡 Medium |
| Conflict prevention | Assume nobody touches your component | Flag shared metadata in standups | 🟡 Medium |

---

## 08 · Production Hotfixes

> Speed matters — but so does discipline. A hotfix that skips all guardrails is just a second incident waiting to happen.

### The hotfix pipeline — fast-track, not guardrail-free

```
🚨 P1 Incident   →   Hotfix branch   →   HF sandbox / UAT
     declared         off main             verification
                                               ↓
                   Back-merge ←   Production   ←   RM approval
                  to main + dev    emergency deploy   (expedited)
```

---

## 08 · Define What Qualifies as a Hotfix

**Not every Production issue is a hotfix.** Establish clear criteria and stick to them.

| Severity | Trigger | Response |
|---|---|---|
| 🔴 P1 | Production down for all users, data loss, critical integration broken | Hotfix immediately |
| 🟠 P2 | Core feature broken for majority, no acceptable workaround | Hotfix may be warranted |
| 🟡 P3 | Feature not working as intended, workaround exists | Normal pipeline |
| 🟢 P4 | Cosmetic issues, minor defects | Normal pipeline, next release |

> Invoking the hotfix pipeline for non-critical issues erodes quality and trust in the process.

---

## 08 · Branch Off main — Not Integration

```
# Correct — branch off the Production baseline
main
└── hotfix/HF-2025-001-payment-timeout
    # Fix scoped to the issue only
    # No refactoring, no unrelated changes

# Wrong — risks pulling unreleased dev work to Production
integration/dev
└── hotfix/...   ← ❌ may contain unreleased changes
```

**Always branch your hotfix off `main`.**  
Branching off `integration/dev` risks deploying unreleased features alongside your fix.

---

## 08 · Streamlined Gates — Not Zero Gates

```
✓ Keep:       PMD scan on changed files only
✓ Keep:       Apex tests on directly affected classes
✓ Keep:       Release Manager approval (expedited)
✓ Keep:       Deploy to Hotfix sandbox first

⚡ Streamline: Skip full E2E Robotic test suite
⚡ Streamline: Skip UAT sign-off (time-boxed decision)

✗ Never skip: Apex tests on touched classes
✗ Never skip: Deployment validation step
```

**A broken hotfix is worse than the original incident.**

---

## 08 · Assemble the Right Team Immediately

**Define roles before an incident — not during one.**

| Role | Responsibility |
|---|---|
| Incident Commander | Owns the war room, makes go/no-go calls |
| Developer | Writes the fix — scoped to the issue only |
| Release Manager | Owns the Copado promotion and approval |
| QA / Verifier | Validates fix in hotfix sandbox |
| Comms owner | Updates stakeholders throughout |

Speed in a hotfix comes from having the right people instantly — not from skipping process.

---

## 08 · Consider Rollback Before Writing a Fix

```
Was a deployment made in the last 2 hours?
  Yes → Can we rollback that deployment?
        Yes → ROLLBACK FIRST — fix in normal pipeline
        No  → Proceed with hotfix process

  No  → Is there a known Salesforce platform issue?
        Yes → Open SF support case, monitor trust.salesforce.com
        No  → Proceed with hotfix process
```

**Rollback is faster, lower risk, and buys time.**  
Always ask the rollback question before spending time writing a fix.

---

## 08 · Back-Merge Within 24 Hours

**The step teams most often skip when exhausted after an incident.**

```
# After Production deploy — same day:

1. Merge hotfix → main
   (Production baseline stays current)

2. Merge hotfix → integration/dev
   (Dev branch gets the fix)

3. Merge hotfix → integration/qa
   (QA branch gets the fix)

⚠ Missing steps 2 or 3:
   Your next regular release OVERWRITES the hotfix
```

**Assign the back-merge to a named person before the war room disbands.**

---

## 08 · Post-Incident Review Within 48 Hours

**Blameless. Forward-looking. Documented.**

```
□ Timeline of events (detection → resolution)
□ Root cause identified (not just symptoms)
□ Contributing factors — process, tooling, communication
□ Action items with owners and due dates
□ Detection gap: why did monitoring not catch this earlier?
□ Prevention: what pipeline or test change prevents recurrence?
```

The goal is not to assign fault — it is to understand the system failure  
and make it impossible to repeat.

---

## 08 · Keep the Hotfix Narrowly Scoped

```
✓ Good hotfix scope:
  • 1 Apex class modified (null check added)
  • 1 validation rule disabled temporarily
  • 1 permission set assignment corrected

✗ Scope creep to avoid:
  • "We also cleaned up the trigger while there"
  • "We refactored the method for readability"
  • "We added the feature that was blocked on this"

Rule: if the diff is >200 lines, it's not a hotfix
```

**Fix the issue — nothing else. Every extra line is extra risk.**

---

## Summary: The 15 Rules

1. **Git is the single source of truth** — no side-door changes
2. **Quality gates are non-negotiable** — no bypass without documentation
3. **One User Story, one logical change** — keep them small
4. **Always retrieve before you commit** — never skip this step
5. **Protect Production with layered gates** — PMD → Apex → E2E → Approval
6. **Never deploy on Fridays** — or holiday eves
7. **Use Environment Variables** — never hardcode org-specific values
8. **Enforce code coverage minimums** — gate at ≥80%, watch the trend
9. **Zero tolerance for critical PMD violations** — fix before promoting
10. **Separate duties** — the writer must not be the approver
11. **Train your team on Git fundamentals** — Copado can't save Git-illiterate developers
12. **Measure and review pipeline health** — weekly, three metrics
13. **Define P1/P2 criteria before an incident** — hotfix process must be pre-agreed
14. **Always consider rollback before writing a hotfix** — it's faster and lower risk
15. **Back-merge the hotfix within 24 hours** — or your next release overwrites it

---

## Resources & Next Steps

| Resource | Link |
|---|---|
| Complete Copado Guide | [guide-v2.html](https://mchinnappan100.github.io/pages2/devops/copado/guide-v2.html) |
| Architecture Reference | [arch-v2.html](https://mchinnappan100.github.io/pages2/devops/copado/arch-v2.html) |
| Copado Documentation | [docs.copado.com](https://docs.copado.com) |
| Salesforce DevOps Center | [Trailhead](https://trailhead.salesforce.com) |

---

*Copado DevOps Best Practices · Field-tested guidance for Salesforce release management*