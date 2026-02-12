export interface VisitsStore {
  increment(user: string, repo: string): Promise<number>;
}
