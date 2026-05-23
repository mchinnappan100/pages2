# Salesforce Deployment Runbook Standards

## Writing Clear, Reliable, and Executable Pre- and Post-Deployment Steps

## Purpose

Successful Salesforce deployments depend not only on technical quality, but also on **clear operational documentation** that ensures deployment activities can be executed consistently, accurately, and collaboratively by any authorized team member.

This document defines best practices for writing **Pre-Deployment** and **Post-Deployment** instructions so they are:

* **Clear and easy to follow**
* **Understandable by non-domain experts**
* **Peer-reviewed and formally approved**
* **Collaboratively executed across teams**
* **Verifiable and auditable**
* **Repeatable across environments**

---

# 1. Core Principles

Deployment instructions must be:

### **1. Clear and Unambiguous**

Every step must state:

* **What to do**
* **Where to do it**
* **Expected result**
* **Validation method**
* **Rollback or escalation path if failure occurs**

Avoid vague wording such as:

❌ “Check permissions”
✅ “Navigate to Setup → Profiles → System Administrator → Verify ‘Modify All Data’ is enabled”

---

### **2. Written for Non-Domain Experts**

Documentation should allow execution by an engineer who may not know:

* Salesforce metadata architecture
* Copado internals
* Apex deployment behavior
* Environment-specific dependencies

Instructions should assume **minimal context**.

Use:

* Full navigation paths
* Exact CLI commands
* Explicit button names
* Expected UI screenshots
* Validation checkpoints

---

### **3. Visual Guidance Required**

Each critical deployment step should include screenshots for:

* Navigation path
* Required selections
* Expected confirmation dialogs
* Successful execution state
* Validation result

Example:

**Step: Disable Scheduled Apex Jobs**

Include screenshot showing:

* Setup → Apex Jobs
* Filter criteria
* Jobs to pause
* Expected paused state

Screenshots reduce interpretation errors significantly.

---

# 2. Standard Deployment Document Structure

Every deployment document must follow this structure:

# Deployment Header

* Deployment Name
* Deployment ID / Copado Story / Release Number
* Target Environment
* Deployment Date & Time
* Deployment Owner
* Technical Lead
* DevOps Lead
* Business Owner
* Rollback Owner

---

# Deployment Objective

Explain:

* What is being deployed
* Why it is needed
* Business impact
* Risk level

Example:

> Deploy Opportunity validation framework enhancement to support automated partner approval workflow.

---

# Prerequisites Checklist

Document all required readiness checks:

* Code merged to correct branch
* Automated tests passed
* Manual UAT signoff complete
* Backup taken
* Org health verified
* Deployment window approved
* Stakeholders notified

Checklist format:

| Item | Status | Verified By | Timestamp |
| ---- | ------ | ----------- | --------- |

---

# 3. Writing Pre-Deployment Steps

Pre-deployment steps prepare the org safely.

Each step must include:

## Step Number

Example:

**PRE-01**

---

## Objective

What the step achieves.

Example:

Disable batch jobs to prevent record locking.

---

## Owner

Responsible team:

* DevOps
* Dev Lead
* Salesforce Admin
* QA
* Release Manager

---

## Exact Execution Steps

Example:

1. Login to Production
2. Navigate to Setup
3. Search “Scheduled Jobs”
4. Locate:

   * Batch_OpportunityRefresh
   * Batch_RecalculateTerritory
5. Click **Abort**

---

## Screenshot

Attach screenshot of:

* Correct menu
* Correct job list
* Expected post-action state

---

## Validation

State how to confirm success.

Example:

Expected:

* Job status no longer shows “Queued” or “Processing”

---

## Signoff

| Executed By | Verified By | Time | Signature |
| ----------- | ----------- | ---- | --------- |

---

# 4. Writing Deployment Execution Steps

Deployment steps should be highly explicit.

Example:

## DEP-01: Promote Package via Copado

**Execute**

1. Open Copado Pipeline
2. Select User Story Bundle
3. Verify stories included:

   * US-1024
   * US-1040
   * US-1088
4. Click **Promote**
5. Select Target: Production
6. Confirm deployment

---

**Expected Result**

Deployment status = **Success**

---

**Validation**

Verify:

* Metadata count matches package manifest
* No skipped components
* Apex tests pass

---

**Failure Action**

If failed:

* Capture error logs
* Notify release bridge immediately
* Do not retry until reviewed

---

# 5. Writing Post-Deployment Steps

Post-deployment ensures deployed features work correctly.

Include:

---

## Functional Validation

Example:

Verify Opportunity stage automation:

1. Create Opportunity
2. Move to Proposal
3. Confirm approval request generated

Expected:

Approval request visible in related list

---

## Technical Validation

Validate:

* Apex Jobs resumed
* Platform Events processing
* Async jobs healthy
* Integration endpoints responding
* No new errors in debug logs

---

## Monitoring Window

Specify:

Example:

Monitor system health for **60 minutes post deployment**

Check:

* Apex Exception Emails
* Failed Flows
* Integration failures
* Copado deployment logs

---

# 6. Peer Review Requirement

No deployment document should execute without peer review.

Reviewer responsibilities:

Validate:

* Steps are technically correct
* Instructions are complete
* Screenshots are current
* Validation steps are testable
* Rollback steps are accurate

---

## Approval Matrix

| Role                 | Name | Approval |
| -------------------- | ---- | -------- |
| Dev Lead             |      |          |
| DevOps Lead          |      |          |
| Salesforce Architect |      |          |
| QA Lead              |      |          |
| Release Manager      |      |          |

Deployment proceeds only after all approvals.

---

# 7. Collaborative Execution Model

Deployment execution is a **team activity**, never a solo effort.

Required participants:

### Dev Team Leads

Responsible for:

* Feature correctness
* Metadata validation
* Functional verification

---

### DevOps Team

Responsible for:

* Pipeline execution
* Environment integrity
* Promotion traceability

---

### QA / Business Validation Team

Responsible for:

* Smoke validation
* Business acceptance confirmation

---

### Release Coordinator

Responsible for:

* Commanding timeline
* Tracking checkpoints
* Recording signoffs

---

# 8. Double Verification Rule

Every executed step must be independently verified.

Execution flow:

**Executor performs action → Verifier confirms outcome → Team signs off**

Example:

DevOps aborts jobs
↓
Dev Lead confirms jobs stopped
↓
Both sign deployment sheet

This prevents silent execution mistakes.

---

# 9. Final Deployment Closure Checklist

Deployment closes only after:

* All post-deployment validations pass
* Monitoring period complete
* Stakeholder confirmation received
* Team signoff recorded
* Deployment artifacts archived

Archive:

* Deployment document
* Screenshots
* Logs
* Copado results
* Audit evidence
* Rollback readiness status

---

# 10. Common Documentation Mistakes to Avoid

## Avoid Assumptions

❌ “Pause jobs as needed”
✅ Explicitly list every job

---

## Avoid Missing Validation

❌ “Deploy package”
✅ Include expected success indicators

---

## Avoid Missing Screenshots

Visual guidance is mandatory.

---

## Avoid Single-Person Execution

Critical deployments require collaborative verification.

---

## Avoid Unsigned Steps

Unsigned steps are unauditable and considered incomplete.

---

# Golden Rule

**If a reasonably technical person unfamiliar with the feature cannot execute your deployment document successfully, the document is not production-ready.**

A great deployment document is:

* Clear enough for anyone authorized to execute
* Visual enough to eliminate interpretation
* Reviewed enough to prevent mistakes
* Collaborative enough to ensure safety
* Verified enough to guarantee confidence

That is the standard for professional Salesforce production deployments.
