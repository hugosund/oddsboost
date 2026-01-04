const fs = require("fs");
const puppeteer = require("puppeteer-core");
const ftp = require("basic-ftp");

const CHROME_PATH =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  "/usr/bin/google-chrome-stable" ||
  "/usr/bin/chromium";

(async () => {
  console.log("Startar Puppeteer…");

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();
  await page.goto("https://example.com", { timeout: 60000 });
  console.log("Chromium fungerar");

  await browser.close();

  fs.writeFileSync("boosts.html", "<h1>OK</h1>");
})();
