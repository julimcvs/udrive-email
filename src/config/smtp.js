const ENVIRONMENT = require('../environments/environment')

module.exports = {
    host: "smtp.gmail.com",
    port: 587,
    user: "udrive.contact@gmail.com",
    pass: ENVIRONMENT.password
}