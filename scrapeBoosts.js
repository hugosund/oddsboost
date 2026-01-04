const puppeteer = require("puppeteer");

(async () => {
  console.log("Startar Puppeteer…");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

  console.log("Puppeteer fungerar ✅");

  await browser.close();
})();
