import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import generateContributorSvg from "../../helpers/generateContributorSvg";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import { assertGitHubRepoName, assertGitHubUsername, parseBoundedInt } from "../../helpers/validators";

import type { GitHubContributor } from "../../types/github";

function queryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isGitHubContributor(value: unknown): value is GitHubContributor {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<GitHubContributor>;
  return (
    typeof candidate.avatar_url === "string" &&
    typeof candidate.html_url === "string" &&
    (candidate.type === undefined || typeof candidate.type === "string")
  );
}

export default async function contributorsUserRepo(req: Request, res: Response): Promise<void> {
  const { user, repo } = getContext(req);

  assertGitHubUsername(user);
  assertGitHubRepoName(repo);

  const size = parseBoundedInt(queryString(req.query.size), "size", { min: 16, max: 256, defaultValue: 50 });
  const padding = parseBoundedInt(queryString(req.query.padding), "padding", { min: 0, max: 64, defaultValue: 5 });
  const perRow = parseBoundedInt(queryString(req.query.perRow), "perRow", { min: 1, max: 50, defaultValue: 10 });

  const botsQuery = queryString(req.query.bots);
  if (botsQuery !== undefined && !["true", "false"].includes(botsQuery)) {
    throw createHttpError(400, "Invalid bots parameter");
  }

  const includeBots = botsQuery !== "false";
  const response = await fetchGitHubJson<unknown>(`/repos/${user}/${repo}/contributors`);

  if (!Array.isArray(response) || !response.every(isGitHubContributor)) {
    throw createHttpError(502, "GitHub returned invalid contributors payload");
  }

  const contributors = response;
  const filteredContributors = includeBots ? contributors : contributors.filter((contributor) => contributor.type === "User");
  const svg = await generateContributorSvg(filteredContributors, size, padding, perRow);

  res.contentType("image/svg+xml").send(svg);
}
