const { getInformation } = require("./wraps/upsStatusManagement");
require("dotenv").config();
async function init() {
  getInformation(process.env.NOBREAK_ENDPOINT);
}
init();
