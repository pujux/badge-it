import type { NextFunction, Request, Response } from "express";

import type { AsyncRequestHandler } from "../types/http";

export default function asyncHandler(handler: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}
