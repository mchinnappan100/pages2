# SF Playwright Recorder

Record Salesforce browser interactions and generate ready-to-run Playwright test scripts.
Supports parameterization, data-driven runs (JSON/CSV), org profiles, saved auth, and a Monaco code editor.

## Quick start

```bash
npm install
npx playwright install chromium   # first time only
npm start                         # opens http://localhost:3777
```

CLI options:

```bash
node server.js -p 4000      # use port 4000 (auto-increments if busy)
node server.js --no-open    # skip auto-opening the browser
node server.js --help       # show all options
```

---

## Workflow

### 1 — First-time Salesforce login (save auth)

1. Add an **Org Profile** (sidebar ➜ Org Profiles ➜ **＋**) with your username, password, and org type.
2. Click **⚡ Quick Login & Record** — the browser opens, logs in automatically, and starts recording.
   _Or_: enter your login URL manually and click **▶ Start Recording**, then log in yourself.
3. Back in the control panel click **Save Auth State**.
4. Click **■ Stop Recording**.

Auth is stored in `generated/sf-auth.json`. Tick **Use saved auth** on future recordings to skip the login page entirely.

### 2 — Record a flow

1. Select a profile (or enter a URL), optionally tick **Use saved auth**, click **▶ Start Recording**.
2. Perform the steps you want to automate in the recorder browser window.
3. Watch generated code appear live in the **Code** tab (Monaco editor).
4. Click **■ Stop Recording**.
5. Give the test a filename and click **💾 Save**.

### 3 — Edit the generated code (Monaco editor)

The **Code** tab is a full Monaco editor (same engine as VS Code):

- Syntax highlighting, bracket matching, find/replace (`Cmd+F`), multi-cursor
- **💾 Save** — write edits back to disk
- **💾 ▶ Save & Run** — save then immediately run
- Selecting a file in the **▶ Run** dropdown automatically loads it into the editor

### 4 — Parameterize a recording

Convert hardcoded values into named parameters so the same test can run against different objects, records, or orgs.

1. In the **Code** tab, select a string value (e.g. `Account`).
2. Click the **⚙ Params** tab ➜ **＋ Add Param from selection**.
3. Edit the token name (e.g. `objectName`) and default value in the table.
4. Click **▶ Apply & update code** — the editor rewrites:
   ```js
   // Before
   await page.getByRole('link', { name: 'Account', exact: true }).click();

   // After
   const PARAMS = {
     objectName: "Account",
   };
   await page.getByRole('link', { name: PARAMS.objectName, exact: true }).click();
   ```
5. Edit `PARAMS.objectName` in the code to run against any object, or use the **⊞ Data** tab to run against many at once.

### 5 — Data-driven runs (JSON / CSV)

Run the same test flow against multiple rows of data in one command.

1. Apply params first so the code contains `{{TOKEN}}` placeholders (step 4 above).
2. Click the **⊞ Data** tab.
3. Paste a JSON array or CSV — or click **Load sample** (auto-detects token names):

```json
[
  { "objectName": "Account",  "filterName": "AllAccounts"  },
  { "objectName": "Contact",  "filterName": "AllContacts"  },
  { "objectName": "Lead",     "filterName": "AllOpenLeads" }
]
```

Or as CSV:

```csv
objectName,filterName
Account,AllAccounts
Contact,AllContacts
Lead,AllOpenLeads
```

4. Click **👁 Preview rows** to verify the parsed data.
5. Click **▶ Run data-driven** — the server generates a `test.each`-style spec and runs it immediately, streaming output to the **▶ Run** tab.

### 6 — Run a saved test

**From the UI:**
- Select a file in the **▶ Run** tab dropdown ➜ click **▶ Run**
- Or click the **▶** button next to any file in the sidebar

**From the terminal:**
```bash
npx playwright test generated/recorded-test.spec.js
```

---

## Generated test anatomy

```js
const { test, expect } = require('@playwright/test');

test('Recorded SF flow', async ({ page }) => {
  await page.goto('https://yourorg.lightning.force.com/...');
  await page.getByLabel('Search...').fill('Account name');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  // …
});
```

### Parameterized variant

```js
const PARAMS = {
  objectName: "Account",
  filterName: "AllAccounts",
};

test('Recorded SF flow', async ({ page }) => {
  await page.getByRole('link', { name: PARAMS.objectName, exact: true }).click();
  await page.goto(`…/list?filterName=${PARAMS.filterName}`);
});
```

### Data-driven variant (generated automatically)

```js
const { test } = require('@playwright/test');

const DATA = [
  { objectName: 'Account', filterName: 'AllAccounts' },
  { objectName: 'Contact', filterName: 'AllContacts' },
];

for (const row of DATA) {
  test(`Recorded SF flow — ${JSON.stringify(row)}`, async ({ page }) => {
    await page.getByRole('link', { name: row.objectName, exact: true }).click();
  });
}
```

---

## Selector strategy (Salesforce-aware)

All `getByRole` calls use `exact: true` to prevent substring matches
(e.g. `"Account"` must not match `"Account Brand"`).

| Priority | Selector type | When used |
|---|---|---|
| 1 | `getByLabel()` | Associated `<label>` text or `aria-labelledby` |
| 2 | `getByPlaceholder()` | Input placeholder text |
| 3 | `getByRole(…, { exact: true })` | ARIA role + accessible name |
| 4 | `getByTestId()` | `data-testid` / `data-id` attributes |
| 5 | `getByText()` | Button / link visible text |
| 6 | Shadow-DOM path | Salesforce LWC / Aura components |
| 7 | CSS selector | Last resort |

---

## Org Profiles (`~/.sfplaywright-recorder`)

Profiles are stored in a plain YAML file in your home directory. Edit by hand or use the UI.

```yaml
profiles:
  - name: my-dev-org
    login-url: https://login.salesforce.com
    username:  me@example.com.dev
    password:  Secret1
    org-type:  developer   # sandbox | production | scratch | developer

  - name: my-sandbox
    login-url: https://test.salesforce.com
    username:  me@example.com.sb1
    password:  SandboxPass1
    org-type:  sandbox
```

**Keep this file private — treat it like `.env`** (add to `.gitignore`).

---

## Timeouts

Configured in `playwright.config.js`:

| Timeout | Value | Purpose |
|---|---|---|
| `timeout` | 120 s | Maximum duration of the whole test |
| `actionTimeout` | 15 s | Each `click()` / `fill()` / `select()` |
| `navigationTimeout` | 30 s | Each `page.goto()` |
| Watchdog | 150 s | Server-side hard kill for hung processes |

---

## File locations

| Path | Contents |
|---|---|
| `generated/*.js` | Saved test files |
| `generated/sf-auth.json` | Saved Salesforce session (cookies + localStorage) |
| `~/.sfplaywright-recorder` | Org profiles (username, password, login URL) |
| `playwright.config.js` | Playwright configuration |
