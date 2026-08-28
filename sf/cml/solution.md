# Resolution Document: Context Definition Deployment Error — `SalesTransactionContextExt`

## 1. Overview

This document provides the resolution steps for a Salesforce CML deployment failure involving the **Context Definition** `SalesTransactionContextExt`.

The deployment may fail with one or both of the following errors:

1. A **Context Attribute deletion** error involving `FOLI_is_supplemental_Order__c`.
2. A **mappedContextDefinition** change error involving the Salesforce ID `11Oau000000PW6LEAW`.

This document captures the resolution steps performed and provides a repeatable procedure for future deployments.

---

# 2. Issue 1 — Context Attribute Being Deleted

## Error Message

```text
Context Attribute is being deleted:
FOLI_is_supplemental_Order__c
from node FulfillmentTransactionItem
```

## Root Cause

The Context Definition being deployed contains a difference between the source/promotion branch and the target org.

Salesforce detects that the following Context Attribute is being removed from the `FulfillmentTransactionItem` node:

```text
FOLI_is_supplemental_Order__c
```

This can happen when:

* The attribute exists in the target org but is not present in the metadata being deployed.
* The attribute was unintentionally removed from the source Context Definition.
* The attribute is no longer required and should be removed from the target org.

## Resolution

### Step 1 — Check the deployment XML

Verify that the following Context Attribute is present in the XML being deployed:

```text
FOLI_is_supplemental_Order__c
```

The attribute should exist under the appropriate:

```text
FulfillmentTransactionItem
```

node.

### Step 2 — If the attribute is required

If `FOLI_is_supplemental_Order__c` is still required:

* Add/restore the attribute in the Context Definition XML.
* Ensure the XML represents the expected Context Definition configuration.
* Commit the change to the promotion branch.
* Re-run the deployment.

### Step 3 — If the attribute is no longer required

If `FOLI_is_supplemental_Order__c` is intentionally being removed:

* Confirm that the attribute is no longer required by downstream functionality.
* Remove `FOLI_is_supplemental_Order__c` from the target org.
* Re-run the deployment.

> **Important:** Do not remove the target attribute simply to make the deployment pass unless the business and technical owners have confirmed that the attribute is no longer required.

---

# 3. Issue 2 — `mappedContextDefinition` Changed

## Error Message

```text
SalesTransactionContextExt
Context Definition
0
0
mappedContextDefinition changed for 11Oau000000PW6LEAW
new value: SalesTransactionContextExt
```

## Root Cause

This issue is related to the `mappedContextDefinition` value in the Context Definition metadata.

The Salesforce Context Definition contains a mapping to another Context Definition using a Salesforce ID.

In Production, the mapping is represented by the Salesforce ID:

```text
11Oau000000PW6LEAW
```

However, the version being promoted contains:

```xml
<mappedContextDefinition>SalesTransactionContextExt</mappedContextDefinition>
```

Salesforce therefore detects the mapping as a change:

```text
11Oau000000PW6LEAW
        ↓
SalesTransactionContextExt
```

This is a known Salesforce issue/bug, and a Salesforce Support Case has been opened for this behavior.

---

# 4. Resolution for Issue 2

The workaround is to align the promotion branch with the mapping currently present in Production.

## Step 1 — Retrieve the Latest Context Definition from Production

Get the latest version of the relevant Context Definition from Production.

Identify:

```text
SalesTransactionContextExt
```

and inspect the XML for the node containing the `mappedContextDefinition`.

---

## Step 2 — Identify the Production Salesforce ID

In the Production version, identify the node where the Salesforce ID is used.

The expected Production mapping is:

```text
11Oau000000PW6LEAW
```

---

## Step 3 — Update the Promotion Branch

In the promotion branch, locate:

```xml
<mappedContextDefinition>SalesTransactionContextExt</mappedContextDefinition>
```

Change it to:

```xml
<mappedContextDefinition>11Oau000000PW6LEAW</mappedContextDefinition>
```

