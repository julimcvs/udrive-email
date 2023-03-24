const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
const bodyParser = require("body-parser")

const app = express();
app.use(bodyParser.json());

const port = 3001
const SMTP_CONFIG = require('./config/smtp')

const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: false,
    auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass
    },
    tls: {
        rejectUnauthorized: false
    }
})

async function run(req) {
    const html = fs.readFileSync('/home/julio/uDrive/udrive-email/src/mail/mail-validation.html')
        .toString()
        .replace('${GREETING}', req.body.name)
        .replace('${TOKEN}', req.body.tokenUrl);
    const mailSent = await transporter.sendMail({
        subject: "uDrive - Validação de email",
        to: [req.body.email],
        html: html,
    })
    return mailSent;
}

app.post('/mail-validation', async function (req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const mailSent = await run(req);
    res.write(JSON.stringify(mailSent));
    res.end();
})

app.listen(port, () => console.log(`Running on port ${port}`))