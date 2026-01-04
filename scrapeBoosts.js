const puppeteer = require("puppeteer");

(async () => {
  try {
    console.log("Startar Puppeteer…");

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    console.log("Browser startad");

    const page = await browser.newPage();

    await page.goto("https://example.com", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    const title = await page.title();
    console.log("Sidtitel:", title);

    await browser.close();
    console.log("KLART – Puppeteer fungerar på Railway ✅");

    process.exit(0);
  } catch (err) {
    console.error("FEL:", err);
    process.exit(1);
  }
})();
