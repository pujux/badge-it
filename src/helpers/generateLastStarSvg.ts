import type { GitHubStarredRepo } from "../types/github";
import { escapeXml, sanitizeGitHubUrl } from "./sanitizeSvg";

export default function generateLastStarSvg(response: GitHubStarredRepo[], padding: number, perRow: number): string {
  if (response.length === 0) {
    return `<svg width="1" height="1" role="img" xmlns="http://www.w3.org/2000/svg"></svg>`;
  }

  const width = 300;
  const height = 85;
  const cornerRadius = 6;
  const wrapperPadding = 15;

  const repos = response
    .map((repo, i) => {
      const x = (i % perRow) * (width + padding) + wrapperPadding;
      const y = Math.floor(i / perRow) * (height + padding) + wrapperPadding;
      const repoUrl = escapeXml(sanitizeGitHubUrl(repo.html_url));
      const repoName = repo.full_name.length >= 30 ? `${repo.full_name.substring(0, 27)}...` : repo.full_name;
      const safeRepoName = escapeXml(repoName);
      const safeUpdatedDate = escapeXml(new Date(repo.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      const safeLanguage = repo.language ? escapeXml(repo.language) : "";

      return `<a xlink:href="${repoUrl}">
        <rect width="${width}" height="${height}" style="filter: url(#shadow)" x="${x}" y="${y}" stroke-width="1.5" fill="rgb(255,255,255)" stroke="rgb(208,215,222)" rx="${cornerRadius}"></rect>
        <text class="bold-text" x="${x + wrapperPadding}" y="${y + wrapperPadding + 16}">${safeRepoName}</text>

        <svg x="${x + wrapperPadding}" y="${
          y + height - wrapperPadding - 12
        }" aria-label="stars" role="img" width="14" height="14" viewBox="0 0 16 16" version="1.1" data-view-component="true" class="octicon octicon-star">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
        </svg>
        <text class="text" x="${x + wrapperPadding + 20}" y="${y + height - wrapperPadding}">${
          repo.stargazers_count > 999 ? `${(repo.stargazers_count / 1e3).toFixed(1)}k` : repo.stargazers_count
        }</text>

        <text class="text" text-anchor="middle" x="${x + width / 2 - 15}" y="${y + height - wrapperPadding}">Updated ${safeUpdatedDate}</text>

        ${
          repo.language
            ? `<text class="text" text-anchor="end" x="${x + width - wrapperPadding}" y="${y + height - wrapperPadding}">${safeLanguage}</text>`
            : ""
        }
      </a>`;
    })
    .join("");

  return `
  	<svg width="${((response.length - 1) % perRow) * (width + padding) + width + wrapperPadding * 2}" height="${
      Math.floor((response.length - 1) / perRow) * (height + padding) + height + wrapperPadding * 2
    }" role="img"
  		xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <style>
        .text, .bold-text {
          font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";
          font-size: 14px;
          font-weight: 400;
        }

        .text, .octicon {
          fill: rgb(101, 109, 118);
        }

        .bold-text {
          font-size: 16px;
          font-weight: 600;
          fill: rgb(31, 35, 40);
        }
      </style>
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#8C959F" flood-opacity="0.15" />
        </filter>
      </defs>
  		${repos}
  	</svg>`;
}
