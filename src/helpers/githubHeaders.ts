export default function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "pujux/badge-it",
    accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`;
  }

  return headers;
}
