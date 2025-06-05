const puppeteer = require("puppeteer");
const { sendEmail, readHTMLFileAsync } = require("./emailSender");
const fs = require("fs");

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

function saveLogFileToJSON(filePath, jsonData) {
  try {
    const jsonString = JSON.stringify(jsonData, null, 2); // Convert object to JSON string with indentation
    fs.writeFileSync(filePath, jsonString);
    console.log(`JSON data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON data to ${filePath}:`, error);
  }
}

async function getInformation(url) {
  const html = await readHTMLFileAsync("./resources/emailTemplate.html");
  const itemRow = await readHTMLFileAsync("./resources/itemRow.html");
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
    //console.log("Status obtidos: ", JSON.stringify(data));
    await getFormattedLogTimestamp(data);
    let emailMsg = checkPowerOutage(data);
    if (emailMsg !== "") {
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
        "Você pode acessar o log completo da última verificação pelo servidor, dentro da aplicação 'sms-nobreak-home-outage-notification', na pasta 'output/latestLog.json'.";

      const timestampOfTheMsg = `Data de verificação das informações: ${
        data.filter((item) => item && item[["Última verificação em"]])[0][
          "Última verificação em"
        ]
      }.`;
      const htmlMSG = html
        .replace("{itemRows}", itemsCheckedOnTheTable)
        .replace("{aditionalInfo}", emailMsg)
        .replace("{logCheckInstructions}", logCheckInstructions)
        .replace("{lastCheckTimestamp}", timestampOfTheMsg);
      sendEmail(htmlMSG, data);
    } else {
      data.push({
        "Resultado da última verificação":
          "O nobreak estava em pleno funcionamento.",
      });
      console.log("No e-mail to send. The UPS is up!");
    }
    saveLogFileToJSON("./output/latestLog.json", data);
    await browser.close();
  } catch (error) {
    console.error(error);
    await browser.close();
  }
}
module.exports = {
  getInformation,
};
