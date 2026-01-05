const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
    console.log("🚀 Startar analys av Svenska Spel (detaljerad)…");

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

    const matches = await page.evaluate(() => {
        const results = [];
        const keywords = /boost|förhöjt|special|kampanj/i;

        document.querySelectorAll("body *").forEach(el => {
            const text = el.innerText?.trim();
            if (text && keywords.test(text) && text.length < 300) {
                results.push({
                    text,
                    tag: el.tagName,
                    class: el.className,
                    snippet: el.outerHTML.slice(0, 500)
                });
            }
        });

        return results;
    });

    fs.writeFileSync(
        "svenskaspel_debug.json",
        JSON.stringify(matches, null, 2),
        "utf-8"
    );

    console.log(`💾 Hittade ${matches.length} relevanta element`);
    console.log("🎉 STEG 6 KLAR");

    await browser.close();
})();
