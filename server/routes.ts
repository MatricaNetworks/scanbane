import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { scanResults, urlScanSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { ZodError } from "zod";
import { log } from "./vite";

// Import services
import { 
  urlAnalysisService,
  fileAnalysisService,
  imageAnalysisService,
  apkAnalysisService
} from "./services";

// Setup file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (_req, file, cb) => {
    // Check file types - expanded to include APK and more formats
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-msdownload' ||
        file.mimetype === 'application/x-msi' ||
        file.mimetype === 'application/vnd.android.package-archive' ||
        file.mimetype === 'application/octet-stream' ||
        file.originalname.endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

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
      
      // Scan the URL with comprehensive analysis
      const analysisResult = await urlAnalysisService.analyzeUrl(url);
      
      // Map result to expected format
      const scanResult = {
        result: analysisResult.isMalicious ? "malicious" : "safe",
        threatType: analysisResult.threatType,
        details: {
          confidence: Math.floor(analysisResult.confidence * 100),
          detectionTime: new Date().toISOString(),
          explanation: analysisResult.finalVerdict,
          scanServices: Object.keys(analysisResult.scanResults).filter(
            key => analysisResult.scanResults[key] !== null
          )
        },
        scanDetails: analysisResult.scanResults
      };
      
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
      log(`URL scan error: ${error}`, 'routes');
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
      
      // Check if file is APK
      const isApk = req.file.originalname.toLowerCase().endsWith('.apk') || 
                    req.file.mimetype === 'application/vnd.android.package-archive';
      
      // Perform appropriate analysis
      let analysisResult;
      if (isApk) {
        log(`Processing APK file: ${req.file.originalname}`, 'routes');
        analysisResult = await apkAnalysisService.analyzeApk(
          req.file.buffer, 
          req.file.originalname
        );
      } else {
        log(`Processing generic file: ${req.file.originalname}`, 'routes');
        analysisResult = await fileAnalysisService.analyzeFile(
          req.file.buffer, 
          req.file.originalname, 
          req.file.mimetype
        );
      }
      
      // Map result to expected format
      const scanResult = {
        result: analysisResult.isMalicious ? "malicious" : "safe",
        threatType: analysisResult.threatType,
        details: {
          confidence: Math.floor(analysisResult.confidence * 100),
          detectionTime: new Date().toISOString(),
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          explanation: analysisResult.finalVerdict,
          isApk,
          scanServices: Object.keys(analysisResult.scanResults).filter(
            key => analysisResult.scanResults[key] !== null
          )
        },
        scanDetails: analysisResult.scanResults
      };
      
      // Store scan result
      const newScan = await storage.createScanResult({
        userId: req.user.id,
        scanType: isApk ? "apk" : "file",
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
      log(`File scan error: ${error}`, 'routes');
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
      
      // Scan the image with steganography detection
      const analysisResult = await imageAnalysisService.analyzeImage(
        req.file.buffer, 
        req.file.originalname
      );
      
      // Map result to expected format
      const scanResult = {
        result: analysisResult.isSuspicious ? "suspicious" : "safe",
        threatType: analysisResult.threatType,
        details: {
          confidence: Math.floor(analysisResult.confidence * 100),
          detectionTime: new Date().toISOString(),
          imageType: req.file.mimetype,
          imageSize: req.file.size,
          explanation: analysisResult.finalVerdict,
          hasSteganography: analysisResult.scanResults.steganography?.hasSteganography || false,
          scanServices: Object.keys(analysisResult.scanResults).filter(
            key => analysisResult.scanResults[key] !== null
          )
        },
        scanDetails: analysisResult.scanResults
      };
      
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
      log(`Image scan error: ${error}`, 'routes');
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
      log(`Scan history error: ${error}`, 'routes');
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
      log(`License generation error: ${error}`, 'routes');
      res.status(500).json({ message: "Failed to generate license key" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Add WebSocket server for real-time scan notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    log('WebSocket client connected', 'websocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle client messages
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (error) {
        log(`WebSocket error: ${error}`, 'websocket');
      }
    });
    
    ws.on('close', () => {
      log('WebSocket client disconnected', 'websocket');
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'info', 
      message: 'Connected to ScamBane real-time notification service',
      timestamp: Date.now()
    }));
  });
  
  // Function to broadcast scan result to all connected clients
  // This will be used by the scan endpoints to notify clients
  (global as any).broadcastScanResult = (scanResult: any) => {
    const message = JSON.stringify({
      type: 'scan_result',
      data: scanResult,
      timestamp: Date.now()
    });
    
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  return httpServer;
}
