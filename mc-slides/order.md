## The **dependency order** is the golden rule of data migration. Think of it like building a house: you can’t hang a door before you’ve built the frame.

In database terms, this is all about **Foreign Keys**. A child record requires the ID of its parent to establish a relationship. If the parent doesn't exist yet, there is no ID to reference, and the "insert" will fail.

---

## 🏗️ The Hierarchy Logic

When loading data, you must follow the direction of the **Lookup** or **Master-Detail** relationship.

1.  **Level 1 (Independent):** Objects that don't "belong" to anything else (e.g., Users).
2.  **Level 2 (Dependent):** Objects that require a Level 1 record (e.g., Accounts).
3.  **Level 3 (Grandchild):** Objects that require a Level 2 record (e.g., Opportunities or Contacts).



---

## 📝 Concrete Examples

### Example 1: Standard Sales Cloud
If you are moving a legacy CRM into Salesforce, you cannot load everything at once. You must follow this sequence:

| Step | Object | Why? |
| :--- | :--- | :--- |
| **1** | **User** | Records need an "Owner." You can't assign an Account to a person who isn't in the system yet. |
| **2** | **Account** | Accounts are the "sun" of the Salesforce solar system. Most things revolve around them. |
| **3** | **Contact** | A Contact usually needs an `AccountId` to be associated with a company. |
| **4** | **Opportunity** | An Opportunity requires both an `AccountId` and often a `PricebookId`. |

### Example 2: The "Broken Link" Error
Imagine you try to load a **Task** (Child) before its **Lead** (Parent):
* **The CSV:** You have a column for `WhoId` (The Lead's ID).
* **The Result:** Salesforce looks for that ID, can't find it because the Lead hasn't been created yet, and throws a `Required fields are missing` or `Invalid Cross Reference Id` error.

---

## 🛠️ Pro-Tip: The "External ID" Shortcut
If you want to bypass the strict "Parents first" headache, you can use **External IDs**. 

By marking a unique field on the Parent (like `Legacy_System_ID__c`) as an External ID, you can load Child records and tell Salesforce: *"Don't look for your internal SFDC ID; look for this specific ID from our old system."* This allows for more flexible loading via the **Upsert** operation.

> **Note:** Even with External IDs, the Parent record must still exist in the database for the relationship to link successfully during the import process.

How large is the data set you're planning to move—are we talking hundreds of records or millions?
