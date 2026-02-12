// This function takes a image URL and return a base64 string of the image.
async function imageToBase64(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

module.exports = imageToBase64;
