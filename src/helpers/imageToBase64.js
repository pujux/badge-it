const fetch = require("node-fetch");

// This function takes a image URL and return a base64 string of the image.
async function imageToBase64(url) {
  return await fetch(url).then(async (res) => (await res.buffer()).toString("base64"));
}

module.exports = imageToBase64;
