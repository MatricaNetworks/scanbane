import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  scansUsed: integer("scans_used").default(0).notNull(),
  subscriptionTier: text("subscription_tier").default("free").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  role: text("role").default("user").notNull(), // 'user', 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// Scan results table
export const scanResults = pgTable("scan_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  scanType: text("scan_type").notNull(), // 'url', 'file', 'image'
  targetName: text("target_name").notNull(), // URL or file name
  result: text("result").notNull(), // 'safe', 'malicious', 'suspicious'
  threatType: text("threat_type"), // 'phishing', 'malware', 'steganography', etc.
  details: json("details"), // Additional scan details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  scanResults: many(scanResults),
}));

export const scanResultsRelations = relations(scanResults, ({ one }) => ({
  user: one(users, { fields: [scanResults.userId], references: [users.id] }),
}));

// Licenses table for desktop applications
export const licenses = pgTable("licenses", {
  id: serial("id").primaryKey(),
  licenseKey: text("license_key").notNull().unique(),
  tier: text("tier").notNull(), // 'individual', 'small', 'enterprise'
  maxActivations: integer("max_activations").notNull(),
  used: integer("used").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Define validation schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  phoneNumber: true,
});

export const phoneLoginSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
});

export const otpVerificationSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({ 
  id: true,
  createdAt: true 
});

export const urlScanSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ScanResult = typeof scanResults.$inferSelect;
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type UrlScanRequest = z.infer<typeof urlScanSchema>;
export type PhoneLogin = z.infer<typeof phoneLoginSchema>;
export type OtpVerification = z.infer<typeof otpVerificationSchema>;
