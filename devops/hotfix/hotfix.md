# Salesforce Hotfix Sandbox  
*Quick setup & best practices*  

---  

## What is a Hotfix Sandbox?  
- **Purpose:** Deploy urgent fixes without affecting ongoing development.  
- **Characteristics:**  
  - Partial copy of production (metadata + selected data).  
  - Smaller size, faster refresh.  
  - Available for 30 days (auto‑expire).  

---  

## When to Use It  
- Critical bug affecting users.  
- Time‑sensitive security patch.  
- Need to test hotfix in an environment isolated from other changes.  

---  

## Prerequisites  

| Requirement | Details |
|-------------|---------|
| **License** | Salesforce org must have at least **Enterprise** edition. |
| **Permissions** | System Administrator or user with **Create and Manage Sandboxes** permission. |
| **Data Selection** | Identify objects/records needed for the fix (e.g., Account, Contact). |
| **Metadata Coverage** | Ensure the hotfix only involves metadata types supported by partial copy (Apex, Layouts, Profiles, etc.). |  

---  

## Step‑by‑Step Setup  

1. **Navigate to Sandboxes**  
   - Setup → **Environments** → **Sandboxes**.  

2. **Create a New Sandbox**  
   - Click **New Sandbox**.  
   - **Name:** `Hotfix_<Feature/Date>` (e.g., `Hotfix_2024_06_01`).  
   - **Type:** **Partial Copy**.  

3. **Configure Sandbox Settings**  
   - **Description:** Brief purpose (e.g., “Fix for Order‑Number duplication bug”).  
   - **Refresh Interval:** Default 30 days (cannot be changed).  

4. **Select Data Template** *(optional but recommended)*  
   - Choose an existing **Sandbox Template** or create a new one:  
     - Include only the objects required for verification.  
     - Keep the data set ≤ 10 GB for faster copy.  

5. **Start the Refresh**  
   - Click **Create**.  
   - Monitor progress in the **Sandbox Jobs** list.  
   - Typical duration: 30 – 90 minutes (depends on data volume).  

6. **Activate the Sandbox**  
   - Once status = **Completed**, click **Login**.  
   - Set a new password (first‑time login requires password reset).  

---  

## Initial Configuration  

| Action | Details |
|--------|---------|
| **Change Org Name** | Sandbox → Setup → **Company Settings** → **My Domain** → verify domain (e.g., `hotfix.myorg.my.salesforce.com`). |
| **Update Email Deliverability** | Setup → **Email** → **Deliverability** → set to **System‑Only** (prevent accidental email sends). |
| **Disable Integrations** | Turn off external callouts or change endpoint URLs to test endpoints. |
| **Refresh Test Data** | Use **Data Loader** or **Workbench** to insert any test records not covered by the template. |

---  

## Deploying the Hotfix  

1. **Create a Dedicated Branch** (Git or other VCS)  
   - `hotfix/<issue‑id>` (e.g., `hotfix/ORD-1234`).  

2. **Develop Fix in Sandbox**  
   - Modify Apex, Validation Rules, Flow, etc.  
   - Run **All Tests** locally (`sfdx force:apex:test:run`).  

3. **Validate Deployment**  
   - **Setup → Deployment Status** → **Validate** (choose **Run Specified Tests**).  

4. **Create Change Set** (or use SFDX)  
   - **Outbound Change Set** → add components → **Upload** to production.  

5. **Deploy to Production**  
   - In Production, go to **Inbound Change Sets** → **Deploy**.  
   - Run **All Local Tests** (mandatory for production).  

6. **Post‑Deployment Checks**  
   - Verify the issue is resolved.  
   - Confirm no regression by running a smoke test suite.  

---  

## Best Practices  

- **Minimal Scope:** Only the components needed for the fix.  
- **Short‑Lived Sandbox:** Delete after verification to keep org tidy.  
- **Automated Tests:** Maintain ≥ 75 % code coverage; aim for 95 % for hotfixes.  
- **Change Documentation:** Log the hotfix in a tracking system (Jira, Asana) with sandbox name, start/end dates, and deployed components.  
- **Backup Production Data** (if applicable) before deploying.  

---  

## Cleaning Up  

- **Delete Sandbox**  
  - Setup → **Sandboxes** → select the hotfix sandbox → **Delete**.  

- **Remove Temporary Data**  
  - Purge any test records created solely for the hotfix.  

- **Close Branch**  
  - Merge hotfix branch into `main/master` and tag the release.  

---  

## Quick Reference Checklist  

- [ ] Sandbox created (Partial Copy)  
- [ ] Data template selected  
- [ ] Org name, email deliverability, integrations adjusted  
- [ ] Hotfix developed & unit tested  
- [ ] Validation deployment passed  
- [ ] Change set created & uploaded  
- [ ] Production deployment executed with all tests  
- [ ] Issue verified & regression checked  
- [ ] Sandbox deleted & branch merged  
