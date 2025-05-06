import { db } from "@db";
import { users, scanResults, licenses } from "@shared/schema";
import { eq, desc, and, count } from "drizzle-orm";
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
  updateUser(userId: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getUserCount(): Promise<number>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    enterpriseUsers: number;
    freeUsers: number;
  }>;
  
  // Scan operations
  createScanResult(scan: InsertScanResult): Promise<ScanResult>;
  getScanResults(userId: number, limit?: number): Promise<ScanResult[]>;
  getAllScanResults(limit?: number, offset?: number): Promise<ScanResult[]>;
  getScanResultsCount(): Promise<number>;
  getScanResultStats(): Promise<{ 
    result: string; 
    count: number 
  }[]>;
  getThreatTypeStats(): Promise<{ 
    threatType: string; 
    count: number 
  }[]>;
  
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
  
  async updateUser(userId: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }
  
  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const results = await db.query.users.findMany({
      orderBy: desc(users.createdAt),
      limit,
      offset
    });
    return results;
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }
  
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    enterpriseUsers: number;
    freeUsers: number;
  }> {
    // Get total users
    const totalCount = await this.getUserCount();
    
    // Get active users
    const activeCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.isActive, true));
    
    // Get premium users
    const premiumCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'premium'));
    
    // Get enterprise users
    const enterpriseCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'enterprise'));
    
    // Get free users
    const freeCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.subscriptionTier, 'free'));
    
    return {
      totalUsers: totalCount,
      activeUsers: activeCount[0].count,
      premiumUsers: premiumCount[0].count,
      enterpriseUsers: enterpriseCount[0].count,
      freeUsers: freeCount[0].count,
    };
  }
  
  async getAllScanResults(limit = 50, offset = 0): Promise<ScanResult[]> {
    const results = await db.query.scanResults.findMany({
      orderBy: desc(scanResults.createdAt),
      limit,
      offset,
      with: {
        user: true
      }
    });
    return results;
  }
  
  async getScanResultsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(scanResults);
    return result[0].count;
  }
  
  async getScanResultStats(): Promise<{ result: string; count: number }[]> {
    // This requires a direct SQL query for aggregation
    const results = await db.execute(
      `SELECT result, COUNT(*) as count 
       FROM scan_results 
       GROUP BY result 
       ORDER BY count DESC`
    );
    
    return results.rows.map((row: any) => ({
      result: row.result,
      count: parseInt(row.count)
    }));
  }
  
  async getThreatTypeStats(): Promise<{ threatType: string; count: number }[]> {
    // This requires a direct SQL query for aggregation
    const results = await db.execute(
      `SELECT threat_type as "threatType", COUNT(*) as count 
       FROM scan_results 
       WHERE threat_type IS NOT NULL 
       GROUP BY threat_type 
       ORDER BY count DESC`
    );
    
    return results.rows.map((row: any) => ({
      threatType: row.threatType || 'Unknown',
      count: parseInt(row.count)
    }));
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();
