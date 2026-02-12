import type { Request } from "express";

import { assertColor } from "./validators";

const colorQueryRegex = /&{0,1}color=[^&]+/;

export interface RequestContext extends Record<string, string | undefined> {
  color: string;
  options: string;
}

export default function getContext(req: Request): RequestContext {
  const params = Object.fromEntries(Object.entries(req.params).map(([key, value]) => [key, String(value)])) as Record<string, string>;
  const context: RequestContext = { ...params, color: "brightgreen", options: "" };

  context.options = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";

  if (colorQueryRegex.test(context.options)) {
    const colorMatch = context.options.match(colorQueryRegex);
    const parsedColor = colorMatch?.[0].split("=")[1];

    if (parsedColor) {
      context.color = parsedColor;
    }

    context.options = context.options.replace(colorQueryRegex, "");
  }

  assertColor(context.color);

  return context;
}
