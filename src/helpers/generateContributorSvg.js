const imageToBase64 = require("../helpers/imageToBase64");

async function generateContributorSvg(response, size, padding, perRow) {
  // getting avatars from response and converting them to base64
  const contributors = await Promise.all(
    response.map(async (contributor) => ({ ...contributor, avatar: await imageToBase64(contributor.avatar_url) }))
  );

  // creating clipPaths for avatars
  const clipPaths = contributors
    .map(
      (_, i) =>
        `<clipPath id="c-${i}"><circle cx="${(i % perRow) * (size + padding) + size / 2}" cy="${
          Math.floor(i / perRow) * (size + padding) + size / 2
        }" r="${size / 2}" fill="#000" /></clipPath>`
    )
    .join("");

  const avatars = contributors
    .map(
      (contributor, i) =>
        `<a xlink:href="${contributor.html_url}"><image clip-path="url(#c-${i})" width="${size}" height="${size}" x="${
          (i % perRow) * (size + padding)
        }" y="${Math.floor(i / perRow) * (size + padding)}" xlink:href="data:image/png;base64,${contributor.avatar}" /></a>`
    )
    .join(" ");

  return `
  	<svg width="${((response.length - 1) % perRow) * (size + padding) + size}" height="${
    Math.floor((response.length - 1) / perRow) * (size + padding) + size
  }" role="img"
  		xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  		<defs>
  			${clipPaths}
  		</defs>
  		${avatars}
  	</svg>`;
}

module.exports = generateContributorSvg;
