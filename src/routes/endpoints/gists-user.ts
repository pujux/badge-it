import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubIdentifier } from "../../helpers/validators";

export default async function gistsUser(req: Request, res: Response): Promise<void> {
  const { user, color, options } = getContext(req);

  assertGitHubIdentifier(user, "user");

  const response = await fetchGitHubJson<unknown>(`/users/${user}/gists`);

  if (!Array.isArray(response)) {
    throw createHttpError(502, "GitHub returned invalid gists payload");
  }

  redirectBadge(res, { label: "Gists", message: response.length, color, options });
}
