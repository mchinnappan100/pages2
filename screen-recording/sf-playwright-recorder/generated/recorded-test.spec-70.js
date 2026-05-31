const { test, expect } = require('@playwright/test');

test('Recorded SF flow', async ({ page }) => {
  await page.goto("https://login.salesforce.com/");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.file.force.com/secur/contentDoor?startURL=https%3A%2F%2Fdaj00000tlpcjeak-dev-ed.develop.my.salesforce.com%2Floginflow%2FloginFlow.apexp%3FretURL%3D%252Flightning%252Fsetup%252FSetupOneHome%252Fhome%26sparkID%3DRun_Update_Dates_for_Trick_or_Trailhead&sid=00Daj00000tLpCj%21AQEAQJzPV0rCuG2byzMFFautVhF3aQrDd8_sKbib7YJLc2fq84STsFh_PO7tRmIf33Q.8p_mFvj2S4SRpTIF8ND8.5WM7hIW&skipRedirect=1&lm=eyJlbmMiOiJBMjU2R0NNIiwiYXVkIjoiMDBEYWowMDAwMHRMcENqIiwia2lkIjoie1widFwiOlwiMDBEYWowMDAwMHRMcENqXCIsXCJ2XCI6XCIwMkdhajAwMDAwNm8zWDdcIixcImFcIjpcImNvbnRlbnRkb29ydXNlcnRyYW5zaWVudGtleWVuY3J5cHRcIixcInVcIjpcIjAwNWFqMDAwMDBXamVlblwifSIsImNyaXQiOlsiaWF0Il0sImlhdCI6MTc4MDIzNTU3MzQ5MiwiZXhwIjowfQ%3D%3D..PJrd9TthdARrpOlA.t1Dsms9xrcJMUmS4DpJODw%3D%3D.LJmFlHG4q6JUSqWNOE0l7A%3D%3D");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home?SetupDomainProbePassed=true");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home");
  await page.getByRole("tab", { name: "Object Manager", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/home");
  await page.locator("div#setupComponent > div:nth-child(2) > div > div:nth-child(2) > div > table:nth-child(1) > tbody:nth-child(3) > tr:nth-child(1) > th:nth-child(1)").click();
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/Details/view");
  await page.getByRole("tab", { name: "Fields & Relationships", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/FieldsAndRelationships/view");
  await page.locator("div#setupComponent > div > div > div > section:nth-child(2) > div > div:nth-child(2) > div > div > table:nth-child(1) > tbody:nth-child(3) > tr:nth-child(1) > td:nth-child(1) > a > span").click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/FieldsAndRelationships/Name/view");
  await page.keyboard.press("Alt+Tab");
});