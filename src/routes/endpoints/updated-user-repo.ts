import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import fromNow from "../../helpers/fromNow";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubRepoName, assertGitHubUsername } from "../../helpers/validators";

import type { GitHubRepoPayload } from "../../types/github";

export default async function updatedUserRepo(req: Request, res: Response): Promise<void> {
  const { user, repo, color, options } = getContext(req);

  assertGitHubUsername(user);
  assertGitHubRepoName(repo);

  const response = await fetchGitHubJson<GitHubRepoPayload>(`/repos/${user}/${repo}`);

  if (!response.updated_at) {
    throw createHttpError(502, "GitHub returned invalid repository update date");
  }

  redirectBadge(res, { label: "Updated", message: fromNow(response.updated_at), color, options });
}
