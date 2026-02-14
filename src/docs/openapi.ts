const redirectFollowNote =
  "This endpoint returns a 302 redirect to img.shields.io. Clients that automatically follow redirects (including Swagger UI in-browser requests) will show a 200 image/svg+xml response when the downstream badge request succeeds.";
const rateLimitNote = "Requests are rate-limited service-wide per source IP and can return 429 when the current window is exceeded.";
const docsCacheNote = "Cache-Control: public, max-age=300, s-maxage=300.";
const badgeCacheNote = "Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=600.";
const visitsCacheNote = "Cache-Control: no-store (visit counters should not be cached).";
const commitsCacheNote = "Cache-Control: public, max-age=0, s-maxage=120, stale-while-revalidate=300.";
const svgCacheNote = "Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=600.";

const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Badge-It API",
    version: "0.0.1",
    description:
      "Badge-It generates GitHub-focused badges and SVG displays. Most endpoints redirect to a shields.io badge URL, while selected endpoints return SVG content directly. Endpoints use response caching headers and a service-wide in-memory IP rate limiter.",
  },
  servers: [{ url: "/", description: "Current host" }],
  externalDocs: {
    description: "Shields.io style and query options",
    url: "https://shields.io/#styles",
  },
  tags: [
    { name: "System", description: "Service metadata and health routes" },
    { name: "Badges", description: "Endpoints that redirect to shields.io badge URLs" },
    { name: "SVG", description: "Endpoints that render SVG content directly" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        operationId: "getHealth",
        summary: "Health check",
        responses: {
          200: {
            description: "Service is healthy",
            content: {
              "text/plain": {
                schema: { type: "string", const: "OK" },
                example: "OK",
              },
            },
          },
        },
      },
    },
    "/openapi.json": {
      get: {
        tags: ["System"],
        operationId: "getOpenApiDocument",
        summary: "OpenAPI document",
        description: `${docsCacheNote} ${rateLimitNote}`,
        responses: {
          200: {
            description: "OpenAPI specification for this service",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
        },
      },
    },
    "/docs": {
      get: {
        tags: ["System"],
        operationId: "getDocsUi",
        summary: "Swagger UI HTML",
        description: `${docsCacheNote} ${rateLimitNote}`,
        responses: {
          200: {
            description: "Swagger UI page",
            content: {
              "text/html": {
                schema: { type: "string" },
              },
            },
          },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
        },
      },
    },
    "/visits/{user}/{repo}": {
      get: {
        tags: ["Badges"],
        operationId: "getVisitsBadge",
        summary: "Visits badge",
        description: `Redirects to a shields.io badge showing visit count for a repository. ${redirectFollowNote} ${visitsCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/RepoParam" },
          { $ref: "#/components/parameters/ColorQueryParam" },
        ],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
          503: { $ref: "#/components/responses/ServiceUnavailableResponse" },
        },
      },
    },
    "/years/{user}": {
      get: {
        tags: ["Badges"],
        operationId: "getYearsBadge",
        summary: "Years badge",
        description:
          `Redirects to a shields.io badge showing how many full years a user has been on GitHub. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${badgeCacheNote} ${rateLimitNote}`,
        parameters: [{ $ref: "#/components/parameters/UserParam" }, { $ref: "#/components/parameters/ColorQueryParam" }],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/repos/{user}": {
      get: {
        tags: ["Badges"],
        operationId: "getReposBadge",
        summary: "Repositories badge",
        description:
          `Redirects to a shields.io badge showing a user's public repository count. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${badgeCacheNote} ${rateLimitNote}`,
        parameters: [{ $ref: "#/components/parameters/UserParam" }, { $ref: "#/components/parameters/ColorQueryParam" }],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/gists/{user}": {
      get: {
        tags: ["Badges"],
        operationId: "getGistsBadge",
        summary: "Gists badge",
        description:
          `Redirects to a shields.io badge showing a user's public gist count. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${badgeCacheNote} ${rateLimitNote}`,
        parameters: [{ $ref: "#/components/parameters/UserParam" }, { $ref: "#/components/parameters/ColorQueryParam" }],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/updated/{user}/{repo}": {
      get: {
        tags: ["Badges"],
        operationId: "getUpdatedBadge",
        summary: "Updated badge",
        description:
          `Redirects to a shields.io badge showing when the repository was updated. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${badgeCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/RepoParam" },
          { $ref: "#/components/parameters/ColorQueryParam" },
        ],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/created/{user}/{repo}": {
      get: {
        tags: ["Badges"],
        operationId: "getCreatedBadge",
        summary: "Created badge",
        description:
          `Redirects to a shields.io badge showing when the repository was created. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${badgeCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/RepoParam" },
          { $ref: "#/components/parameters/ColorQueryParam" },
        ],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/commits/{periodicity}/{user}": {
      get: {
        tags: ["Badges"],
        operationId: "getCommitsBadge",
        summary: "Commits badge",
        description:
          `Redirects to a shields.io badge showing commit count in the selected period. Additional query parameters are forwarded to shields.io. ${redirectFollowNote} ${commitsCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/PeriodicityParam" },
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/ColorQueryParam" },
        ],
        responses: {
          200: { $ref: "#/components/responses/FollowedBadgeSvgResponse" },
          302: { $ref: "#/components/responses/BadgeRedirectResponse" },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/contributors/{user}/{repo}": {
      get: {
        tags: ["SVG"],
        operationId: "getContributorsSvg",
        summary: "Contributors display SVG",
        description: `Returns an SVG contributor grid. Response size is bounded and contributors are capped per request. ${svgCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/RepoParam" },
          { $ref: "#/components/parameters/SizeQueryParam" },
          { $ref: "#/components/parameters/PaddingContributorsQueryParam" },
          { $ref: "#/components/parameters/PerRowContributorsQueryParam" },
          { $ref: "#/components/parameters/BotsQueryParam" },
        ],
        responses: {
          200: {
            description: "SVG contributor grid",
            headers: {
              "Cache-Control": {
                description: svgCacheNote,
                schema: { type: "string" },
              },
            },
            content: {
              "image/svg+xml": {
                schema: { type: "string" },
              },
            },
          },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
    "/last-stars/{user}": {
      get: {
        tags: ["SVG"],
        operationId: "getLastStarsSvg",
        summary: "Last stars display SVG",
        description: `Returns an SVG with the most recent starred repositories. ${svgCacheNote} ${rateLimitNote}`,
        parameters: [
          { $ref: "#/components/parameters/UserParam" },
          { $ref: "#/components/parameters/CountQueryParam" },
          { $ref: "#/components/parameters/PaddingStarsQueryParam" },
          { $ref: "#/components/parameters/PerRowStarsQueryParam" },
        ],
        responses: {
          200: {
            description: "SVG recent stars grid",
            headers: {
              "Cache-Control": {
                description: svgCacheNote,
                schema: { type: "string" },
              },
            },
            content: {
              "image/svg+xml": {
                schema: { type: "string" },
              },
            },
          },
          429: { $ref: "#/components/responses/TooManyRequestsResponse" },
          400: { $ref: "#/components/responses/BadRequestResponse" },
          502: { $ref: "#/components/responses/UpstreamErrorResponse" },
        },
      },
    },
  },
  components: {
    parameters: {
      UserParam: {
        name: "user",
        in: "path",
        required: true,
        description: "GitHub username",
        schema: {
          type: "string",
          pattern: "^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$",
          minLength: 1,
          maxLength: 39,
        },
        example: "pujux",
      },
      RepoParam: {
        name: "repo",
        in: "path",
        required: true,
        description: "GitHub repository name",
        schema: {
          type: "string",
          pattern: "^[A-Za-z0-9._-]{1,100}$",
          minLength: 1,
          maxLength: 100,
        },
        example: "badge-it",
      },
      PeriodicityParam: {
        name: "periodicity",
        in: "path",
        required: true,
        description: "Commit aggregation period",
        schema: {
          type: "string",
          enum: ["daily", "weekly", "monthly", "yearly", "all"],
        },
        example: "monthly",
      },
      ColorQueryParam: {
        name: "color",
        in: "query",
        required: false,
        description: "Badge color token used in generated shields.io URL",
        schema: {
          type: "string",
          pattern: "^[A-Za-z0-9_-]{1,30}$",
          default: "brightgreen",
          minLength: 1,
          maxLength: 30,
        },
        example: "brightgreen",
      },
      SizeQueryParam: {
        name: "size",
        in: "query",
        required: false,
        description: "Avatar size in pixels",
        schema: {
          type: "integer",
          minimum: 16,
          maximum: 256,
          default: 50,
        },
        example: 50,
      },
      PaddingContributorsQueryParam: {
        name: "padding",
        in: "query",
        required: false,
        description: "Spacing between contributor avatars in pixels",
        schema: {
          type: "integer",
          minimum: 0,
          maximum: 64,
          default: 5,
        },
        example: 5,
      },
      PerRowContributorsQueryParam: {
        name: "perRow",
        in: "query",
        required: false,
        description: "Contributors per row",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 50,
          default: 10,
        },
        example: 10,
      },
      BotsQueryParam: {
        name: "bots",
        in: "query",
        required: false,
        description: "Include bot contributors",
        schema: {
          type: "boolean",
          default: true,
        },
        example: true,
      },
      CountQueryParam: {
        name: "count",
        in: "query",
        required: false,
        description: "How many starred repositories to display",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 30,
          default: 6,
        },
        example: 6,
      },
      PaddingStarsQueryParam: {
        name: "padding",
        in: "query",
        required: false,
        description: "Spacing between star cards in pixels",
        schema: {
          type: "integer",
          minimum: 0,
          maximum: 80,
          default: 15,
        },
        example: 15,
      },
      PerRowStarsQueryParam: {
        name: "perRow",
        in: "query",
        required: false,
        description: "Star cards per row",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 10,
          default: 2,
        },
        example: 2,
      },
    },
    responses: {
      FollowedBadgeSvgResponse: {
        description:
          "Observed client outcome when redirects are followed and img.shields.io returns a successful badge response.",
        content: {
          "image/svg+xml": {
            schema: { type: "string" },
          },
        },
      },
      BadgeRedirectResponse: {
        description: "Direct server response: redirect to generated shields.io badge URL",
        headers: {
          "Cache-Control": {
            description:
              "Caching policy for this redirect response. Most badge redirects use shared-cache TTLs; visits uses no-store to avoid cached counter increments.",
            schema: {
              type: "string",
            },
          },
          Location: {
            description: "Destination badge URL",
            schema: {
              type: "string",
              format: "uri",
            },
          },
        },
      },
      BadRequestResponse: {
        description: "Validation error",
        content: {
          "text/plain": {
            schema: { type: "string" },
          },
        },
      },
      UpstreamErrorResponse: {
        description: "GitHub upstream payload or availability error",
        content: {
          "text/plain": {
            schema: { type: "string", default: "Upstream Service Error" },
          },
        },
      },
      ServiceUnavailableResponse: {
        description: "Local storage unavailable",
        content: {
          "text/plain": {
            schema: { type: "string", default: "Service Unavailable" },
          },
        },
      },
      TooManyRequestsResponse: {
        description: "Rate limit exceeded",
        headers: {
          "Retry-After": {
            description: "Seconds until next allowed request in the current window.",
            schema: {
              type: "integer",
            },
          },
        },
        content: {
          "text/plain": {
            schema: { type: "string", default: "Too Many Requests" },
          },
        },
      },
    },
  },
} as const;

export default openApiDocument;
