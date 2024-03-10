const nodemailer = require('nodemailer');
//to send email do the following steps
const sendEmail = async (options) => {
  //1) create a transporter USING NODE MAILTRAP TO FAKE THE PROCESS OF SENDING EMAIL
  const transporter = nodemailer.createTransport({
    //PASS THE OPTIONS AS IN MAILTRAP SERVICE
    host: process.env.EMAIL,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2)MAKE MAIL OPTIONS THAT DATA ABOUT THE SENT,RECIEVED,SUBJECT AND THE CONTENT
  const mailOptions = {
    from: 'Youssef <admin3@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //3)send the mail using the transporter created , that function return a promise
  //so await the result send the mail options to it
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
