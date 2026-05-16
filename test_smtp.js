const nodemailer = require('nodemailer');

// Load env manually
const fs = require('fs');
const env = {};
fs.readFileSync('.env', 'utf-8').split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});

async function test() {
  console.log('Testing SMTP with:');
  console.log('  host: smtp.gmail.com');
  console.log('  port: 587 (STARTTLS)');
  console.log('  user:', env.SMTP_USER);
  console.log('  family: IPv4 forced');

  const t = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    tls: { rejectUnauthorized: false },
  });

  try {
    await t.verify();
    console.log('\n✅ SMTP connection verified on port 587!');
  } catch (e) {
    console.error('\n❌ SMTP verify failed:', e.message);
    console.error('Code:', e.code);
  }
}

test();
