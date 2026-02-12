import type { Response } from "express";

import type { BadgePayload } from "../types/http";

function encodeBadgeSegment(value: number | string): string {
  return encodeURIComponent(String(value)).replace(/-/g, "--");
}

export default function redirectBadge(res: Response, { label, message, color, options = "" }: BadgePayload): void {
  const url = `https://img.shields.io/badge/${encodeBadgeSegment(label)}-${encodeBadgeSegment(message)}-${color}${options}`;
  res.redirect(url);
}
