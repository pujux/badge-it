const fallbackGitHubUrl = "https://github.com/";

const xmlEscapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function isAllowedGitHubHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "github.com" || normalized.endsWith(".github.com");
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => xmlEscapeMap[character]);
}

export function sanitizeGitHubUrl(value: string): string {
  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== "https:" || !isAllowedGitHubHost(parsedUrl.hostname)) {
      return fallbackGitHubUrl;
    }

    return parsedUrl.toString();
  } catch {
    return fallbackGitHubUrl;
  }
}
