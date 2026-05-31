const { test, expect } = require('@playwright/test');

test('Recorded SF flow', async ({ page }) => {
  await page.goto("https://login.salesforce.com/");
  await page.getByLabel("Username").click();
  await page.getByLabel("Username").fill("mchinnappan@salesforce.com.af300");
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill("NewGreen1962");
  await page.locator("input#Login").click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce.com/secur/frontdoor.jsp?sid=00Daj00000tLpCj%21AQEAQD3YDAh4Bdua1dh3ljQmurqiFH6tUkLLXouXavF_dod7q1POxIsPGXX9D7yn0TkmbWZdc_32FgBIoypGAcnM5eINfn5m&apv=1&allp=1&cshc=j00000Wjeenj00000tLpCj&display=page");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.file.force.com/secur/contentDoor?startURL=https%3A%2F%2Fdaj00000tlpcjeak-dev-ed.develop.my.salesforce.com%2Floginflow%2FloginFlow.apexp%3FretURL%3D%252Flightning%252Fsetup%252FSetupOneHome%252Fhome%26sparkID%3DRun_Update_Dates_for_Trick_or_Trailhead&sid=00Daj00000tLpCj%21AQEAQOvhaBIEEeOpSuhihyI4D_etP7v6vwiiq3ovIj8XF406o7FEsmvNY32txlyVp8RTcxSVL9hk7OIzMZl1AJUX3w7ac9s_&skipRedirect=1&lm=eyJlbmMiOiJBMjU2R0NNIiwiYXVkIjoiMDBEYWowMDAwMHRMcENqIiwia2lkIjoie1widFwiOlwiMDBEYWowMDAwMHRMcENqXCIsXCJ2XCI6XCIwMkdhajAwMDAwNm8zWDdcIixcImFcIjpcImNvbnRlbnRkb29ydXNlcnRyYW5zaWVudGtleWVuY3J5cHRcIixcInVcIjpcIjAwNWFqMDAwMDBXamVlblwifSIsImNyaXQiOlsiaWF0Il0sImlhdCI6MTc4MDE4NDY2NDI1MSwiZXhwIjowfQ%3D%3D..OiyDSutRxqQlsZNh.QyZQhjPJhKd0j0JbyXnF-w%3D%3D.krfkj4n94DQwQoug5v3NWw%3D%3D");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.lightning.force.com/lightning/setup/SetupOneHome/home");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home?SetupDomainProbePassed=true&SetupDomainReload=1");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home");
  await page.locator("body:nth-child(2) > div:nth-child(26) > div:nth-child(1) > section > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > div > ul:nth-child(3) > li:nth-child(3) > a:nth-child(1) > span").click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/home");
  await page.locator("div#setupComponent > div:nth-child(2) > div > div:nth-child(2) > div > table:nth-child(1) > tbody:nth-child(3) > tr:nth-child(1) > th:nth-child(1)").click();
  await page.getByRole("link", { name: "Account", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/Details/view");
  await page.getByRole("tab", { name: "Fields & Relationships", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/Account/FieldsAndRelationships/view");
});