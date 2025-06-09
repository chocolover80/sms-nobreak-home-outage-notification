const fs = require("fs");

function saveLogFileToJSON(filePath, jsonData) {
  try {
    const jsonString = JSON.stringify(jsonData, null, 2); // Convert object to JSON string with indentation
    fs.writeFileSync(filePath, jsonString);
    console.log(`JSON data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving JSON data to ${filePath}:`, error);
  }
}

function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function readLogFile(filePath) {
  try {
    const data = await readFileAsync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error);
  }
}

module.exports = {
  saveLogFileToJSON,
  readLogFile,
};
