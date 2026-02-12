export interface GitHubSearchCommitsPayload {
  total_count?: number;
  message?: string;
}

export interface GitHubUserPayload {
  created_at?: string;
  public_repos?: number;
  message?: string;
}

export interface GitHubRepoPayload {
  id?: number;
  created_at?: string;
  updated_at?: string;
  message?: string;
}

export interface GitHubContributor {
  type?: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubStarredRepo {
  full_name: string;
  html_url: string;
  stargazers_count: number;
  updated_at: string;
  language?: string;
}
