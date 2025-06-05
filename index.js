const { getInformation } = require("./checkStatus");
require("dotenv").config();
async function init() {
  getInformation(process.env.NOBREAK_ENDPOINT);
}
init();
