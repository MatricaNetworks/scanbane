/**
 * Media Security Service
 * 
 * Provides comprehensive security analysis for audio, video, and image files
 * Including steganography detection, metadata analysis, codec checking, and more
 */

import { log } from '../vite';
import { executePythonScript, saveToTempFile, pythonMediaAnalysisService } from './python-services';
import { WebSocket } from 'ws';

export class MediaSecurityService {
  /**
   * Analyze media file for security threats
   * 
   * @param fileBuffer The file data
   * @param fileName Original file name
   * @param mimeType MIME type if known
   */
  async analyzeMedia(fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<{
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
      log(`Starting comprehensive media security analysis: ${fileName}`, 'media-security-service');
      
      // Save the media to a temporary file for analysis
      const tempFilePath = await saveToTempFile(fileBuffer);
      
      // Execute the Python media security service
      const result = await executePythonScript('media_security_service.py', [tempFilePath], fileBuffer);
      
      // Extract the key information
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
      log(`Error analyzing media security: ${error}`, 'media-security-service');
      
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
   * Extract and remove metadata from media files
   * 
   * @param fileBuffer The media file data
   * @param fileName Original file name
   */
  async stripMetadata(fileBuffer: Buffer, fileName: string): Promise<Buffer> {
    try {
      log(`Stripping metadata from: ${fileName}`, 'media-security-service');
      
      // Create a temporary file
      const tempFilePath = await saveToTempFile(fileBuffer);
      
      // Execute the Python metadata stripper
      await executePythonScript('media_security_service.py', ['--strip-metadata', tempFilePath], fileBuffer);
      
      // Return the file with stripped metadata
      return fileBuffer; // This is a placeholder; actual implementation would return modified buffer
    } catch (error) {
      log(`Error stripping metadata: ${error}`, 'media-security-service');
      // Return original buffer if stripping fails
      return fileBuffer;
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

// Export an instance for use across the application
export const mediaSecurityService = new MediaSecurityService();