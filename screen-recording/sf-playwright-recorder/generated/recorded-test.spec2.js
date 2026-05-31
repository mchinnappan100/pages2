const { test, expect } = require('@playwright/test');

test('Recorded SF flow', async ({ page }) => {
  await page.goto("https://login.salesforce.com/");
  await page.getByRole("textbox", { name: "username", exact: true }).click();
  await page.getByRole("textbox", { name: "username", exact: true }).fill("mchinnappan@salesforce.com.af300");
  await page.getByRole("textbox", { name: "pw", exact: true }).click();
  await page.getByRole("textbox", { name: "pw", exact: true }).fill("NewGreen1962");
  await page.getByRole("textbox", { name: "Login", exact: true }).click();
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce.com/secur/frontdoor.jsp?sid=00Daj00000tLpCj%21AQEAQEMimAHaoJ2jcMyVuy84ZAynaj5igheFWJR9_FfbNaX7DN2AEmkoih1o_6PvAA5xltYTdhzD023sTVch_XFy76u4EHa0&apv=1&allp=1&cshc=j00000Wjeenj00000tLpCj&display=page");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.file.force.com/secur/contentDoor?startURL=https%3A%2F%2Fdaj00000tlpcjeak-dev-ed.develop.my.salesforce.com%2Floginflow%2FloginFlow.apexp%3FretURL%3D%252Flightning%252Fsetup%252FSetupOneHome%252Fhome%26sparkID%3DRun_Update_Dates_for_Trick_or_Trailhead&sid=00Daj00000tLpCj%21AQEAQKXCinuy7w3XoWuUwx354obOxT5dsTPg.g8NpMT.77KNWSK9U3GBZasqJ60AuZb2lWAOWL0PcL0lESkxRn8tgzS2TsEP&skipRedirect=1&lm=eyJlbmMiOiJBMjU2R0NNIiwiYXVkIjoiMDBEYWowMDAwMHRMcENqIiwia2lkIjoie1widFwiOlwiMDBEYWowMDAwMHRMcENqXCIsXCJ2XCI6XCIwMkdhajAwMDAwNm8zWDdcIixcImFcIjpcImNvbnRlbnRkb29ydXNlcnRyYW5zaWVudGtleWVuY3J5cHRcIixcInVcIjpcIjAwNWFqMDAwMDBXamVlblwifSIsImNyaXQiOlsiaWF0Il0sImlhdCI6MTc4MDE4MTI0NjY5NSwiZXhwIjowfQ%3D%3D..EQKeWFNC8W2G2lPR.XINhFbYIJ9_mKk5xppjnAA%3D%3D.C8xlslAzan1D6cOIMk-YWg%3D%3D");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.lightning.force.com/lightning/setup/SetupOneHome/home");
  await page.goto("https://daj00000tlpcjeak-dev-ed.develop.my.salesforce-setup.com/lightning/setup/SetupOneHome/home?SetupDomainProbePassed=true&SetupDomainReload=1");
});