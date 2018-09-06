const path = require('path');
const nodemailer = require('nodemailer');
const { EmailTemplate } = require('email-templates');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: '*******************',
    pass: '*******************',
  },
});

const Email = {
  sendAlert(msg, ping) {
      const templateDir = path.join('global/templates', 'emails', 'welcome-email');
      const welcomeEmail = new EmailTemplate(templateDir);
      welcomeEmail.render({
        message: msg,
        ping: ping
      }, (err, result) => {
        transporter.sendMail({
          from: '**************',
          to: '*****************',
          subject: 'Service Status',
          html: result.html
        }, (error, info) => {
          if (error) {
            console.log('error occured while sending mail');
          } else {
            console.log('mail sent successfully using');
          }
        });
      });
}

};
module.exports = Email;
