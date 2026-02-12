import type { Request } from "express";

import { assertColor } from "./validators";

export interface RequestContext extends Record<string, string | undefined> {
  color: string;
  options: string;
}

export default function getContext(req: Request): RequestContext {
  const params = Object.fromEntries(Object.entries(req.params).map(([key, value]) => [key, String(value)])) as Record<string, string>;
  const context: RequestContext = { ...params, color: "brightgreen", options: "" };

  const queryStart = req.originalUrl.indexOf("?");
  if (queryStart !== -1) {
    const search = req.originalUrl.slice(queryStart + 1);
    const searchParams = new URLSearchParams(search);
    const parsedColor = searchParams.get("color");

    if (parsedColor !== null) {
      context.color = parsedColor;
      searchParams.delete("color");
    }

    const options = searchParams.toString();
    context.options = options ? `?${options}` : "";
  }

  assertColor(context.color);

  return context;
}
