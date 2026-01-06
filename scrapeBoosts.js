const fs = require("fs");
const puppeteer = require("puppeteer");

// Enkel sleep-funktion (ersätter page.waitForTimeout)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    console.log("🚀 Startar djupanalys av Svenska Spel…");

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    const page = await browser.newPage();

    await page.goto("https://www.svenskaspel.se/sport", {
        waitUntil: "domcontentloaded",
        timeout: 60000
    });

    console.log("🌐 Sida laddad – väntar på frontend…");

    // Vänta extra tid (React / SPA)
    await sleep(10000);

    // Scrolla sidan för att trigga lazy loading
    console.log("📜 Scrollar sidan…");
    await page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
            window.scrollBy(0, window.innerHeight);
            await new Promise(r => setTimeout(r, 2000));
        }
    });

    console.log("🔍 Extraherar all synlig text…");

    const fullText = await page.evaluate(() => document.body.innerText);

    fs.writeFileSync("svenskaspel_fulltext.txt", fullText, "utf-8");

    console.log("💾 svenskaspel_fulltext.txt skapad");
    console.log("🎉 STEG 7 KLAR");

    await browser.close();
})();
