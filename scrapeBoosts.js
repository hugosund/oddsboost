const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
    console.log("🚀 Startar test av Puppeteer…");

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ]
    });

    console.log("✅ Browser startad");

    const page = await browser.newPage();

    console.log("🌐 Besöker Svenska Spel…");
    await page.goto("https://www.svenskaspel.se/sport", {
        waitUntil: "domcontentloaded",
        timeout: 60000
    });

    const title = await page.title();
    console.log("📄 Sidtitel:", title);

    const html = `
        <h1>Puppeteer test OK</h1>
        <p>Sidtitel: ${title}</p>
        <p>Datum: ${new Date().toISOString()}</p>
    `;

    fs.writeFileSync("test.html", html, "utf8");
    console.log("💾 test.html skapad");

    await browser.close();
    console.log("🛑 Browser stängd");
    console.log("🎉 TEST KLAR – ALLT FUNKAR");
})();
