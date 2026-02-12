import type { Request, Response } from "express";

import { MongoClient } from "mongodb";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import logger from "../../helpers/logger";
import redirectBadge from "../../helpers/redirectBadge";
import { assertGitHubIdentifier } from "../../helpers/validators";

import type { GitHubRepoPayload } from "../../types/github";
import type { HttpError } from "../../types/http";

const client = new MongoClient(process.env.DATABASE_URI ?? "mongodb://localhost:27017/badge-it");

void client
  .connect()
  .then(() => logger.info({ component: "mongodb" }, "Connected to MongoDB"))
  .catch((error: unknown) => logger.error({ err: error, component: "mongodb" }, "Failed to connect to MongoDB"));

function isHttpError(error: unknown): error is HttpError {
  return typeof error === "object" && error !== null && "statusCode" in error;
}

export default async function visitsUserRepo(req: Request, res: Response): Promise<void> {
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

  let data: { counter?: unknown } | null;
  try {
    data = (await client
      .db()
      .collection("repo-visits")
      .findOneAndUpdate({ user, repo }, { $inc: { counter: 1 } }, { returnDocument: "after", upsert: true })) as { counter?: unknown } | null;
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : undefined;
    throw createHttpError(503, "Visit counter storage unavailable", details);
  }

  if (!data || typeof data.counter !== "number") {
    throw createHttpError(503, "Visit counter storage returned invalid response");
  }

  redirectBadge(res, { label: "Visits", message: data.counter, color, options });
}
