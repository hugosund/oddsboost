const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
    console.log("🚀 Startar bookmaker-test…");

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
    await page.goto("https://www.bet365.com/#/HO/", {
        waitUntil: "networkidle2",
        timeout: 60000
    });

    console.log("🌐 Bet365 laddad");

    const textSample = await page.evaluate(() => {
        return document.body.innerText.slice(0, 1000);
    });

    fs.writeFileSync("bet365_test.txt", textSample, "utf-8");
    console.log("💾 bet365_test.txt skapad");

    await browser.close();
    console.log("🎉 STEG 3 KLAR");
})();
