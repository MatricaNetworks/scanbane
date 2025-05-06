import { db } from "@db";
import { users, scanResults, licenses } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import type { InsertUser, User, InsertScanResult, ScanResult } from "@shared/schema";
import { createId } from "@paralleldrive/cuid2";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  updateUserScans(userId: number): Promise<User | undefined>;
  
  // Scan operations
  createScanResult(scan: InsertScanResult): Promise<ScanResult>;
  getScanResults(userId: number, limit?: number): Promise<ScanResult[]>;
  
  // License operations
  generateLicenseKey(tier: string, maxActivations: number): Promise<string>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result;
  }
  
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.phoneNumber, phoneNumber)
    });
    return result;
  }
  
  async updateUserScans(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const [updatedUser] = await db
      .update(users)
      .set({ scansUsed: user.scansUsed + 1 })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async createScanResult(scan: InsertScanResult): Promise<ScanResult> {
    const [newScan] = await db.insert(scanResults).values(scan).returning();
    return newScan;
  }
  
  async getScanResults(userId: number, limit = 10): Promise<ScanResult[]> {
    const results = await db.query.scanResults.findMany({
      where: eq(scanResults.userId, userId),
      orderBy: desc(scanResults.createdAt),
      limit
    });
    return results;
  }
  
  async generateLicenseKey(tier: string, maxActivations: number): Promise<string> {
    // Generate a unique license key
    const licenseKey = createId();
    
    // Calculate expiration date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    // Store the license key in the database
    await db.insert(licenses).values({
      licenseKey,
      tier,
      maxActivations,
      used: 0,
      isActive: true,
      createdAt: new Date(),
      expiresAt
    });
    
    return licenseKey;
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
