interface SwaggerResponseBodyProps extends Record<string, unknown> {
  content?: unknown;
  contentType?: string;
}

interface SwaggerResponseBodySystem {
  React: {
    createElement: (...args: unknown[]) => unknown;
  };
}

type SwaggerResponseBodyComponent = (props: SwaggerResponseBodyProps) => unknown;

export function svgResponsePreviewPlugin() {
  const highlightCodeComponentKey = "HighlightCode";
  const probeKeys = ["content", "value", "source", "children", "code", "parsedContent"];
  const wrapComponents: Record<string, (Original: SwaggerResponseBodyComponent, system: SwaggerResponseBodySystem) => unknown> = {
    [highlightCodeComponentKey]: function (Original: SwaggerResponseBodyComponent, system: SwaggerResponseBodySystem) {
      return function (props: SwaggerResponseBodyProps) {
        let svgMarkup: string | undefined;
        const stack: unknown[] = [props];

        while (!svgMarkup && stack.length > 0) {
          const candidate = stack.pop();

          if (typeof candidate === "string") {
            const trimmed = candidate.trim();
            const decoded = trimmed.includes("&lt;svg") ? trimmed.replaceAll("&lt;", "<").replaceAll("&gt;", ">") : trimmed;
            const svgStartIndex = decoded.indexOf("<svg");

            if (svgStartIndex !== -1) {
              svgMarkup = decoded.slice(svgStartIndex);
              break;
            }
          } else if (Array.isArray(candidate)) {
            for (const item of candidate) {
              stack.push(item);
            }
          } else if (typeof candidate === "object" && candidate !== null) {
            const record = candidate as Record<string, unknown>;

            for (const key of probeKeys) {
              if (key in record) {
                stack.push(record[key]);
              }
            }
          }
        }

        let isSvgFromContentType = false;
        const contentTypeCandidates: unknown[] = [props.contentType];

        while (!isSvgFromContentType && contentTypeCandidates.length > 0) {
          const candidate = contentTypeCandidates.pop();

          if (typeof candidate === "string") {
            isSvgFromContentType = candidate.toLowerCase().includes("image/svg+xml");
          } else if (Array.isArray(candidate)) {
            for (const entry of candidate) {
              contentTypeCandidates.push(entry);
            }
          }
        }

        if (!svgMarkup && typeof props.content === "string") {
          svgMarkup = props.content;
        }

        if (!isSvgFromContentType && !svgMarkup) {
          return system.React.createElement(Original, props);
        }

        if (!svgMarkup) {
          return system.React.createElement(Original, props);
        }

        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

        return system.React.createElement(
          "div",
          { style: { display: "grid", gap: "12px" } },
          system.React.createElement("img", {
            src: svgDataUrl,
            alt: "SVG preview",
            style: { maxWidth: "100%", height: "auto" },
          }),
          system.React.createElement(Original, props),
        );
      };
    },
  };

  return {
    wrapComponents,
  };
}
