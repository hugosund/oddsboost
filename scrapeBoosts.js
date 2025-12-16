const fs = require('fs');
const puppeteer = require('puppeteer'); // OBS: puppeteer, inte puppeteer-core
const ftp = require('basic-ftp');

const bookmakers = [
    { name: "Bet365", url: "https://www.bet365.com/#/HO/" },
    { name: "BetMGM", url: "https://www.betmgm.se/sport#featured" }
    // Lägg till fler licensierade svenska spelbolag här
];

// Hämtar oddsboostar för en bookmaker
async function fetchBoosts(bookmaker, page) {
    try {
        await page.goto(bookmaker.url, { waitUntil: 'networkidle2', timeout: 60000 });
        const boosts = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('body *'));
            return elements
                .filter(el => /boost|förhöjt odds|enhanced/i.test(el.innerText))
                .map(el => el.innerText.trim())
                .filter(Boolean);
        });
        return { bookmaker: bookmaker.name, boosts };
    } catch (err) {
        console.error(`Fel vid hämtning av ${bookmaker.name}:`, err);
        return { bookmaker: bookmaker.name, boosts: [] };
    }
}

// Ladda upp filen till WordPress via FTP
async function uploadToFTP() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        await client.uploadFrom("boosts.html", "/wp-content/uploads/oddsbot/boosts.html");
        console.log("boosts.html uppladdad till WordPress!");
    } catch(err) {
        console.error("FTP-fel:", err);
    } finally {
        client.close();
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--single-process"
        ]
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    const results = [];
    for (const bookmaker of bookmakers) {
        console.log(`Hämtar oddsboostar från ${bookmaker.name}...`);
        const data = await fetchBoosts(bookmaker, page);
        results.push(data);
    }

    await browser.close();

    // Bygg HTML-widget
    let html = `<div class="oddsboost-widget"><h2>⚡ Oddsboostar</h2>`;
    for (const result of results) {
        if (result.boosts.length > 0) {
            html += `<h3>${result.bookmaker}</h3><ul>`;
            result.boosts.forEach(boost => html += `<li>${boost}</li>`);
            html += `</ul>`;
        }
    }
    html += `</div>`;

    // Skriv till fil
    fs.writeFileSync('boosts.html', html, 'utf-8');
    console.log('boosts.html skapad/uppdaterad!');

    // Ladda upp till WordPress
    await uploadToFTP();
})();
