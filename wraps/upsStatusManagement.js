const puppeteer = require("puppeteer");
const { sendEmail, readHTMLFileAsync } = require("./emailManagement");
const { saveLogFileToJSON, readLogFile } = require("./logManagement");
let UPS_IS_UP = true;

async function thereIsNoDiffOnUPSStatus(oldData, currentData) {
  if (oldData && currentData) {
    const oldValues = oldData
      .filter((item) => item.name)
      .map((item) => `${item.name} - ${item.description}`);
    const currentValues = currentData
      .filter((item) => item.name)
      .map((item) => `${item.name} - ${item.description}`);
    oldValues.sort();
    currentValues.sort();
    return JSON.stringify(oldValues) === JSON.stringify(currentValues);
  } else {
    return false;
  }
}

function checkPowerOutage(jsonData) {
  let formattedMessage = "";
  const networkFlag = jsonData.filter((item) => item.name === "Rede")[0];

  const batteryFlag = jsonData.filter((item) => item.name === "Bateria")[0];
  const lowBatteryFlag = jsonData.filter(
    (item) => item.name === "Bateria Baixa"
  )[0];
  const testFlag = jsonData.filter((item) => item.name === "Teste")[0];
  const beepFlag = jsonData.filter((item) => item.name === "Beep")[0];
  formattedMessage +=
    networkFlag.status === "NOK" && batteryFlag.status === "OK"
      ? "O nobreak está consumindo a bateria. A rede elétrica está fora."
      : "";
  formattedMessage +=
    lowBatteryFlag.status === "OK"
      ? "<br><br>O nobreak está com a bateria baixa. Considere programar desligamento. Em caso de estar em teste, verificar no sistema."
      : "";
  formattedMessage +=
    testFlag.status === "OK"
      ? "<br><br>O Nobreak está em modo teste. Ao finalizar o teste, se houver rede elétrica, voltará a funcionar por ela."
      : "";
  formattedMessage +=
    networkFlag.status === "NOK" && beepFlag.status === "OK"
      ? "<br><br>O alarme sonoro está ligado, considere mutá-lo caso esteja incomodando."
      : "";
  return formattedMessage;
}

async function getFormattedLogTimestamp(jsonData) {
  const currentDate = new Date();
  const day =
    currentDate.getDate() > 9
      ? "" + currentDate.getDate()
      : "0" + currentDate.getDate();
  const month =
    currentDate.getMonth() + 1 > 9
      ? "" + (currentDate.getMonth() + 1)
      : "0" + (currentDate.getMonth() + 1);
  const hours =
    currentDate.getHours() > 9
      ? "" + currentDate.getHours()
      : "0" + currentDate.getHours();
  const minutes =
    currentDate.getMinutes() > 9
      ? "" + currentDate.getMinutes()
      : "0" + currentDate.getMinutes();
  const seconds =
    currentDate.getSeconds() > 9
      ? "" + currentDate.getSeconds()
      : "0" + currentDate.getSeconds();
  const formattedDate = `${day}/${month}/${currentDate.getFullYear()}, às ${hours}:${minutes}:${seconds}.${currentDate.getMilliseconds()}.`;
  jsonData.push({ "Última verificação em": formattedDate });
}

