import { aiService } from './ai-service';
import { log } from '../vite';
import { FileTypeResult, fileTypeFromBuffer } from 'file-type';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { virusTotalService } from './virus-total-service';

/**
 * Service for image analysis and steganography detection
 */
export class ImageAnalysisService {
  /**
   * Performs a comprehensive analysis of an image
   * @param imageBuffer Image data buffer
   * @param fileName Original file name
   */
  async analyzeImage(imageBuffer: Buffer, fileName: string): Promise<{
    isSuspicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      virusTotal?: any;
      ai?: any;
      steganography?: any;
      metadata: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Starting comprehensive image analysis: ${fileName}`, 'image-analysis-service');
      
      // Get image metadata
      const metadata = await this.getImageMetadata(imageBuffer, fileName);
      log(`Image metadata: ${JSON.stringify(metadata)}`, 'image-analysis-service');
      
      // Save image temporarily for analysis
      const tempFilePath = await this.saveTempFile(imageBuffer, fileName);
      
      try {
        // Run parallel scans
        const [virusTotalResult, aiResult, steganographyResult] = await Promise.allSettled([
          virusTotalService.scanFile(imageBuffer, fileName),
          aiService.analyzeImage(imageBuffer, fileName),
          this.detectSteganography(imageBuffer, tempFilePath)
        ]);
        
        // Compile all results
        const scanResults: any = {
          virusTotal: virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : null,
          ai: aiResult.status === 'fulfilled' ? aiResult.value : null,
          steganography: steganographyResult.status === 'fulfilled' ? steganographyResult.value : null,
          metadata
        };
        
        // Calculate final verdict
        const isSuspicious = this.determineIfSuspicious(scanResults);
        const confidence = this.calculateConfidence(scanResults);
        const threatType = this.determineThreatType(scanResults);
        const finalVerdict = this.generateVerdict(scanResults, isSuspicious, confidence, threatType);
        
        return {
          isSuspicious,
          confidence,
          threatType,
          scanResults,
          finalVerdict
        };
      } finally {
        // Clean up temporary file
        await this.cleanupTempFile(tempFilePath);
      }
    } catch (error) {
      log(`Error in comprehensive image analysis: ${error}`, 'image-analysis-service');
      return {
        isSuspicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {
          metadata: {
            fileName,
            error: 'Analysis failed'
          }
        },
        finalVerdict: 'Analysis failed due to an error'
      };
    }
  }
  
  /**
   * Extracts image metadata
   */
  private async getImageMetadata(imageBuffer: Buffer, fileName: string): Promise<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    extension: string;
    width?: number;
    height?: number;
    md5: string;
    sha1: string;
    sha256: string;
  }> {
    // Calculate file hashes
    const md5 = crypto.createHash('md5').update(imageBuffer).digest('hex');
    const sha1 = crypto.createHash('sha1').update(imageBuffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(imageBuffer).digest('hex');
    
    // Get file extension
    const extension = path.extname(fileName).toLowerCase();
    
    // Detect file type
    let detectedFileType: FileTypeResult | undefined;
    try {
      detectedFileType = await fileTypeFromBuffer(imageBuffer);
    } catch (error) {
      log(`Error detecting image type: ${error}`, 'image-analysis-service');
    }
    
    // Use detected mime type or fall back to generic image type
    const mimeType = detectedFileType?.mime || 'image/unknown';
    
    // TODO: Add image dimension detection (would require image processing library)
    
    return {
      fileName,
      fileSize: imageBuffer.length,
      mimeType,
      extension,
      md5,
      sha1,
      sha256
    };
  }
  
  /**
   * Saves image to temporary location for analysis
   */
  private async saveTempFile(imageBuffer: Buffer, fileName: string): Promise<string> {
    // Create a unique file name to avoid collisions
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex').substring(0, 16);
    const tempFilePath = `/tmp/${hash}_${path.basename(fileName)}`;
    
    await fs.writeFile(tempFilePath, imageBuffer);
    return tempFilePath;
  }
  
  /**
   * Cleans up temporary file
   */
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      log(`Error cleaning up temp file: ${error}`, 'image-analysis-service');
    }
  }
  
  /**
   * Attempts to detect steganography in an image using statistical methods
   */
  private async detectSteganography(imageBuffer: Buffer, filePath: string): Promise<{
    hasSteganography: boolean;
    extractedData?: string;
    confidence: number;
    detectionMethod: string;
  }> {
    try {
      log(`Checking for steganography using statistical methods: ${filePath}`, 'image-analysis-service');
      
      // First method: Statistical analysis of entropy
      const hasSuspiciousEntropy = this.checkImageEntropy(imageBuffer);
      
      if (hasSuspiciousEntropy) {
        return {
          hasSteganography: true,
          confidence: 0.7,
          detectionMethod: 'entropy_analysis'
        };
      }
      
      // Second method: Look for metadata inconsistencies
      const hasMetadataAnomalies = this.checkMetadataAnomalies(imageBuffer);
      
      if (hasMetadataAnomalies) {
        return {
          hasSteganography: true,
          confidence: 0.6,
          detectionMethod: 'metadata_analysis'
        };
      }
      
      // Third method: Check for unusual patterns in least significant bits
      const hasLSBAnomalies = this.checkLSBAnomalies(imageBuffer);
      
      if (hasLSBAnomalies) {
        return {
          hasSteganography: true,
          confidence: 0.65,
          detectionMethod: 'lsb_analysis'
        };
      }
      
      return {
        hasSteganography: false,
        confidence: 0.8,
        detectionMethod: 'multi_method_scan'
      };
    } catch (error) {
      log(`Error detecting steganography: ${error}`, 'image-analysis-service');
      return {
        hasSteganography: false,
        confidence: 0.5,
        detectionMethod: 'failed'
      };
    }
  }
  
  /**
   * Simplified entropy check (in real-world scenarios, use proper statistical analysis)
   */
  private checkImageEntropy(imageBuffer: Buffer): boolean {
    // This is a simplified example - real steganography detection would use proper entropy calculations
    // Calculate a simplified entropy
    const frequencies = new Array(256).fill(0);
    
    // Count frequencies of each byte value
    for (let i = 0; i < imageBuffer.length; i++) {
      frequencies[imageBuffer[i]]++;
    }
    
    // Convert frequencies to probabilities
    const probabilities = frequencies.map(freq => freq / imageBuffer.length);
    
    // Calculate simplified entropy
    let entropy = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > 0) {
        entropy -= probabilities[i] * Math.log2(probabilities[i]);
      }
    }
    
    // Check for abnormal entropy values (would need proper calibration in real-world)
    // This is just a placeholder check
    return entropy > 7.9 && entropy < 8.0;
  }
  
  /**
   * Check for metadata anomalies (placeholder implementation)
   */
  private checkMetadataAnomalies(imageBuffer: Buffer): boolean {
    // In a real implementation, this would check for:
    // - Unusual EXIF data
    // - Inconsistent dimensions
    // - Color palette anomalies
    // - Etc.
    
    // This is a placeholder implementation - just looking for unusual patterns at file end
    const endBytes = imageBuffer.slice(imageBuffer.length - 50);
    
    // Look for patterns that might suggest appended data
    return endBytes.includes(0xFF) && endBytes.includes(0xD9) && 
           endBytes.indexOf(0xFF) !== endBytes.lastIndexOf(0xFF);
  }
  
  /**
   * Check for LSB (Least Significant Bit) anomalies
   * This is a simplified implementation of LSB steganography detection
   */
  private checkLSBAnomalies(imageBuffer: Buffer): boolean {
    // Take a sample of the image for analysis (for performance)
    const sampleSize = Math.min(10000, imageBuffer.length);
    const step = Math.floor(imageBuffer.length / sampleSize);
    
    // Count consecutive LSBs
    let consecutiveZeros = 0;
    let consecutiveOnes = 0;
    let maxConsecutiveZeros = 0;
    let maxConsecutiveOnes = 0;
    
    // Check LSB patterns in the sample
    for (let i = 0; i < imageBuffer.length; i += step) {
      const lsb = imageBuffer[i] & 1; // Get least significant bit
      
      if (lsb === 0) {
        consecutiveZeros++;
        consecutiveOnes = 0;
      } else {
        consecutiveOnes++;
        consecutiveZeros = 0;
      }
      
      maxConsecutiveZeros = Math.max(maxConsecutiveZeros, consecutiveZeros);
      maxConsecutiveOnes = Math.max(maxConsecutiveOnes, consecutiveOnes);
    }
    
    // In natural images, we expect some randomness in LSBs
    // Very long runs of identical LSBs may suggest manipulation
    return maxConsecutiveZeros > 20 || maxConsecutiveOnes > 20;
  }
  
  /**
   * Determines if an image is suspicious based on all scan results
   */
  private determineIfSuspicious(scanResults: any): boolean {
    // Check if VirusTotal found anything
    if (scanResults.virusTotal?.isMalicious) {
      return true;
    }
    
    // Check AI analysis
    if (scanResults.ai?.isSuspicious && scanResults.ai?.confidence > 0.6) {
      return true;
    }
    
    // Check steganography detection
    if (scanResults.steganography?.hasSteganography && scanResults.steganography?.confidence > 0.6) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculates the confidence level of the verdict
   */
  private calculateConfidence(scanResults: any): number {
    let confidence = 0;
    let factorCount = 0;
    
    // VirusTotal results
    if (scanResults.virusTotal) {
      if (scanResults.virusTotal.total > 0) {
        confidence += (scanResults.virusTotal.detections / scanResults.virusTotal.total) * 0.7;
      } else {
        confidence += scanResults.virusTotal.isMalicious ? 0.7 : 0.3;
      }
      factorCount++;
    }
    
    // AI analysis
    if (scanResults.ai) {
      confidence += scanResults.ai.confidence || 0.5;
      factorCount++;
    }
    
    // Steganography detection
    if (scanResults.steganography) {
      confidence += scanResults.steganography.confidence || 0.5;
      factorCount++;
    }
    
    // Calculate average confidence
    return factorCount > 0 ? confidence / factorCount : 0.5;
  }
  
  /**
   * Determines the threat type based on all scan results
   */
  private determineThreatType(scanResults: any): string | null {
    // If steganography is detected, that's the primary threat
    if (scanResults.steganography?.hasSteganography) {
      return 'steganography';
    }
    
    // Check VirusTotal for more specific threats
    if (scanResults.virusTotal?.threatCategories?.length > 0) {
      return scanResults.virusTotal.threatCategories[0];
    }
    
    // Check AI threat type
    if (scanResults.ai?.threatType) {
      return scanResults.ai.threatType;
    }
    
    // If suspicious but no specific threat type
    if (this.determineIfSuspicious(scanResults)) {
      return 'suspicious_image';
    }
    
    return null;
  }
  
  /**
   * Generates a human-readable verdict based on scan results
   */
  private generateVerdict(scanResults: any, isSuspicious: boolean, confidence: number, threatType: string | null): string {
    if (isSuspicious) {
      const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'moderate' : 'low';
      let threatText: string;
      
      switch (threatType) {
        case 'steganography':
          threatText = 'hidden data potentially concealing malicious content';
          break;
        case 'manipulation':
          threatText = 'signs of digital manipulation that may indicate deception';
          break;
        default:
          threatText = 'suspicious elements';
      }
      
      // Add extracted data info if available
      let extractedInfo = '';
      if (scanResults.steganography?.extractedData) {
        extractedInfo = ' Our analysis detected hidden content within the image.';
      }
      
      return `This image has been identified as potentially suspicious with ${confidenceText} confidence. ` +
            `It may contain ${threatText}.${extractedInfo} We recommend caution when sharing or opening this image.`;
    } else {
      return 'This image appears to be safe based on our analysis. No hidden content or suspicious elements were detected.';
    }
  }
}

// Export an instance for use across the application
export const imageAnalysisService = new ImageAnalysisService();