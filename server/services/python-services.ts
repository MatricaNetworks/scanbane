/**
 * Python Services TypeScript Integration
 * 
 * Provides TypeScript interfaces for the Python-based security services
 */

import { log } from '../vite';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import * as os from 'os';

// Get directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_SERVICES_DIR = path.join(__dirname, '..', 'python_services');

// Helper function to execute Python scripts
export async function executePythonScript(scriptName: string, args: string[] = [], input: Buffer | null = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(PYTHON_SERVICES_DIR, scriptName);
    
    log(`Executing Python script: ${scriptPath} ${args.join(' ')}`, 'python-service');
    
    // Use python3 explicitly
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    // If we have input data, write it to stdin
    if (input) {
      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();
    }
    
    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Python script error (${code}): ${stderr}`, 'python-service');
        reject(new Error(`Script failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        log(`Failed to parse Python script output: ${stdout}`, 'python-service');
        reject(new Error(`Failed to parse script output: ${error}`));
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      log(`Python script execution error: ${error.message}`, 'python-service');
      reject(error);
    });
  });
}

// Helper function to save temporary files
export async function saveToTempFile(data: Buffer, extension: string = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    const tempFileName = `scambane_${Date.now()}${extension}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    fs.writeFile(tempFilePath, data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tempFilePath);
    });
  });
}

/**
 * URL Analysis Service (Python implementation)
 */
export class PythonUrlAnalysisService {
  /**
   * Analyzes a URL for potential threats
   * @param url The URL to analyze
   */
  async analyzeUrl(url: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      virusTotal?: any;
      ai?: any;
      googleSafeBrowsing?: any;
      ipQualityScore?: any;
      domainInfo?: any;
      contentAnalysis?: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Analyzing URL with Python service: ${url}`, 'python-url-service');
      
      const result = await this.executeUrlAnalysis(url);
      
      // Map the Python service result to the expected TypeScript format
      return {
        isMalicious: result.isMalicious,
        confidence: result.confidence,
        threatType: result.threatType,
        scanResults: {
          virusTotal: result.detectionsByService?.virusTotal,
          googleSafeBrowsing: result.detectionsByService?.googleSafeBrowsing,
          ipQualityScore: result.detectionsByService?.ipQualityScore,
          domainInfo: result.metadata?.domainInfo,
          contentAnalysis: result.contentAnalysis,
          // Add more services as needed
        },
        finalVerdict: this.generateVerdict(result)
      };
    } catch (error: any) {
      log(`Error analyzing URL with Python service: ${error}`, 'python-url-service');
      
      // Return a safe default response
      return {
        isMalicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {},
        finalVerdict: `Analysis failed: ${error?.message || String(error)}`
      };
    }
  }
  
  /**
   * Execute the Python URL analysis script
   */
  private async executeUrlAnalysis(url: string): Promise<any> {
    try {
      // Run the URL analysis Python script with the URL as an argument
      return await executePythonScript('url_analysis_service.py', [url]);
    } catch (error) {
      log(`Failed to execute URL analysis script: ${error}`, 'python-url-service');
      throw error;
    }
  }
  
  /**
   * Generate a human-readable verdict from the analysis results
   */
  private generateVerdict(result: any): string {
    if (result.error) {
      return `Analysis failed: ${result.error}`;
    }
    
    if (result.isMalicious) {
      const confidenceText = result.confidence > 0.8 ? 'high' : result.confidence > 0.5 ? 'moderate' : 'low';
      const threatText = result.threatType ? result.threatType.toLowerCase() : 'suspicious content';
      
      let detectionServices = '';
      if (result.detectionMethods && result.detectionMethods.length > 0) {
        const services = result.detectionMethods.join(', ');
        detectionServices = ` Detected by: ${services}.`;
      }
      
      return `This URL has been identified as potentially malicious with ${confidenceText} confidence. It may contain ${threatText}.${detectionServices} We recommend not visiting this website.`;
    } else {
      return 'This URL appears to be safe based on our analysis. However, always exercise caution when visiting unfamiliar websites.';
    }
  }
}

