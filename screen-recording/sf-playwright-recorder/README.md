# SF Playwright Recorder

Record browser interactions against Salesforce (or any site) and generate
ready-to-run Playwright test scripts.

## Quick start

```bash
npm install
npx playwright install chromium   # first time only
npm start                         # opens http://localhost:3777
```

## Workflow

### 1 — First-time Salesforce login (save auth)
1. Open http://localhost:3777
2. Enter your SF org URL and click **▶ Start Recording**
3. Log into Salesforce in the recorder window
4. Back in the control panel click **Save Auth State**
5. Click **■ Stop Recording** (or close the browser)

Auth is stored in `generated/sf-auth.json` — future recordings will skip login.

### 2 — Record a flow
1. Tick **Use saved auth**, enter your org URL, click **▶ Start Recording**
2. Perform the steps you want to automate in the recorder window
3. Watch generated code appear live on the right
4. Click **■ Stop Recording**
5. Give the test a filename and click **Save**

### 3 — Run the generated test
```bash
npx playwright test generated/recorded-test.spec.js
```

## Generated test anatomy

```js
import { test, expect } from '@playwright/test';

test.use({ storageState: 'generated/sf-auth.json' });

test('Recorded SF flow', async ({ page }) => {
  await page.goto('https://yourorg.lightning.force.com/...');
  await page.getByLabel('Search...').fill('Account name');
  await page.getByRole('button', { name: 'Search' }).click();
  // …
});
```

## Selector strategy (Salesforce-aware)

| Priority | Selector type | Example |
|----------|--------------|---------|
| 1 | `getByLabel`      | lightning-input label text |
| 2 | `getByPlaceholder`| input placeholder |
| 3 | `getByRole`       | button / link names |
| 4 | `getByTestId`     | `data-testid` attributes |
| 5 | `getByText`       | button / link visible text |
| 6 | Shadow-DOM path   | LWC component chain |
| 7 | CSS selector      | fallback |

## Tips

- **Assertions**: after recording, add `expect` lines manually or use the
  `/api/assert` endpoint to inject them.
- **Screenshots**: click **Add Screenshot Step** (or POST `/api/screenshot-step`)
  to capture the screen at that point.
- **Multiple orgs**: clear auth, log into the other org, save auth again.
