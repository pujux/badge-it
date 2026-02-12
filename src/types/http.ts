import type { NextFunction, Request, Response } from "express";

export interface HttpError extends Error {
  statusCode: number;
  details?: unknown;
}

export interface BadgePayload {
  label: string;
  message: number | string;
  color: string;
  options?: string;
}

export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
