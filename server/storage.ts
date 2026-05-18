import { User, InsertUser, Issue, InsertIssue } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { users, issues } from "@shared/schema";
import { eq } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createIssue(issue: InsertIssue & { userId: number }): Promise<Issue>;
  getIssues(): Promise<Issue[]>;
  getIssueById(id: number): Promise<Issue | undefined>;
  updateIssueStatus(id: number, status: string): Promise<Issue | undefined>;
  updateIssueVotes(id: number, increment: boolean): Promise<Issue | undefined>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createIssue(issue: InsertIssue & { userId: number }): Promise<Issue> {
    const [newIssue] = await db
      .insert(issues)
      .values({
        ...issue,
        status: 'reported',
        votes: 0,
      })
      .returning();
    return newIssue;
  }

  async getIssues(): Promise<Issue[]> {
    return await db.select().from(issues);
  }

  async getIssueById(id: number): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    return issue;
  }

  async updateIssueStatus(id: number, status: string): Promise<Issue | undefined> {
    const [issue] = await db
      .update(issues)
      .set({ status })
      .where(eq(issues.id, id))
      .returning();
    return issue;
  }

  async updateIssueVotes(id: number, increment: boolean): Promise<Issue | undefined> {
    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    if (!issue) return undefined;

    const [updatedIssue] = await db
      .update(issues)
      .set({ votes: increment ? issue.votes + 1 : issue.votes - 1 })
      .where(eq(issues.id, id))
      .returning();
    return updatedIssue;
  }
}

export const storage = new DatabaseStorage();