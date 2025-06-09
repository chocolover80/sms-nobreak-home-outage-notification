const nodeMailer = require("nodemailer");
const fs = require("fs/promises");
const { saveLogFileToJSON } = require("./logManagement");
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
async function sendEmail(html, data, upsIsUp) {
  const reportPrimaryColor = upsIsUp ? "#29ae51" : "#b92121";
  const reportSecondaryColor = upsIsUp ? "#44b566" : "#cd3737";
  const subjectFlag = upsIsUp
    ? process.env.GREEN_SUBJECT_OF_THE_EMAIL
    : process.env.RED_SUBJECT_OF_THE_EMAIL;
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
      subject: subjectFlag,
      html: html
        .replace("primaryColor", reportPrimaryColor)
        .replace("secondaryColor", reportSecondaryColor),
      attachments: [
        {
          filename: `log_${new Intl.DateTimeFormat("pt-BR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
            .format(new Date())
            .replaceAll(/[/:]/g, "-")
            .replace(", ", "_")}.json`,
          path: "./output/latestLog.json", // stream this file
        },
      ],
    },
    (error, info) => {
      if (error) {
        data.splice(data.indexOf("Notificação da última verificação"), 1);
        data.push({
          "Notificação da última verificação": `Não foi possível enviar o email. Verificar o problema: ${error}`,
        });
        saveLogFileToJSON("./output/latestLog.json", data);

        console.error("Error while dispatching the email: ", error);
      } else {
        console.log("Message sent: ", info.response);
      }
    }
  );
}
module.exports = {
  sendEmail,
  readHTMLFileAsync,
};
