import type { Request, Response } from "express";

import fetchGitHubJson from "../../helpers/fetchGitHubJson";
import getContext from "../../helpers/getContext";
import createHttpError from "../../helpers/httpError";
import redirectBadge from "../../helpers/redirectBadge";
import startOf from "../../helpers/startOf";
import { assertGitHubIdentifier, assertOneOf } from "../../helpers/validators";

import type { GitHubSearchCommitsPayload } from "../../types/github";

const periodicityMap = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
  all: null,
} as const;

type PeriodicityKey = keyof typeof periodicityMap;
const periodicityKeys = Object.keys(periodicityMap) as PeriodicityKey[];

export default async function commitsPeriodicityUser(req: Request, res: Response): Promise<void> {
  const { user, periodicity, color, options } = getContext(req);

  assertGitHubIdentifier(user, "user");
  assertOneOf(periodicity, "periodicity", periodicityKeys);

  const periodStart = startOf(periodicityMap[periodicity]);
  const response = await fetchGitHubJson<GitHubSearchCommitsPayload>(`/search/commits?q=author:${user}+author-date%3A>=${periodStart}`);

  if (typeof response.total_count !== "number") {
    throw createHttpError(502, "GitHub returned invalid commit count payload");
  }

  const badgeLabel =
    periodicity === "all" ? "All commits" : periodicity === "daily" ? "Commits today" : `Commits this ${periodicityMap[periodicity]}`;

  redirectBadge(res, { label: badgeLabel, message: response.total_count, color, options });
}
