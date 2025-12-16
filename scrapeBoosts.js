const fs = require('fs');
const puppeteer = require('puppeteer-core');
const ftp = require('basic-ftp');

const bookmakers = [
    { name: "Bet365", url: "https://www.bet365.com/#/HO/" },
    { name: "BetMGM", url: "https://www.betmgm.se/sport#featured" }
    // Lägg till fler licensierade svenska spelbolag här
];

async function fetchBoosts(bookmaker, page) {
    try {
        await page.goto(bookmaker.url, { waitUntil: 'networkidle2', timeout: 60000 });
        const boosts = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('[class*="boost"], [class*="enhanced"]'));
            return elements.map(el => el.innerText.trim()).filter(Boolean);
        });
        return { bookmaker: bookmaker.name, boosts };
    } catch (err) {
        console.error(`Fel vid hämtning av ${bookmaker.name}:`, err);
        return { bookmaker: bookmaker.name, boosts: [] };
    }
}

async function uploadToFTP() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASS,
            secure: false
        });
        await client.uploadFrom("boosts.html", "/wp-content/uploads/oddsbot/boosts.html");
        console.log("boosts.html uppladdad till WordPress!");
    } catch(err) {
        console.error(err);
    }
    client.close();
}

(async () => {
    const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
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

    let html = `<div class="oddsboost-widget"><h2>⚡ Oddsboostar</h2>`;
    for (const result of results) {
        if (result.boosts.length > 0) {
            html += `<h3>${result.bookmaker}</h3><ul>`;
            result.boosts.forEach(boost => html += `<li>${boost}</li>`);
            html += `</ul>`;
        }
    }
    html += `</div>`;

    fs.writeFileSync('boosts.html', html, 'utf-8');
    console.log('boosts.html skapad/uppdaterad!');

    await uploadToFTP();
})();
