import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import generateLastStarSvg from "../../helpers/generateLastStarSvg";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import { assertGitHubIdentifier, parseBoundedInt } from "../../helpers/validators";

import type { GitHubStarredRepo } from "../../types/github";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function lastStarsUser(req: Request, res: Response): Promise<void> {
  const { user } = getContext(req);

  assertGitHubIdentifier(user, "user");

  const count = parseBoundedInt(queryString(req.query.count), "count", { min: 1, max: 30, defaultValue: 6 });
  const gap = parseBoundedInt(queryString(req.query.gap), "gap", { min: 0, max: 80, defaultValue: 15 });
  const perRow = parseBoundedInt(queryString(req.query.perRow), "perRow", { min: 1, max: 10, defaultValue: 2 });

  const response = await fetchGitHubJson<unknown>(`/users/${user}/starred?sort=created&per_page=${count}`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid starred repository payload");
  }

  res.contentType("image/svg+xml").send(generateLastStarSvg(response as GitHubStarredRepo[], gap, perRow));
}