### Before

```xml
<mappedContextDefinition>SalesTransactionContextExt</mappedContextDefinition>
```

### After

```xml
<mappedContextDefinition>11Oau000000PW6LEAW</mappedContextDefinition>
```

---

## Step 4 — Commit the Change

Commit the updated Context Definition XML to the promotion branch.

Example:

```text
Fix mappedContextDefinition for SalesTransactionContextExt
```

---

## Step 5 — Re-run the Deployment

After the change has been committed:

1. Re-run the CML deployment.
2. Verify that the `mappedContextDefinition` error is no longer reported.
3. Verify that there are no additional Context Attribute deletion errors.
4. Validate the deployed Context Definition in the target org.

---

# 5. Complete Resolution Procedure

When the deployment fails with these errors, use the following sequence.

```text
                    CML Deployment
                          |
                          v
              Context Definition Error
                          |
             +------------+------------+
             |                         |
             v                         v
       Issue 1                     Issue 2
 Context Attribute              mappedContextDefinition
      deletion                       changed
             |                         |
             v                         v
 Check deployment XML        Get latest Prod definition
             |                         |
             v                         v
 Is attribute present?      Identify Prod Salesforce ID
       /        \                    |
     Yes         No                  v
      |           |          Update promotion branch
      |           |                  |
      |           +--> If required  v
      |                restore      Commit change
      |                              |
      |           If not required    v
      |           remove from       Redeploy
      |           target org
      |
      v
   Redeploy
```

---

# 6. Validation Checklist

Before re-running the deployment, verify the following:

### Context Attribute

* [ ] `FOLI_is_supplemental_Order__c` exists in the deployment XML if it is required.
* [ ] The attribute is under the correct `FulfillmentTransactionItem` node.
* [ ] If the attribute is no longer required, it has been intentionally removed from the target org.
* [ ] No dependent configuration still references the attribute.

### Context Definition Mapping

* [ ] Latest Context Definition has been retrieved from Production.
* [ ] Production `mappedContextDefinition` value has been identified.
* [ ] Promotion branch has been updated to use the Production Salesforce ID.
* [ ] The following value is used where applicable:

```xml
<mappedContextDefinition>11Oau000000PW6LEAW</mappedContextDefinition>
```

* [ ] Changes have been committed.
* [ ] CML deployment has been re-run.
* [ ] Deployment completes successfully.

---

# 7. Important Considerations

### Do not blindly replace Context Definition names with IDs

The Salesforce ID should be obtained from the **latest Production Context Definition**. Do not assume or manually construct the ID.

### Validate the Production version first

Production should be treated as the source of truth for the `mappedContextDefinition` value when applying this workaround.

### Salesforce Known Issue / Support Case

The `mappedContextDefinition` behavior is associated with a Salesforce bug. A Salesforce Support Case has been opened to track the issue.

The workaround documented here should therefore be considered a deployment workaround until Salesforce provides a permanent fix.

---

# 8. Summary

The CML deployment issue can be resolved by addressing the two errors independently:

| Issue       | Error                                                               | Resolution                                                                                                           |
| ----------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Issue 1** | `Context Attribute is being deleted: FOLI_is_supplemental_Order__c` | Ensure the attribute exists in the deployment XML if required; otherwise intentionally remove it from the target org |
| **Issue 2** | `mappedContextDefinition changed for 11Oau000000PW6LEAW`            | Obtain the latest Production Context Definition and update the promotion branch to use the Production Salesforce ID  |

### Final Workaround

Change:

```xml
<mappedContextDefinition>SalesTransactionContextExt</mappedContextDefinition>
```

to:

```xml
<mappedContextDefinition>11Oau000000PW6LEAW</mappedContextDefinition>
```

Commit the change and re-run the CML deployment.

I can also turn this into a **formal Salesforce deployment SOP/KB format** with sections for *Symptoms, Root Cause, Resolution, Prevention, and Troubleshooting* if you want to publish it internally.