/**
 * File Analysis Service (Python implementation)
 */
export class PythonFileAnalysisService {
  /**
   * Analyzes a file for potential threats
   * @param fileBuffer Buffer containing the file data
   * @param fileName Name of the file
   * @param mimeType MIME type of the file
   */
  async analyzeFile(fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: any;
    finalVerdict: string;
  }> {
    try {
      log(`Analyzing file with Python service: ${fileName}`, 'python-file-service');
      
      const result = await this.executeFileAnalysis(fileBuffer, fileName);
      
      // Map the Python service result to the expected TypeScript format
      return {
        isMalicious: result.isMalicious,
        confidence: result.confidence,
        threatType: result.malwareType || null,
        scanResults: {
          malwareDetection: result.detectionsByMethod,
          fileMetadata: result.metadata
        },
        finalVerdict: this.generateVerdict(result)
      };
    } catch (error: any) {
      log(`Error analyzing file with Python service: ${error}`, 'python-file-service');
      
      // Return a safe default response
      return {
        isMalicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {
          fileMetadata: {
            fileName,
            mimeType,
            error: error?.message || String(error)
          }
        },
        finalVerdict: `Analysis failed: ${error?.message || String(error)}`
      };
    }
  }
  
  /**
   * Execute the Python file analysis script
   */
  private async executeFileAnalysis(fileBuffer: Buffer, fileName: string): Promise<any> {
    try {
      // Save the file to a temporary location
      const tempFilePath = await saveToTempFile(fileBuffer);
      
      // Run the malware detection Python script
      return await executePythonScript('malware_detection_service.py', [tempFilePath, fileName]);
    } catch (error) {
      log(`Failed to execute file analysis script: ${error}`, 'python-file-service');
      throw error;
    }
  }
  
  /**
   * Generate a human-readable verdict from the analysis results
   */
  private generateVerdict(result: any): string {
    if (result.error) {
      return `Analysis failed: ${result.error}`;
    }
    
    if (result.isMalicious) {
      const confidenceText = result.confidence > 0.8 ? 'high' : result.confidence > 0.5 ? 'moderate' : 'low';
      const threatText = result.malwareType ? result.malwareType.toLowerCase() : 'malware';
      
      let detectionServices = '';
      if (result.detectionMethods && result.detectionMethods.length > 0) {
        const services = result.detectionMethods.join(', ');
        detectionServices = ` Detected by: ${services}.`;
      }
      
      return `This file has been identified as potentially malicious with ${confidenceText} confidence. It may contain ${threatText}.${detectionServices} We recommend not opening this file.`;
    } else {
      return 'This file appears to be safe based on our analysis. However, always exercise caution when opening files from unknown sources.';
    }
  }
}

/**
 * Image Analysis Service (Python implementation)
 */
