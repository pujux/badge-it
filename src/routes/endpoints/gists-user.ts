import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubIdentifier } from "../../helpers/validators";

import type { GitHubUserPayload } from "../../types/github";

export default async function gistsUser(req: Request, res: Response): Promise<void> {
  const { user, color, options } = getContext(req);

  assertGitHubIdentifier(user, "user");

  const response = await fetchGitHubJson<GitHubUserPayload>(`/users/${user}`);

  if (typeof response.public_gists !== "number") {
    throw createHttpError(502, "GitHub returned invalid gists payload");
  }

  redirectBadge(res, { label: "Gists", message: response.public_gists, color, options });
}
