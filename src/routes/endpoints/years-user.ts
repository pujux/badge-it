import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubIdentifier } from "../../helpers/validators";

import type { GitHubUserPayload } from "../../types/github";

export default async function yearsUser(req: Request, res: Response): Promise<void> {
  const { user, color, options } = getContext(req);

  assertGitHubIdentifier(user, "user");

  const response = await fetchGitHubJson<GitHubUserPayload>(`/users/${user}`);

  if (!response.created_at) {
    throw createHttpError(502, "GitHub returned invalid user payload");
  }

  const years = Math.floor((Date.now() - new Date(response.created_at).getTime()) / 31536e6);

  redirectBadge(res, { label: "Years", message: years, color, options });
}
