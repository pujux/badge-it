const fetch = require("node-fetch");

async function imageToBase64(url) {
  return await fetch(url).then(async (res) => (await res.buffer()).toString("base64"));
}

module.exports = imageToBase64;
