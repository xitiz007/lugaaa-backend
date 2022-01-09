const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const options = {
  auth: {
    api_key: process.env.SENDGRID,
  },
};

const mailer = nodemailer.createTransport(sgTransport(options));

const sendMail = (to, subject, html) => {
    const email = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject,
      html
    };

    mailer.sendMail(email, function(err, res) {
        if(err)
        {
            console.log(err);
        }
    })
}

module.exports = sendMail;