import imageToBase64 from "./imageToBase64";

import type { GitHubContributor } from "../types/github";

type ContributorWithAvatar = GitHubContributor & { avatar: string };

export default async function generateContributorSvg(contributors: GitHubContributor[], size: number, padding: number, perRow: number): Promise<string> {
  const contributorsWithAvatars: ContributorWithAvatar[] = await Promise.all(
    contributors.map(async (contributor) => ({
      ...contributor,
      avatar: await imageToBase64(contributor.avatar_url),
    }))
  );

  const clipPaths = contributorsWithAvatars
    .map(
      (_, i) =>
        `<clipPath id="c-${i}"><circle cx="${(i % perRow) * (size + padding) + size / 2}" cy="${
          Math.floor(i / perRow) * (size + padding) + size / 2
        }" r="${size / 2}" fill="#000" /></clipPath>`
    )
    .join("");

  const avatars = contributorsWithAvatars
    .map(
      (contributor, i) =>
        `<a xlink:href="${contributor.html_url}"><image clip-path="url(#c-${i})" width="${size}" height="${size}" x="${
          (i % perRow) * (size + padding)
        }" y="${Math.floor(i / perRow) * (size + padding)}" xlink:href="data:image/png;base64,${contributor.avatar}" /></a>`
    )
    .join(" ");

  return `
  	<svg width="${((contributorsWithAvatars.length - 1) % perRow) * (size + padding) + size}" height="${
    Math.floor((contributorsWithAvatars.length - 1) / perRow) * (size + padding) + size
  }" role="img"
  		xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  		<defs>
  			${clipPaths}
  		</defs>
  		${avatars}
  	</svg>`;
}
