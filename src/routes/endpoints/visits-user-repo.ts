import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubIdentifier } from "../../helpers/validators";

import type { GitHubRepoPayload } from "../../types/github";
import type { HttpError } from "../../types/http";
import type { VisitsStore } from "../../services/visitsStore";

interface VisitsEndpointDependencies {
  visitsStore: VisitsStore;
}

function isHttpError(error: unknown): error is HttpError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

export default function createVisitsUserRepoHandler({ visitsStore }: VisitsEndpointDependencies) {
  return async function visitsUserRepo(req: Request, res: Response): Promise<void> {
    const { user, repo, color, options } = getContext(req);

    assertGitHubIdentifier(user, "user");
    assertGitHubIdentifier(repo, "repo");

    let response: GitHubRepoPayload;
    try {
      response = await fetchGitHubJson<GitHubRepoPayload>(`/repos/${user}/${repo}`);
    } catch (error: unknown) {
      if (isHttpError(error) && error.statusCode === 404) {
        redirectBadge(res, { label: "Visits", message: "Repo not found", color, options });
        return;
      }

      throw error;
    }

    if (!response.id) {
      throw createHttpError(502, "GitHub returned invalid repository payload");
    }

    let counter: number;
    try {
      counter = await visitsStore.increment(user, repo);
    } catch (error: unknown) {
      const details = error instanceof Error ? error.message : undefined;
      throw createHttpError(503, "Visit counter storage unavailable", details);
    }

    redirectBadge(res, { label: "Visits", message: counter, color, options });
  };
}