export class PythonImageAnalysisService {
  /**
   * Analyzes an image for steganography and other suspicious content
   * @param imageBuffer Buffer containing the image data
   * @param imageName Name of the image file
   */
  async analyzeImage(imageBuffer: Buffer, imageName: string): Promise<{
    isSuspicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      steganography?: any;
      metadata: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Analyzing image with Python service: ${imageName}`, 'python-image-service');
      
      const result = await this.executeSteganographyDetection(imageBuffer);
      
      // Determine if the image is suspicious
      const isSuspicious = result.hasSteganography;
      const confidence = result.confidence;
      
      // Map the Python service result to the expected TypeScript format
      return {
        isSuspicious,
        confidence,
        threatType: isSuspicious ? 'steganography' : null,
        scanResults: {
          steganography: result,
          metadata: {
            fileName: imageName,
            fileSize: imageBuffer.length
          }
        },
        finalVerdict: this.generateVerdict(result)
      };
    } catch (error: any) {
      log(`Error analyzing image with Python service: ${error}`, 'python-image-service');
      
      // Return a safe default response
      return {
        isSuspicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {
          metadata: {
            fileName: imageName,
            error: error?.message || String(error)
          }
        },
        finalVerdict: `Analysis failed: ${error?.message || String(error)}`
      };
    }
  }
  
  /**
   * Execute the steganography detection Python script
   */
  private async executeSteganographyDetection(imageBuffer: Buffer): Promise<any> {
    try {
      // Save the image to a temporary location
      const tempFilePath = await saveToTempFile(imageBuffer, '.png');
      
      // Run the advanced media steganography detection script
      return await executePythonScript('advanced_media_steganography.py', [tempFilePath], imageBuffer);
    } catch (error) {
      log(`Failed to execute steganography detection script: ${error}`, 'python-image-service');
      throw error;
    }
  }
  
  /**
   * Generate a human-readable verdict from the analysis results
   */
  private generateVerdict(result: any): string {
    if (result.error) {
      return `Analysis failed: ${result.error}`;
    }
    
    if (result.hasSteganography) {
      const confidenceText = result.confidence > 0.8 ? 'high' : result.confidence > 0.5 ? 'moderate' : 'low';
      let methodInfo = '';
      
      if (result.detectionMethods && result.detectionMethods.length > 0) {
        methodInfo = ` Using methods: ${result.detectionMethods.join(', ')}.`;
      }
      
      return `This image appears to contain hidden data (steganography) with ${confidenceText} confidence.${methodInfo} The image may be used to conceal malicious code or sensitive information.`;
    } else {
      return 'No hidden data or steganography was detected in this image. It appears to be safe based on our analysis.';
    }
  }
}

/**
 * Media Analysis Service (Python implementation for audio and video)
 */
export class PythonMediaAnalysisService {
  /**
   * Analyzes media (audio/video) files for security threats
   * @param mediaBuffer Buffer containing the media data
   * @param fileName Name of the media file
   * @param mimeType MIME type of the media file
   */
  async analyzeMedia(mediaBuffer: Buffer, fileName: string, mimeType?: string): Promise<{
    isSuspicious: boolean;
    confidence: number;
    threatType: string | null;
    mediaType: string;
    scanResults: {
      securityAnalysis: any;
      metadata?: any;
      steganography?: any;
      yara?: any;
    };
    securityRecommendations: string[];
    finalVerdict: string;
  }> {
    try {
      log(`Analyzing media with Python service: ${fileName}`, 'python-media-service');
      
      const result = await this.executeMediaSecurity(mediaBuffer, fileName);
      
      // Determine if the media is suspicious
      const isSuspicious = !result.securityStatus?.isSafe;
      const confidence = this.calculateConfidence(result);
      const threatType = this.determineThreatType(result);
      const recommendations = result.securityStatus?.recommendations || [];
      
      // Map the Python service result to the expected TypeScript format
      return {
        isSuspicious,
        confidence,
        threatType,
        mediaType: result.fileType || this.determineMediaType(fileName, mimeType),
        scanResults: {
          securityAnalysis: result.securityStatus,
          metadata: result.metadata,
          steganography: result.analysis?.steganography,
          yara: result.analysis?.yara
        },
        securityRecommendations: recommendations,
        finalVerdict: this.generateVerdict(result, isSuspicious, confidence, threatType)
      };
    } catch (error: any) {
      log(`Error analyzing media with Python service: ${error}`, 'python-media-service');
      
      // Return a safe default response
      return {
        isSuspicious: false,
        confidence: 0,
        threatType: null,
        mediaType: this.determineMediaType(fileName, mimeType),
        scanResults: {
          securityAnalysis: {
            warnings: [`Analysis failed: ${error?.message || String(error)}`]
          }
        },
        securityRecommendations: [
          "Exercise caution with this file as security analysis failed",
          "Sandbox media files before opening them in your main environment",
          "Strip metadata from media files before sharing",
          "Disable autoplay in media players for untrusted content"
        ],
        finalVerdict: `Analysis failed: ${error?.message || String(error)}`
      };
    }
  }
  
  /**
   * Execute the Python media security script
   */
  private async executeMediaSecurity(mediaBuffer: Buffer, fileName: string): Promise<any> {
    try {
      // Save the media to a temporary location
      const tempFilePath = await saveToTempFile(mediaBuffer);
      
      // Run the media security service Python script
      return await executePythonScript('media_security_service.py', [tempFilePath, fileName], mediaBuffer);
    } catch (error) {
      log(`Failed to execute media security script: ${error}`, 'python-media-service');
      throw error;
    }
  }
  
  /**
   * Calculate a confidence score based on the analysis results
   */
  private calculateConfidence(result: any): number {
    // Extract threat level
    const threatLevel = result.securityStatus?.threatLevel || 'none';
    
    // Map threat levels to confidence scores
    const threatLevels: {[key: string]: number} = {
      'none': 0,
      'low': 0.3,
      'medium': 0.6,
      'high': 0.8,
      'critical': 0.95,
      'unknown': 0.5
    };
    
    // Get base confidence from threat level
    let confidence = threatLevels[threatLevel] || 0;
    
    // Adjust based on steganography confidence if available
    if (result.analysis?.steganography?.confidence) {
      confidence = Math.max(confidence, result.analysis.steganography.confidence);
    }
    
    // Adjust based on YARA matches if available
    if (result.analysis?.yara?.matches?.length > 0) {
      confidence = Math.max(confidence, 0.7);
    }
    
    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Determine the threat type based on all analysis results
   */
  private determineThreatType(result: any): string | null {
    // Check for steganography
    if (result.analysis?.steganography?.hasSteganography) {
      return 'steganography';
    }
    
    // Check for suspicious metadata
    if (result.metadata?.suspicious_fields?.length > 0) {
      return 'suspicious_metadata';
    }
    
    // Check for unusual codec
    if (result.analysis?.codecAnalysis?.uncommonCodecDetected) {
      return 'uncommon_codec';
    }
    
    // Check YARA matches
    if (result.analysis?.yara?.matches?.length > 0) {
      // Get the name of the first rule
      return `yara_match:${result.analysis.yara.matches[0].rule}`;
    }
    
    // No specific threat detected
    return result.securityStatus?.threatLevel !== 'none' ? 'suspicious' : null;
  }
  
  /**
   * Determine the media type from file name and MIME type
   */
  private determineMediaType(fileName: string, mimeType?: string): string {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    
    // Check MIME type first if available
    if (mimeType) {
      if (mimeType.startsWith('audio/')) return 'audio';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('image/')) return 'image';
    }
    
    // Check extension
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'amr'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];
    
    if (audioExts.includes(ext)) return 'audio';
    if (videoExts.includes(ext)) return 'video';
    if (imageExts.includes(ext)) return 'image';
    
    return 'unknown';
  }
  
  /**
   * Generate a human-readable verdict based on scan results
   */
  private generateVerdict(result: any, isSuspicious: boolean, confidence: number, threatType: string | null): string {
    if (result.error) {
      return `Analysis failed: ${result.error}`;
    }
    
    const mediaType = result.fileType || 'media file';
    
    if (isSuspicious) {
      const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'moderate' : 'low';
      let threatText = 'suspicious content';
      
      // Customize threat description based on type
      if (threatType === 'steganography') {
        threatText = 'hidden data (steganography)';
      } else if (threatType === 'suspicious_metadata') {
        threatText = 'suspicious metadata';
      } else if (threatType === 'uncommon_codec') {
        threatText = 'uncommon codec usage';
      } else if (threatType?.startsWith('yara_match:')) {
        threatText = `potential ${threatType.split(':')[1]} pattern`;
      }
      
      return `This ${mediaType} has been identified as potentially malicious with ${confidenceText} confidence. ` +
        `It may contain ${threatText}. Exercise caution when handling this file.`;
    } else {
      return `No security threats were detected in this ${mediaType}. However, always exercise caution when ` +
        `opening files from unknown sources.`;
    }
  }
}

// Export singleton instances
export const pythonUrlAnalysisService = new PythonUrlAnalysisService();
export const pythonFileAnalysisService = new PythonFileAnalysisService();
export const pythonImageAnalysisService = new PythonImageAnalysisService();
export const pythonMediaAnalysisService = new PythonMediaAnalysisService();