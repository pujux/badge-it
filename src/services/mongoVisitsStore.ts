import { MongoClient, type WithId } from "mongodb";

import logger from "../helpers/logger";

import type { VisitsStore } from "./visitsStore";

interface RepoVisitDocument {
  user: string;
  repo: string;
  counter: number;
}

class MongoVisitsStore implements VisitsStore {
  private readonly client: MongoClient;
  private readonly collectionName: string;
  private connectionPromise: Promise<void> | null = null;

  constructor(client: MongoClient, collectionName = "repo-visits") {
    this.client = client;
    this.collectionName = collectionName;
    this.ensureConnected();
  }

  private async ensureConnected(): Promise<void> {
    if (!this.connectionPromise) {
      this.connectionPromise = this.client
        .connect()
        .then(() => {
          logger.info({ component: "mongodb" }, "Connected to MongoDB");
        })
        .catch((error: unknown) => {
          logger.error({ err: error, component: "mongodb" }, "Failed to connect to MongoDB");
          this.connectionPromise = null;
          throw error;
        });
    }

    await this.connectionPromise;
  }

  async increment(user: string, repo: string): Promise<number> {
    await this.ensureConnected();

    const collection = this.client.db().collection<RepoVisitDocument>(this.collectionName);
    const updated = (await collection.findOneAndUpdate(
      { user, repo },
      { $inc: { counter: 1 } },
      { returnDocument: "after", upsert: true },
    )) as WithId<RepoVisitDocument> | null;

    if (!updated || typeof updated.counter !== "number") {
      throw new Error("Visit counter storage returned invalid response");
    }

    return updated.counter;
  }
}

export function createMongoVisitsStore(databaseUri = process.env.DATABASE_URI ?? "mongodb://localhost:27017/badge-it"): VisitsStore {
  return new MongoVisitsStore(new MongoClient(databaseUri));
}
