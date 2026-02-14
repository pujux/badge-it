import imageToBase64 from "./imageToBase64";
import { escapeXml, sanitizeGitHubUrl } from "./sanitizeSvg";

import type { GitHubContributor } from "../types/github";

type ContributorWithAvatar = GitHubContributor & { avatar: string };

const DEFAULT_AVATAR_FETCH_CONCURRENCY = 8;
const MAX_AVATAR_FETCH_CONCURRENCY = 32;

function resolveAvatarFetchConcurrency(): number {
  const rawValue = process.env.CONTRIBUTOR_AVATAR_FETCH_CONCURRENCY;

  if (!rawValue) {
    return DEFAULT_AVATAR_FETCH_CONCURRENCY;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_AVATAR_FETCH_CONCURRENCY;
  }

  return Math.min(parsed, MAX_AVATAR_FETCH_CONCURRENCY);
}

async function mapConcurrently<T, U>(values: T[], concurrency: number, mapper: (value: T, index: number) => Promise<U>): Promise<U[]> {
  if (values.length === 0) {
    return [];
  }

  const results = new Array<U>(values.length);
  let index = 0;
  const workerCount = Math.min(concurrency, values.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (index < values.length) {
        const currentIndex = index;
        index += 1;
        results[currentIndex] = await mapper(values[currentIndex], currentIndex);
      }
    }),
  );

  return results;
}

export default async function generateContributorSvg(
  contributors: GitHubContributor[],
  size: number,
  padding: number,
  perRow: number,
): Promise<string> {
  if (contributors.length === 0) {
    return `<svg width="1" height="1" role="img" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const contributorsWithAvatars: ContributorWithAvatar[] = await mapConcurrently(
    contributors,
    resolveAvatarFetchConcurrency(),
    async (contributor) => ({
      ...contributor,
      avatar: await imageToBase64(contributor.avatar_url),
    }),
  );

  const clipPaths = contributorsWithAvatars
    .map(
      (_, i) =>
        `<clipPath id="c-${i}"><circle cx="${(i % perRow) * (size + padding) + size / 2}" cy="${
          Math.floor(i / perRow) * (size + padding) + size / 2
        }" r="${size / 2}" fill="#000" /></clipPath>`,
    )
    .join("");

  const avatars = contributorsWithAvatars
    .map(
      (contributor, i) => {
        const contributorUrl = escapeXml(sanitizeGitHubUrl(contributor.html_url));

        return `<a xlink:href="${contributorUrl}"><image clip-path="url(#c-${i})" width="${size}" height="${size}" x="${
          (i % perRow) * (size + padding)
        }" y="${Math.floor(i / perRow) * (size + padding)}" xlink:href="data:image/png;base64,${contributor.avatar}" /></a>`;
      },
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
