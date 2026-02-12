import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubUsername } from "../../helpers/validators";

import type { GitHubUserPayload } from "../../types/github";

export default async function reposUser(req: Request, res: Response): Promise<void> {
  const { user, color, options } = getContext(req);

  assertGitHubUsername(user);

  const response = await fetchGitHubJson<GitHubUserPayload>(`/users/${user}`);

  if (typeof response.public_repos !== "number") {
    throw createHttpError(502, "GitHub returned invalid repository count");
  }

  redirectBadge(res, { label: "Repos", message: response.public_repos, color, options });
}
