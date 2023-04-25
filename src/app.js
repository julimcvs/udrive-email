const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser")
const ENVIRONMENT = require('./environments/environment')
const http = require('http');

const app = express();
app.use(bodyParser.json());

const port = 3000
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

async function getTemplate(mailContent) {
    return new Promise((resolve, reject) => {
        let template;
        const data = JSON.stringify({
            name: mailContent.name,
            tokenUrl: mailContent.tokenUrl
        });
        const options = {
            hostname: ENVIRONMENT.templateServiceHost,
            port: ENVIRONMENT.templateServicePort,
            path: '/mail-validation',
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        };
        const req = http.request(options, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                template = chunk;
            });
            res.on('end', () => {
                resolve(template);
            });
        })
        req.on('error', (e) => {
            console.error(`Error sending email: ${e.message}`);
            reject(template);
        });
        req.write(data);
        req.end();
    });
}

async function sendMail(req) {
    return new Promise((resolve, reject) => {
        getTemplate(req.body.mailContent).then((template) => {
            resolve(sendMailValidation(req.body.email, template));
        }).catch((error) => reject(error));
    })
}

async function sendMailValidation(email, template) {
    return await transporter.sendMail({
        subject: 'Validação de Email',
        to: [email],
        html: template,
    })
}

app.post('/mail-validation', async function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    sendMail(req).then((sent) => {
        res.write(JSON.stringify(sent));
        res.end()
    }).catch((error) => {
        return `Error trying to send email: ${error}`
    });
})

app.listen(port, () => console.log(`Running on port ${port}`))