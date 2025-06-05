const nodeMailer = require("nodemailer");
const fs = require("fs/promises");
require("dotenv").config();

async function readHTMLFileAsync(path) {
  try {
    const data = await fs.readFile(path, {
      encoding: "utf8",
    });
    return data; // The HTML content as a string
  } catch (err) {
    console.error("Error reading file:", err);
    return;
  }
}
async function sendEmail(html, data) {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASS,
    },
  });
  await transporter.sendMail(
    {
      from: process.env.SENDER_NAME_AND_EMAIL,
      to: process.env.RECIPIENT_EMAIL,
      subject: process.env.SUBJECT_OF_THE_EMAIL,
      html: html,
    },
    (error, info) => {
      if (error) {
        console.error("Error: ", error);
      } else {
        console.log("Message sent: ", info.response);
      }
    }
  );
  data.push({
    "Notificação da última verificação": `Um email com o status foi enviado para: <${process.env.SMTP_AUTH_USER}`,
  });
}
module.exports = {
  sendEmail,
  readHTMLFileAsync,
};
