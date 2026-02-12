import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import generateLastStarSvg from "../../helpers/generateLastStarSvg";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import { assertGitHubUsername, parseBoundedInt } from "../../helpers/validators";

import type { GitHubStarredRepo } from "../../types/github";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isGitHubStarredRepo(value: unknown): value is GitHubStarredRepo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<GitHubStarredRepo>;
  return (
    typeof candidate.full_name === "string" &&
    typeof candidate.html_url === "string" &&
    typeof candidate.stargazers_count === "number" &&
    Number.isFinite(candidate.stargazers_count) &&
    typeof candidate.updated_at === "string" &&
    (candidate.language === undefined || typeof candidate.language === "string")
  );
}

export default async function lastStarsUser(req: Request, res: Response): Promise<void> {
  const { user } = getContext(req);

  assertGitHubUsername(user);

  const count = parseBoundedInt(queryString(req.query.count), "count", { min: 1, max: 30, defaultValue: 6 });
  const padding = parseBoundedInt(queryString(req.query.padding), "padding", { min: 0, max: 80, defaultValue: 15 });
  const perRow = parseBoundedInt(queryString(req.query.perRow), "perRow", { min: 1, max: 10, defaultValue: 2 });

  const response = await fetchGitHubJson<unknown>(`/users/${user}/starred?sort=created&per_page=${count}`);

  if (!Array.isArray(response) || !response.every(isGitHubStarredRepo)) {
    throw createHttpError(502, "GitHub returned invalid starred repository payload");
  }

  res.contentType("image/svg+xml").send(generateLastStarSvg(response, padding, perRow));
}
