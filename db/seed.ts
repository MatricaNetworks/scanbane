import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Check if users already exist
    const existingUsers = await db.query.users.findMany();
    
    if (existingUsers.length === 0) {
      console.log('Seeding users...');
      
      // Create default admin user
      const adminPassword = await hashPassword("admin123");
      await db.insert(schema.users).values({
        username: "admin",
        password: adminPassword,
        phoneNumber: "+15551234567",
        scansUsed: 0,
        subscriptionTier: "admin",
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      // Create demo user
      const demoPassword = await hashPassword("demo123");
      await db.insert(schema.users).values({
        username: "demo",
        password: demoPassword,
        phoneNumber: "+15559876543",
        scansUsed: 1,
        subscriptionTier: "free",
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      console.log('Users seeded successfully!');
    } else {
      console.log('Users already exist, skipping user seed.');
    }
    
    // Check if scan results already exist
    const existingScans = await db.query.scanResults.findMany();
    
    if (existingScans.length === 0) {
      console.log('Seeding scan results...');
      
      // Get the demo user
      const demoUser = await db.query.users.findFirst({
        where: schema.users.username === "demo"
      });
      
      if (demoUser) {
        // Sample scan results data
        const scanResultsData = [
          {
            userId: demoUser.id,
            scanType: "url",
            targetName: "https://secure-example.com",
            result: "safe",
            threatType: null,
            details: {
              confidence: 95,
              detectionTime: new Date().toISOString()
            },
            createdAt: new Date(Date.now() - 5 * 60000) // 5 minutes ago
          },
          {
            userId: demoUser.id,
            scanType: "file",
            targetName: "suspicious-login.pdf",
            result: "malicious",
            threatType: "malware",
            details: {
              confidence: 88,
              detectionTime: new Date().toISOString(),
              fileType: "application/pdf",
              fileSize: 2457860
            },
            createdAt: new Date(Date.now() - 60 * 60000) // 1 hour ago
          },
          {
            userId: demoUser.id,
            scanType: "image",
            targetName: "vacation-photo.jpg",
            result: "suspicious",
            threatType: "steganography",
            details: {
              confidence: 78,
              detectionTime: new Date().toISOString(),
              imageType: "image/jpeg",
              imageSize: 1245786
            },
            createdAt: new Date(Date.now() - 24 * 60 * 60000) // 1 day ago
          },
          {
            userId: demoUser.id,
            scanType: "url",
            targetName: "https://example-store.com/products",
            result: "safe",
            threatType: null,
            details: {
              confidence: 98,
              detectionTime: new Date().toISOString()
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000) // 2 days ago
          },
          {
            userId: demoUser.id,
            scanType: "file",
            targetName: "report.docx",
            result: "safe",
            threatType: null,
            details: {
              confidence: 96,
              detectionTime: new Date().toISOString(),
              fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              fileSize: 158720
            },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000) // 3 days ago
          }
        ];
        
        // Insert scan results
        for (const scan of scanResultsData) {
          await db.insert(schema.scanResults).values(scan);
        }
        
        console.log('Scan results seeded successfully!');
      } else {
        console.log('Demo user not found, skipping scan result seed.');
      }
    } else {
      console.log('Scan results already exist, skipping scan result seed.');
    }

    // Check if license keys already exist
    const existingLicenses = await db.query.licenses.findMany();
    
    if (existingLicenses.length === 0) {
      console.log('Seeding license keys...');
      
      // Create sample license keys
      const licensesData = [
        {
          licenseKey: "c1b6e2a8-3d7f-4e9c-8a5b-6f2e0d4c7b9a",
          tier: "individual",
          maxActivations: 1,
          used: 0,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60000) // 1 year from now
        },
        {
          licenseKey: "f7a3e9d1-2c5b-8f4e-6a9d-3b7c5e1f8a2d",
          tier: "small",
          maxActivations: 5,
          used: 0,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60000) // 1 year from now
        },
        {
          licenseKey: "9e8d7c6b-5a4f-3e2d-1c9b-8a7f6e5d4c3b",
          tier: "enterprise",
          maxActivations: 9999,
          used: 0,
          isActive: true,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60000) // 1 year from now
        }
      ];
      
      // Insert license keys
      for (const license of licensesData) {
        await db.insert(schema.licenses).values(license);
      }
      
      console.log('License keys seeded successfully!');
    } else {
      console.log('License keys already exist, skipping license key seed.');
    }

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
