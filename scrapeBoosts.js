const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
    console.log("🚀 Startar oddsboost-sökning (Bet365)…");

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

    const boosts = await page.evaluate(() => {
        const keywords = /boost|enhanced|förhöjt|oddsboost/i;
        return Array.from(document.querySelectorAll("body *"))
            .map(el => el.innerText?.trim())
            .filter(text => text && keywords.test(text))
            .slice(0, 50);
    });

    fs.writeFileSync(
        "bet365_boosts.json",
        JSON.stringify(boosts, null, 2),
        "utf-8"
    );

    console.log(`💾 Hittade ${boosts.length} potentiella träffar`);
    console.log("🎉 STEG 4 KLAR");

    await browser.close();
})();
