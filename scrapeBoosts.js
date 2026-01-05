const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
    console.log("🚀 Startar oddsboost-sökning (Svenska Spel)…");

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
        waitUntil: "networkidle2",
        timeout: 60000
    });

    console.log("🌐 Svenska Spel laddad");

    const boosts = await page.evaluate(() => {
        const keywords = /boost|förhöjt|special|kampanj/i;
        return Array.from(document.querySelectorAll("body *"))
            .map(el => el.innerText?.trim())
            .filter(text => text && keywords.test(text))
            .slice(0, 50);
    });

    fs.writeFileSync(
        "svenskaspel_boosts.json",
        JSON.stringify(boosts, null, 2),
        "utf-8"
    );

    console.log(`💾 Hittade ${boosts.length} träffar`);
    console.log("🎉 STEG 5 KLAR");

    await browser.close();
})();
