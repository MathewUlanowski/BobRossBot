const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env not found');
  process.exit(1);
}
const e = fs.readFileSync(envPath, 'utf8');
const discord = (e.match(/^DISCORD_TOKEN=(.*)$/m) || [])[1];
const openai = (e.match(/^OPENAI_API_KEY=(.*)$/m) || [])[1];
if (!discord || !openai) {
  console.error('DISCORD_TOKEN or OPENAI_API_KEY not found in .env');
  process.exit(1);
}
const yaml = `env:\n  DISCORD_TOKEN: "${discord.replace(/"/g, '\\"')}"\n  OPENAI_API_KEY: "${openai.replace(/"/g, '\\"')}"\n`;
fs.writeFileSync(path.join(process.cwd(), 'helm', 'temp.values.yaml'), yaml, 'utf8');
console.log('Wrote helm/temp.values.yaml');
console.log(yaml);
