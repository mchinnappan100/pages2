const { test, expect } = require('@playwright/test');

test('Recorded SF flow', async ({ page }) => {
  await page.goto("https://login.salesforce.com/");
  await page.getByRole("textbox", { name: "username", exact: true }).click();
  await page.getByRole("textbox", { name: "username", exact: true }).fill("mchinnappan@salesforce.com.af300");
  await page.getByRole("textbox", { name: "pw", exact: true }).click();
  await page.getByRole("textbox", { name: "pw", exact: true }).fill("NewGreen1962");
  await page.getByRole("textbox", { name: "Login", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce.com/secur/frontdoor.jsp?sid=00Daj00000tLpCj%21AQEAQFa6gKfBymPMdVWPMDpUTsjt0pc6KEqHDR55kSesAq1XX979Xpf7gJOhwG1re55iwirqCgcWjyiHKmWvbBau5wrV.l14&apv=1&allp=1&cshc=j00000Wjeenj00000tLpCj&display=page");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.file.force.com/secur/contentDoor?startURL=https%3A%2F%2Fdaj00000tlpcjeak-dev-ed.develop.my.salesforce.com%2Floginflow%2FloginFlow.apexp%3FretURL%3D%252Flightning%252Fsetup%252FSetupOneHome%252Fhome%26sparkID%3DRun_Update_Dates_for_Trick_or_Trailhead&sid=00Daj00000tLpCj%21AQEAQGTBk6P94rbHBJydenTHNNif3WCGZMIV.sQZsSdpL.t.x1gxrtCavNmEBHop4hXf4iQ4NOPBnfeBe5Cn668IGFQc8_HK&skipRedirect=1&lm=eyJlbmMiOiJBMjU2R0NNIiwiYXVkIjoiMDBEYWowMDAwMHRMcENqIiwia2lkIjoie1widFwiOlwiMDBEYWowMDAwMHRMcENqXCIsXCJ2XCI6XCIwMkdhajAwMDAwNm8zWDdcIixcImFcIjpcImNvbnRlbnRkb29ydXNlcnRyYW5zaWVudGtleWVuY3J5cHRcIixcInVcIjpcIjAwNWFqMDAwMDBXamVlblwifSIsImNyaXQiOlsiaWF0Il0sImlhdCI6MTc4MDE4MjA2NzQ2NiwiZXhwIjowfQ%3D%3D..YnXPBwDC9e3aRorn.XODxt_uPDNaaDl0QotZXjg%3D%3D.IClJnRvsCs6CUACK0Yw_lw%3D%3D");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.lightning.force.com/lightning/setup/SetupOneHome/home");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home?SetupDomainProbePassed=true&SetupDomainReload=1");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home");
  await page.locator("body:nth-child(2) > div:nth-child(26) > div:nth-child(1) > section > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div > div > ul:nth-child(3) > li:nth-child(3) > a:nth-child(1) > span").click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/ObjectManager/home");
});