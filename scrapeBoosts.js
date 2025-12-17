const fs = require("fs");
const ftp = require("basic-ftp");

async function uploadToFTP() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false
    });

    await client.uploadFrom("boosts.html", "/wp-content/uploads/oddsbot/boosts.html");
    console.log("boosts.html uppladdad!");
  } catch (err) {
    console.error("FTP-fel:", err);
  } finally {
    client.close();
  }
}

(async () => {
  const html = `
<div class="oddsboost-widget">
  <h2>⚡ Oddsboostar</h2>
  <p>Boten körs korrekt på Railway.</p>
  <p>${new Date().toLocaleString()}</p>
</div>
`;

  fs.writeFileSync("boosts.html", html, "utf-8");
  console.log("boosts.html skapad");

  await uploadToFTP();
})();
