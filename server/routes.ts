import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { scanResults, urlScanSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { ZodError } from "zod";

// Setup file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    // Check file types
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-msdownload' ||
        file.mimetype === 'application/x-msi') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Mock functions for scanning - in a real implementation these would connect to backend services
async function scanURL(url: string, userId: number) {
  // Simulate URL scanning
  // In a real implementation, this would call an actual scanning service
  
  // Generate a random result for demo purposes
  const isMalicious = Math.random() < 0.3;
  
  if (isMalicious) {
    return {
      result: "malicious",
      threatType: Math.random() < 0.5 ? "phishing" : "malware",
      details: {
        confidence: Math.floor(Math.random() * 30) + 70,
        detectionTime: new Date().toISOString()
      }
    };
  } else {
    return {
      result: "safe",
      threatType: null,
      details: {
        confidence: Math.floor(Math.random() * 20) + 80,
        detectionTime: new Date().toISOString()
      }
    };
  }
}

async function scanFile(file: Express.Multer.File, userId: number) {
  // Simulate file scanning
  // In a real implementation, this would call an actual scanning service
  
  // Generate a random result for demo purposes
  const isMalicious = Math.random() < 0.3;
  
  if (isMalicious) {
    return {
      result: "malicious",
      threatType: "malware",
      details: {
        confidence: Math.floor(Math.random() * 30) + 70,
        detectionTime: new Date().toISOString(),
        fileType: file.mimetype,
        fileSize: file.size
      }
    };
  } else {
    return {
      result: "safe",
      threatType: null,
      details: {
        confidence: Math.floor(Math.random() * 20) + 80,
        detectionTime: new Date().toISOString(),
        fileType: file.mimetype,
        fileSize: file.size
      }
    };
  }
}

async function scanImage(file: Express.Multer.File, userId: number) {
  // Simulate image scanning for steganography
  // In a real implementation, this would call an actual scanning service
  
  // Generate a random result for demo purposes
  const isMalicious = Math.random() < 0.3;
  
  if (isMalicious) {
    return {
      result: "suspicious",
      threatType: "steganography",
      details: {
        confidence: Math.floor(Math.random() * 30) + 70,
        detectionTime: new Date().toISOString(),
        imageType: file.mimetype,
        imageSize: file.size
      }
    };
  } else {
    return {
      result: "safe",
      threatType: null,
      details: {
        confidence: Math.floor(Math.random() * 20) + 80,
        detectionTime: new Date().toISOString(),
        imageType: file.mimetype,
        imageSize: file.size
      }
    };
  }
}

// Check if user has scans available
async function checkTrialLimit(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user;
  
  // If user has a subscription, allow unlimited scans
  if (user.subscriptionTier !== 'free') {
    return next();
  }
  
  // Check if user has used all trial scans
  if (user.scansUsed >= 3) {
    return res.status(403).json({ 
      message: "Trial scan limit reached", 
      scansUsed: user.scansUsed,
      maxScans: 3,
      requiresUpgrade: true
    });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // URL scan endpoint
  app.post("/api/scan/url", checkTrialLimit, async (req, res) => {
    try {
      const { url } = urlScanSchema.parse(req.body);
      
      // Increment user's scan count
      await storage.updateUserScans(req.user.id);
      
      // Scan the URL
      const scanResult = await scanURL(url, req.user.id);
      
      // Store scan result
      const newScan = await storage.createScanResult({
        userId: req.user.id,
        scanType: "url",
        targetName: url,
        result: scanResult.result,
        threatType: scanResult.threatType,
        details: scanResult.details
      });
      
      res.status(200).json({
        scanId: newScan.id,
        ...scanResult,
        scansUsed: (req.user.scansUsed || 0) + 1,
        target: url
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid URL format",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to scan URL" });
    }
  });

  // File scan endpoint
  app.post("/api/scan/file", checkTrialLimit, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded or invalid file type" });
      }
      
      // Increment user's scan count
      await storage.updateUserScans(req.user.id);
      
      // Scan the file
      const scanResult = await scanFile(req.file, req.user.id);
      
      // Store scan result
      const newScan = await storage.createScanResult({
        userId: req.user.id,
        scanType: "file",
        targetName: req.file.originalname,
        result: scanResult.result,
        threatType: scanResult.threatType,
        details: scanResult.details
      });
      
      res.status(200).json({
        scanId: newScan.id,
        ...scanResult,
        scansUsed: (req.user.scansUsed || 0) + 1,
        target: req.file.originalname
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to scan file" });
    }
  });

  // Image scan endpoint
  app.post("/api/scan/image", checkTrialLimit, upload.single('image'), async (req, res) => {
    try {
      if (!req.file || !req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: "No image uploaded or invalid image type" });
      }
      
      // Increment user's scan count
      await storage.updateUserScans(req.user.id);
      
      // Scan the image
      const scanResult = await scanImage(req.file, req.user.id);
      
      // Store scan result
      const newScan = await storage.createScanResult({
        userId: req.user.id,
        scanType: "image",
        targetName: req.file.originalname,
        result: scanResult.result,
        threatType: scanResult.threatType,
        details: scanResult.details
      });
      
      res.status(200).json({
        scanId: newScan.id,
        ...scanResult,
        scansUsed: (req.user.scansUsed || 0) + 1,
        target: req.file.originalname
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to scan image" });
    }
  });

  // Get recent scans
  app.get("/api/scan/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scanHistory = await storage.getScanResults(req.user.id, limit);
      
      res.status(200).json(scanHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan history" });
    }
  });

  // Generate license key endpoint
  app.post("/api/license/generate", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { tier } = req.body;
      
      if (!tier || !['individual', 'small', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: "Invalid license tier" });
      }
      
      // Set max activations based on tier
      let maxActivations = 1; // individual
      if (tier === 'small') maxActivations = 5;
      if (tier === 'enterprise') maxActivations = 9999; // unlimited
      
      const licenseKey = await storage.generateLicenseKey(tier, maxActivations);
      
      res.status(201).json({ licenseKey, tier, maxActivations });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate license key" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