async function getInformation(url) {
  const html = await readHTMLFileAsync("./resources/emailTemplate.html");
  const itemRow = await readHTMLFileAsync("./resources/itemRow.html");
  let latestLogJSON = [];
  let itemsCheckedOnTheTable = ""; //this will display all items checked on a table on the email sent
  let browser;
  let itemsToCheck = [];
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // page.setDefaultNavigationTimeout(2 * 60 * 1000);
    page.setDefaultTimeout(2 * 60 * 1000); //setting default page timeout to 2 minutes
    await page.goto(url, { waitUntil: "domcontentloaded" });
    //here, where waiting for the colors of the status' to be loaded
    await page.waitForFunction(() => {
      const infsLoaded = Array.from(document.querySelectorAll(".infs"));
      const items = [...infsLoaded[0].children, ...infsLoaded[1].children];
      itemsToCheck = items.filter((item) => {
        const itemStyle = item?.getAttribute("style");
        if (itemStyle && `${itemStyle}`.includes("color")) {
          return item;
        }
      });

      if (itemsToCheck && itemsToCheck.length > 0) {
        return itemsToCheck.length;
      }
    });
    const data = await page.evaluate(() => {
      return itemsToCheck.map((item) => {
        const dotColor = item.getAttribute("style");

        const stData = dotColor.includes("color: rgb(0, 153, 0)")
          ? { status: "OK", description: "Ligado com a cor verde." }
          : dotColor.includes("color: rgb(221, 221, 221)")
          ? { status: "NOK", description: "Desligado com a cor neutra." }
          : null;
        return {
          name: item.nextSibling.textContent
            .substring(1)
            .replaceAll(/[\n\t]/g, ""),
          status: stData.status,
          description: stData.description,
        };
      });
    });
    data.forEach((item) => {
      const itemDotColor =
        item.status === "OK" ? "rgb(0, 153, 0)" : "rgb(221, 221, 221)";
      itemsCheckedOnTheTable += itemRow
        .replace("{itemName}", item.name)
        .replace(
          "{itemStatus}",
          `<span style="color: ${itemDotColor} ;font-size: 16px;">• </span>${item.status}`
        )
        .replace("{itemDescription}", item.description);
    });
    // console.log("Status obtidos: ", JSON.stringify(data));
    await getFormattedLogTimestamp(data);
    let emailMsg = checkPowerOutage(data);
    latestLogJSON = await readLogFile("./output/latestLog.json");
    if (emailMsg !== "") {
      UPS_IS_UP = false;
      data.push({
        "Resultado da última verificação":
          "O nobreak apresentou oscilação na rede.",
      });
      data.push({
        "Mensagem completa do estado do Nobreak": emailMsg.replace(
          "<br><br>",
          " | "
        ),
      });
      emailMsg +=
        "<br><br>Recomendo sempre acessar o sistema pelo remote desktop para monitorar o estado atual.";
      const logCheckInstructions =
        "Você pode acessar o log completo da última verificação pelo servidor, dentro da aplicação 'sms-nobreak-home-outage-notification', na pasta 'output/latestLog.json', e então compará-lo com o log anexo no corpo deste email, para assim ver o que mudou e tomar as devidas providências caso necessário.";

      const timestampOfTheMsg = `Data de verificação das informações: ${
        data.filter((item) => item && item["Última verificação em"])[0][
          "Última verificação em"
        ]
      }`;
      /* verifying whether there was any changes on the errors, so it decides to report
      via email or not */
      let emailMustBeSent = true;
      /* this clause will check, in case the status is the same, if it's been 30
      minutes since the last email dispatch, that way, it won't flood unnecessary
      emails, since the status didn't change at all, except for the check date */
      const noDiffFiles = await thereIsNoDiffOnUPSStatus(latestLogJSON, data);
      if (noDiffFiles) {
        emailMustBeSent = false;
        try {
          let ltsEmail;
          ltsEmail = await readLogFile("./output/emailHistoryLog.json");
          if (!ltsEmail) {
            emailMustBeSent = true;
            emailMsg +=
              "<br><br><i>** <b>OBS:</b> A automação não pôde encontrar o histórico do último email, portanto este foi enviado. Caso já esteja ciente dos status, desconsiderar.</i>";
          }
          const previousDate =
            ltsEmail && ltsEmail["lastDispatchedTimestamp"]
              ? new Date(ltsEmail["lastDispatchedTimestamp"])
              : null;
          const currentDate = new Date();
          const diffInMilliseconds =
            previousDate && currentDate
              ? Math.abs(currentDate - previousDate)
              : NaN;
          const diffInMinutes = diffInMilliseconds
            ? Math.floor(diffInMilliseconds / (1000 * 60))
            : 999;
          if (diffInMinutes > 29) {
            emailMustBeSent = true;
            if (ltsEmail)
              emailMsg +=
                "<br><br>Não houve mudança no status desde a última verificação. Porém, passaram-se 30 minutos desde o último email, então estamos te lembrando.";
          }
        } catch (error) {
          console.error(error);
        }
      }
      const htmlMSG = html
        .replace("{statusTitle}", "Seu Nobreak SMS apresentou uma oscilação!")
        .replace("{itemRows}", itemsCheckedOnTheTable)
        .replace("{aditionalInfo}", emailMsg)
        .replace("{logCheckInstructions}", logCheckInstructions)
        .replace("{lastCheckTimestamp}", timestampOfTheMsg);
      if (emailMustBeSent) {
        data.push({
          "Notificação da última verificação": `Um email com o status foi enviado para: <${process.env.SMTP_AUTH_USER}>`,
        });
        saveLogFileToJSON("./output/latestLog.json", data);
        sendEmail(htmlMSG, data, UPS_IS_UP);
        saveLogFileToJSON("./output/emailHistoryLog.json", {
          lastDispatchedTimestamp: new Date().toISOString(),
          lastDispatchedStatus: UPS_IS_UP ? "UPS is up." : "UPS is down.",
        });
      } else {
        data.push({
          "Notificação da última verificação": `Os status se mantiveram, ainda não se passaram 30 minutos, então não foi enviado email para: <${process.env.SMTP_AUTH_USER}>`,
        });
        console.log(
          "Email with same reports already sent. Waiting for 30 minutes to pass! (anti-flood)"
        );
        saveLogFileToJSON("./output/latestLog.json", data);
      }
    } else {
      UPS_IS_UP = true;
      const lastResult = latestLogJSON?.filter(
        (item) =>
          item &&
          item["Resultado da última verificação"] &&
          item["Resultado da última verificação"] ===
            "O nobreak apresentou oscilação na rede."
      )[0];
      if (lastResult) {
        const logCheckInstructions =
          "Você pode acessar o log completo da última verificação pelo servidor, dentro da aplicação 'sms-nobreak-home-outage-notification', na pasta 'output/latestLog.json', e então compará-lo com o log anexo no corpo deste email, para assim ver o que mudou e tomar as devidas providências caso necessário.";

        const timestampOfTheMsg = `Data de verificação das informações: ${
          data.filter((item) => item && item["Última verificação em"])[0][
            "Última verificação em"
          ]
        }`;
        const htmlMSG = html
          .replace("{statusTitle}", "Seu Nobreak SMS retomou da oscilação!")
          .replace("{itemRows}", itemsCheckedOnTheTable)
          .replace(
            "{aditionalInfo}",
            "O nobreak está funcionando normalmente, após oscilação anterior."
          )
          .replace("{logCheckInstructions}", logCheckInstructions)
          .replace("{lastCheckTimestamp}", timestampOfTheMsg);

        data.push({
          "Resultado da última verificação":
            "O nobreak retomou pleno funcionamento após uma oscilação anterior.",
        });
        data.push({
          "Notificação da última verificação": `Um email com o status foi enviado para: <${process.env.SMTP_AUTH_USER}>`,
        });
        saveLogFileToJSON("./output/latestLog.json", data);
        sendEmail(htmlMSG, data, UPS_IS_UP);
        saveLogFileToJSON("./output/emailHistoryLog.json", {
          lastDispatchedTimestamp: new Date().toISOString(),
          lastDispatchedStatus: UPS_IS_UP ? "UPS is up." : "UPS is down.",
        });
      } else {
        data.push({
          "Resultado da última verificação":
            "O nobreak estava em pleno funcionamento.",
        });
        saveLogFileToJSON("./output/latestLog.json", data);
        console.log("No e-mail to send. The UPS is up!");
      }
    }
    await browser.close();
  } catch (error) {
    console.error(error);
    await browser.close();
  }
}
module.exports = {
  getInformation,
};
