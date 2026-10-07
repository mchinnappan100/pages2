# Salesforce Manual Deployment Steps


![keyides](https://raw.githubusercontent.com/mchinnappan100/npmjs-images/main/manual/manual-steps.png)

## Do’s, Don’ts & Best Practices

**Purpose:**
Provide a consistent, safe, and repeatable way to document and execute **manual Salesforce deployment steps** when a change cannot be deployed through standard Metadata API / source-driven deployment.

---

## 1. Why This Playbook Exists

Not every Salesforce change can be fully automated through metadata deployment.

Some deployments require actions such as:

* Salesforce Setup configuration
* Data updates
* Permission changes
* Activation/deactivation
* Configuration that depends on existing records
* Revenue Cloud / Industries configuration
* Post-deployment UI actions
* Actions that must be performed in a specific sequence

Manual steps are therefore sometimes necessary.

However, a manual step that says:

> "Go to Setup and enable the feature."

is **not a deployment procedure**.

A good manual deployment step should allow another qualified engineer to execute it **without needing to ask the author what they meant**.

---

# 2. Golden Rule

> **A manual deployment step must be deterministic, executable, verifiable, and traceable.**

The person executing the deployment should know:

1. **Where** to perform the action
2. **What** to change
3. **What value** to use
4. **In what order** to perform it
5. **How** to verify success
6. **What to do if it fails**
7. **How to undo it**, when applicable

---

# 3. The Anatomy of a Good Manual Step

Every manual deployment step should preferably contain:

| Element          | Description                      |
| ---------------- | -------------------------------- |
| Step #           | Unique sequence number           |
| Purpose          | Why the step is required         |
| Precondition     | What must already be true        |
| Location         | Where the action is performed    |
| Action           | Exact action to perform          |
| Value            | Exact value/configuration        |
| Expected Result  | What success looks like          |
| Validation       | How to verify                    |
| Failure Handling | What to do if it fails           |
| Rollback         | How to reverse the change        |
| Owner            | Responsible person/team          |
| Evidence         | Screenshot, record ID, log, etc. |

---

# 4. DO — Write Specific Instructions

### Good

> Navigate to **Setup → Flows → Flows**.
> Open **Order Processing Flow**.
> Click **Activate**.
> Confirm that the flow status changes from **Draft** to **Active**.

### Bad

> Activate the Order Processing Flow.

The second instruction assumes that the executor knows:

* where the flow is,
* which version to activate,
* what status to expect.

Avoid assumptions.

---

# 5. DO — Identify the Exact Salesforce Component

Always identify the component precisely.

### Good

> Update the **Order Processing Flow**, version **15**, and activate it.

### Bad

> Update the Order Flow.

Salesforce environments frequently contain similarly named:

* Flows
* Permission Sets
* Permission Set Groups
* Custom Metadata records
* Record Types
* Apex classes
* Lightning pages
* Validation Rules

Use the **exact API name** whenever possible.

### Recommended format

**Label:** Order Processing Flow
**API Name:** `Order_Processing_Flow`
**Version:** 15

---

# 6. DO — Separate Navigation from Action

Make the path easy to follow.

### Recommended

**Navigation**

`Setup → Object Manager → Order → Fields & Relationships`

**Action**

1. Open **Order Status**.
2. Click **Edit**.
3. Set **Required** to enabled.
4. Click **Save**.

This is much easier to execute than a paragraph describing the entire operation.

---

# 7. DO — Specify Exact Values

Never make the deployment engineer guess the value.

### Bad

> Update the threshold to the required value.

### Good

> Set **Maximum Order Value** to `100000`.

For metadata/data values, specify:

* Exact value
* Case
* Format
* Units
* Boolean state
* Date/time format

For example:

> Set `Enabled__c = true`.

is better than:

> Enable the setting.

---

# 8. DO — Use API Names Where Appropriate

Salesforce labels can change.

API names provide better precision.

### Good

> Update the `Order_Status__c` field.

### Better

> **Label:** Order Status
> **API Name:** `Order_Status__c`

For data operations, prefer API names whenever possible.

---

# 9. DO — Include Preconditions

A manual step may depend on another deployment step.

Explicitly document that dependency.

### Example

> **Precondition:**
> `Order_Status__c` must exist before executing this step.

Then:

> **Step:**
> Update the `Order_Status__c` field configuration.

This prevents an executor from attempting steps in the wrong order.

---

# 10. DO — Define Execution Order

Some Salesforce deployments are sequence-sensitive.

For example:

```text
1. Deploy metadata
        ↓
2. Create required configuration
        ↓
3. Update data
        ↓
4. Activate automation
        ↓
5. Validate
```

Do not assume that someone will infer the correct order.

If order matters, explicitly state:

> **Important:** Execute Step 4 only after Step 3 has completed successfully.

---

# 11. DO — Provide Validation Steps

Every important manual action should have a verification method.

### Weak

> Save the configuration.

### Strong

> Save the configuration.

**Validation:**

1. Reopen the configuration.
2. Confirm `Enabled = true`.
3. Execute the test scenario `Order_Create_001`.
4. Confirm that the order is successfully created.

The deployment is not complete merely because the user clicked **Save**.

---

# 12. DO — Define Expected Results

The executor should know what success looks like.

### Example

**Expected Result**

* Flow status = `Active`
* Version = `15`
* No validation errors
* Test order created successfully
* Expected downstream automation executed

This turns a manual step into a testable procedure.

---

# 13. DO — Include Failure Handling

Manual deployment procedures should anticipate failure.

### Example

**If activation fails:**

1. Capture the Salesforce error message.
2. Do not proceed to Step 7.
3. Verify that all prerequisite metadata is deployed.
4. Contact the release owner.
5. Attach the error message and deployment evidence to the deployment record.

This prevents someone from continuing with a partially completed deployment.

---

# 14. DO — Include Rollback Instructions

Ask:

> "If this step causes a problem, how do we return the org to its previous state?"

For reversible changes, document the rollback.

### Example

**Deployment**

```text
Enabled = true
```

**Rollback**

```text
Enabled = false
```

For irreversible changes, explicitly state:

> **Rollback:** Not automatically reversible. Contact the Salesforce Platform team before proceeding.

Never assume every Salesforce change can be easily rolled back.

---

# 15. DO — Identify Data Changes Carefully

Manual data changes require extra precision.

### Bad

> Update the customer record.

### Good

> Navigate to **Accounts** and locate the account where:

```text
Account Number = 00123456
```

Update:

```text
Customer_Status__c = Active
```

Save the record.

**Validation:**

Confirm:

```text
Customer_Status__c = Active
```

### Prefer stable identifiers

Use:

* Salesforce ID
* External ID
* Account Number
* SKU
* Global Key
* Unique business identifier

Avoid relying only on record names.

---

# 16. DO — Be Careful With Salesforce Automation

Manual changes can trigger:

* Flows
* Apex triggers
* Process automation
* Platform Events
* Integrations
* Approval processes
* Revenue Cloud processing
* External systems

Before performing a data update, consider:

> **What automation will this action trigger?**

Document this when relevant.

### Example

> **Warning:** Updating this field triggers `Order_Update_Flow`.

This allows the deployment engineer to understand the impact of the action.

---

# 17. DO — Explicitly Document Activation

Activation is a common source of deployment mistakes.

Do not simply write:

> Activate the flow.

Specify:

* Flow name
* API name
* Version
* Expected status

### Example

> Activate `Order_Processing_Flow`, version **15**.

**Validation:**

```text
Status = Active
Active Version = 15
```

---

# 18. DO — Distinguish Configuration from Data

Clearly identify whether a step changes:

### Metadata

Examples:

* Flow
* Apex
* Custom Object
* Field
* Permission Set
* Validation Rule

or:

### Data

Examples:

* Account
* Product
* Price
* Configuration record
* Custom Metadata / Custom Setting record

This distinction is important for:

* Deployment planning
* Security
* Auditability
* Rollback
* Troubleshooting

---

# 19. DO — Include Required Permissions

Sometimes the deployment fails simply because the executor lacks permissions.

Document special requirements.

### Example

> **Required Permission:**
> User must have permission to modify Flow definitions.

or:

> **Required Permission:**
> User must have access to modify `Product2` records.

This avoids wasting deployment time diagnosing permission errors.

---

# 20. DO — Capture Evidence

For high-risk manual steps, capture evidence.

Examples:

* Screenshot
* Record ID
* Configuration value
* Flow version
* Deployment log
* Validation result

### Example

> After completing the step, attach a screenshot showing:
>
> `Order_Processing_Flow — Version 15 — Active`

Evidence provides an audit trail.

---

# 21. DON'T — Write Ambiguous Instructions

Avoid:

* "Update as needed"
* "Configure appropriately"
* "Set the correct value"
* "Enable the feature"
* "Make the necessary changes"
* "Update the records"
* "Verify everything is working"

These phrases transfer the author's knowledge to the executor's imagination.

---

# 22. DON'T — Assume Tribal Knowledge

Avoid statements such as:

> "Do the usual Revenue Cloud configuration."

or:

> "Follow the standard process."

A deployment procedure should be usable even by someone who did not develop the feature.

If another document is required, reference it explicitly.

---

# 23. DON'T — Use Screenshots as the Only Instruction

Screenshots are useful, but they should **supplement**, not replace, written instructions.

### Weak

> "Click here."

with only a screenshot.

### Better

> Navigate to **Setup → Flows → Flows**.
> Open `Order_Processing_Flow`.
> Select version 15 and click **Activate**.

Then provide the screenshot as supporting evidence.

Why?

Salesforce UI layouts can change.

---

# 24. DON'T — Use Coordinates or UI-Specific Assumptions

Avoid instructions such as:

> Click the third button from the left.

Instead:

> Click **Activate**.

Prefer semantic names over screen positions.

---

# 25. DON'T — Use "Latest Version" Without Identifying It

This is risky:

> Activate the latest version.

The latest version can change between documentation and deployment.

Instead:

> Activate **version 15**.

If the version genuinely must be dynamically determined:

> Activate the version created by deployment `DEP-12345`.

---

# 26. DON'T — Mix Multiple Actions Into One Step

### Bad

> Update the field, activate the flow, update the configuration records, and test the order.

This creates ambiguity when one action succeeds and another fails.

### Better

```text
Step 1 — Update field

Step 2 — Update configuration

Step 3 — Activate flow

Step 4 — Validate
```

Small, atomic steps are easier to execute and troubleshoot.

---

# 27. DON'T — Hide Dependencies

Avoid:

> Update Product configuration.

Instead:

> **Precondition:** Product Classification metadata must already be deployed.

Then perform the configuration update.

---

# 28. DON'T — Continue After a Critical Failure

A deployment procedure should clearly define stop conditions.

### Example

> **STOP:** If Step 3 fails, do not continue with Steps 4–8.

This is especially important when later steps depend on successful earlier steps.

---

# 29. DON'T — Put Secrets in Deployment Instructions

Never include:

* Passwords
* Access tokens
* Client secrets
* API keys
* Private keys
* Session IDs

Instead reference the approved secret-management mechanism.

### Bad

```text
Username: integration@example.com
Password: ********
```

### Good

> Authenticate using the approved integration-user credentials stored in the organization's credential-management system.

---

# 30. DON'T — Modify Production Data Without a Safety Check

For production data updates, always consider:

* Record count
* Target records
* Backup/recovery
* Automation impact
* Integration impact
* Validation
* Rollback

For bulk changes, include a **dry-run / query validation** where possible.

### Example

Before update:

```sql
SELECT Id, Name, Status__c
FROM Account
WHERE External_Id__c = 'ABC123'
```

Confirm the returned record is the intended target.

Then perform the update.

---

# 31. Recommended Manual Step Template

Use the following template for every manual deployment step.

```text
Step #: <number>

Title:
<short descriptive title>

Purpose:
<why this step is required>

Preconditions:
- <condition 1>
- <condition 2>

Location:
<Setup / Object / Application / Tool>

Target:
<component name>
API Name: <API name>
Version: <version if applicable>

Action:
1. <action>
2. <action>
3. <action>

Expected Result:
- <expected outcome>

Validation:
1. <validation step>
2. <validation step>

Failure Handling:
- <what to do if the step fails>

Rollback:
- <how to reverse the change>
OR
- Not reversible — contact <team>

Evidence:
- <what evidence should be captured>

Owner:
<team/person>
```

---

# 32. Example — Good Manual Deployment Step

## Step 4 — Activate Order Processing Flow

**Purpose**

Activate the new Order Processing automation after the required metadata and configuration have been deployed.

**Preconditions**

* `Order_Status__c` field is deployed.
* Required configuration records exist.
* Flow version 15 is available.

**Target**

```text
Flow Label: Order Processing Flow
API Name: Order_Processing_Flow
Version: 15
```

**Action**

1. Navigate to **Setup → Flows**.
2. Search for `Order_Processing_Flow`.
3. Open the flow.
4. Select **Version 15**.
5. Click **Activate**.

**Expected Result**

The flow is activated successfully.

**Validation**

Confirm:

```text
Flow Status     = Active
Active Version  = 15
```

Execute the deployment smoke test:

```text
Create Test Order
        ↓
Order Processing Flow
        ↓
Expected processing result
```

**Failure Handling**

If activation fails:

1. Capture the Salesforce error.
2. Do not continue to the next deployment step.
3. Verify all prerequisites.
4. Notify the release owner.
5. Attach the error and evidence to the deployment record.

**Rollback**

If required, deactivate version 15 and restore the previously active flow version.

---

# 33. High-Risk Manual Changes

Additional review is recommended for:

* Production data updates
* Permission changes
* Sharing changes
* Flow activation
* Trigger activation
* Validation Rule activation
* Integration configuration
* Revenue Cloud configuration
* Pricing configuration
* Product configuration
* Changes affecting large data volumes
* Changes affecting external integrations
* Changes that cannot be rolled back

For these changes, require:

> **Peer Review → Execution → Validation → Evidence**

---

# 34. Manual Deployment Quality Checklist

Before submitting manual deployment steps, ask:

### Clarity

* [ ] Is every action explicitly stated?
* [ ] Are Salesforce component names exact?
* [ ] Are API names included where useful?
* [ ] Are exact values provided?
* [ ] Are screenshots supplemental rather than mandatory?

### Sequence

* [ ] Are prerequisites documented?
* [ ] Are dependencies documented?
* [ ] Is execution order clear?
* [ ] Are stop conditions defined?

### Validation

* [ ] Does every important change have a validation step?
* [ ] Is the expected result documented?
* [ ] Is there a smoke test where appropriate?

### Safety

* [ ] Is rollback documented?
* [ ] Are production data changes protected?
* [ ] Are automation/integration side effects considered?
* [ ] Are secrets excluded?

### Audit

* [ ] Is evidence required?
* [ ] Is the responsible owner identified?
* [ ] Can another engineer reproduce the procedure?

---

# 35. The "5-Question Test"

Before approving a manual deployment procedure, the reviewer should ask:

> **1. What am I changing?**

> **2. Where am I changing it?**

> **3. What exactly should the value be?**

> **4. How do I know it worked?**

> **5. What do I do if it doesn't work?**

If the deployment instructions cannot answer all five questions, they are probably not ready.

---

# 36. Definition of Done

A manual deployment step is **DONE** when:

```text
        ┌─────────────────────┐
        │ Exact Target        │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │ Exact Action        │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │ Expected Result     │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │ Validation          │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │ Evidence            │
        └──────────┬──────────┘
                   ↓
        ┌─────────────────────┐
        │ Rollback / Failure  │
        │ Handling Defined    │
        └─────────────────────┘
```

---

# 37. Final Principle

> ### **Don't document what you know. Document what the next person needs to do.**

A good manual deployment procedure transfers **execution knowledge**, not just technical knowledge.

The goal is not to write the shortest instructions.

The goal is to make the deployment:

**Repeatable → Predictable → Verifiable → Auditable → Safe**

---

## Quick Reference

### DO

✅ Use exact component names

✅ Include API names

✅ Specify exact values

✅ Document prerequisites

✅ Define execution order

✅ Provide validation

✅ Define expected results

✅ Include failure handling

✅ Include rollback

✅ Capture evidence

✅ Identify ownership

✅ Use stable record identifiers

### DON'T

❌ Don't say "configure as needed"

❌ Don't rely on tribal knowledge

❌ Don't use screenshots as the only instruction

❌ Don't say "activate the latest version"

❌ Don't combine many actions into one step

❌ Don't hide dependencies

❌ Don't continue after critical failures

❌ Don't expose secrets

❌ Don't make unvalidated production data changes

❌ Don't assume the executor knows the intended outcome

---

### One-line rule for every Salesforce deployment engineer

> **If another engineer can execute your manual steps safely without calling you for clarification, you wrote good deployment instructions.**

