### Defer Sharing Calculation in Salesforce

**Defer Sharing Calculation** is a Salesforce feature used primarily when you are making **large changes to the data model or sharing configuration** and want to temporarily postpone expensive sharing recalculations.

In simple terms:

> **It lets you make a batch of changes first, and have Salesforce recalculate sharing later instead of recalculating after every individual change.**

This can be particularly useful in large Salesforce orgs where sharing calculations are expensive.

### Why is sharing calculation expensive?

Salesforce has to determine **who can access which records** based on things such as:

* Role hierarchy
* Sharing rules
* Account/Opportunity/Case sharing
* Territories
* Manual sharing
* Apex managed sharing
* Public groups
* Queues
* Object relationships

For example, suppose you change the role hierarchy:

```text
CEO
 ├── VP Sales
 │    ├── Sales Manager
 │    │    ├── Sales Rep A
 │    │    └── Sales Rep B
 │    └── Sales Manager 2
 └── VP Support
```

Salesforce may need to recalculate access to a very large number of records.

If you are making **many structural changes**, recalculating sharing after every change can cause significant processing overhead.

---

## What does "defer" actually do?

Conceptually:

```text
Normal
------

Change #1
   ↓
Sharing calculation
   ↓
Change #2
   ↓
Sharing calculation
   ↓
Change #3
   ↓
Sharing calculation
```

With deferred sharing calculation:

```text
Defer Sharing Calculation ON
--------------------------------

Change #1
   ↓
(no full sharing recalculation)

Change #2
   ↓
(no full sharing recalculation)

Change #3
   ↓
(no full sharing recalculation)

        ↓
   Recalculate
        ↓
Sharing model becomes consistent
```

The goal is to **batch the work**.

---

## Where is it useful?

A classic use case is a **large role hierarchy change**.

For example, imagine an org with:

* 10,000 users
* 50 million Accounts
* 100 million custom-object records
* complex sharing rules

Now suppose you need to restructure the role hierarchy.

Without deferring sharing calculations, Salesforce can spend considerable resources recalculating access as the hierarchy changes.

With deferred calculations, you can make the structural changes and then perform the sharing calculation after the changes are complete.

---

## Important distinction

**Defer Sharing Calculation does NOT mean sharing is disabled.**

It means Salesforce is allowed to **postpone certain sharing recalculation work**.

It is therefore important to understand the temporary state:

```text
Data
  +
Sharing configuration
  +
Role hierarchy
       │
       ▼
Sharing calculation
       │
       ▼
Record access
```

If the calculation is deferred, the **record-access results can temporarily lag behind the configuration**.

So this isn't something you normally enable casually in production.

---

## What happens after the changes?

You need to allow Salesforce to perform the appropriate sharing recalculation.

Think of it as:

```text
Modify sharing model
        ↓
Defer calculation
        ↓
Make all changes
        ↓
Recalculate sharing
        ↓
Validate record access
```

The final recalculation brings the **sharing tables/access model** into alignment with the new configuration.

---

## A good analogy

Think of it like a database index.

Suppose you are loading **10 million records**.

You wouldn't necessarily want to maintain/rebuild an expensive index after every small batch.

Instead:

```text
Load records
Load records
Load records
Load records
       ↓
Build/rebuild index
```

Deferred sharing calculation follows a similar principle:

```text
Make sharing-model changes
Make sharing-model changes
Make sharing-model changes
       ↓
Calculate sharing
```

---

## Why Salesforce provides this

The main reason is **performance and scalability**.

For small orgs:

> Sharing recalculation may be barely noticeable.

For large enterprise orgs:

> Sharing recalculation can become a major operation.

This is especially relevant for organizations with:

* Large data volumes
* Complex role hierarchies
* Many sharing rules
* Large public groups
* Enterprise Territory Management
* Complex object relationships
* Large numbers of users

---

## One important caveat

You should distinguish **configuration changes** from **normal record-level sharing operations**.

For example:

```text
Changing Role Hierarchy
Changing Sharing Rules
Changing Group Membership
Changing Territory structure
          ↓
Potentially expensive recalculation
```

versus:

```text
User manually shares Record X with User Y
```

These are different mechanisms.

Deferred sharing calculation is primarily about managing the expensive **sharing recalculation work associated with sharing-model changes**, rather than being a general-purpose switch for all sharing operations.

---

### In one sentence

> **Defer Sharing Calculation allows Salesforce administrators to postpone expensive sharing recalculations while making a set of sharing-model changes, then perform the calculation afterward as a batch.**

For a **large Salesforce org**, this can make a substantial difference during changes to the **role hierarchy, sharing rules, groups, and other parts of the sharing model**.

### How To
Absolutely. I would add this as an important **prerequisite/activation note**, because it corrects the impression that an Admin can simply enable the feature from Setup.

### Deferred Sharing Calculation — Activation Requirement

> **Deferred Sharing Calculation is not enabled by default.** It is a Salesforce feature that must be activated for the organization by **Salesforce Customer Support**.

To request activation, Salesforce requires the customer to provide:

1. **Target Org ID**
2. **Confirmation that the customer understands the impact of deferring calculations**

   * While group membership/sharing-rule calculation is paused, changes to group membership or sharing rules **will not take effect** until sharing calculations are resumed.
   * A **full recalculation of groups and sharing rules** will be required.
   * Depending on the size of the organization, the recalculation may take a considerable amount of time.
3. **Confirmation that the relevant Deferred Sharing Calculation Tips Sheet / best-practices information has been reviewed**
- [Understanding Defer Sharing Calculations](http://resources.docs.salesforce.com/228/18/en-us/sfdc/pdf/salesforce_defer_sharing_tipsheet.pdf)
4. **Business justification**

   * Reason for requesting activation
   * Detailed business reasons
   * Specific problems or issues the feature is expected to resolve

Salesforce documentation: [Deferred Sharing Calculation — Salesforce Help](https://help.salesforce.com/s/articleView?id=005036326&type=1)


```text
                 Salesforce Customer Support
                          │
                          ▼
             Activate Deferred Sharing
                          │
                          ▼
              Salesforce Admin
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
       Defer calculations       Make sharing-model
                                changes
             │                         │
             └────────────┬────────────┘
                          ▼
                Resume / Recalculate
                          │
                          ▼
             Full sharing calculation
                          │
                          ▼
                 Sharing becomes
                    up to date
```

**Key takeaway:** An Admin can **use/manage the feature after Salesforce has activated it for the org**, but **initial activation is not a normal Setup-menu switch and requires Salesforce Support involvement**.


