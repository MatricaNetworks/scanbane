import { aiService } from './ai-service';
import { virusTotalService } from './virus-total-service';
import { log } from '../vite';
import { FileTypeResult, fileTypeFromBuffer } from 'file-type';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Service for comprehensive file analysis
 */
export class FileAnalysisService {
  /**
   * Performs a comprehensive analysis of a file using multiple services
   * @param fileBuffer The file data buffer
   * @param fileName Original file name
   * @param mimeType MIME type of the file (if known)
   */
  async analyzeFile(fileBuffer: Buffer, fileName: string, mimeType?: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      virusTotal?: any;
      ai?: any;
      fileMetadata: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Starting comprehensive file analysis: ${fileName}`, 'file-analysis-service');
      
      // Get file metadata
      const fileMetadata = await this.getFileMetadata(fileBuffer, fileName, mimeType);
      log(`File metadata: ${JSON.stringify(fileMetadata)}`, 'file-analysis-service');
      
      // Save file temporarily for analysis
      const tempFilePath = await this.saveTempFile(fileBuffer, fileName);
      
      try {
        // Run parallel scans
        const [virusTotalResult, aiResult] = await Promise.allSettled([
          virusTotalService.scanFile(fileBuffer, fileName),
          aiService.analyzeFile(fileBuffer, fileName, fileMetadata.mimeType || 'application/octet-stream')
        ]);
        
        // Compile all results
        const scanResults: any = {
          virusTotal: virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : null,
          ai: aiResult.status === 'fulfilled' ? aiResult.value : null,
          fileMetadata
        };
        
        // Calculate final verdict
        const isMalicious = this.determineIfMalicious(scanResults);
        const confidence = this.calculateConfidence(scanResults);
        const threatType = this.determineThreatType(scanResults);
        const finalVerdict = this.generateVerdict(scanResults, isMalicious, confidence, threatType);
        
        return {
          isMalicious,
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
      log(`Error in comprehensive file analysis: ${error}`, 'file-analysis-service');
      return {
        isMalicious: false,
        confidence: 0,
        threatType: null,
        scanResults: {
          fileMetadata: {
            fileName,
            error: 'Analysis failed'
          }
        },
        finalVerdict: 'Analysis failed due to an error'
      };
    }
  }
  
  /**
   * Extracts file metadata
   */
  private async getFileMetadata(fileBuffer: Buffer, fileName: string, providedMimeType?: string): Promise<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    extension: string;
    fileType?: string;
    md5: string;
    sha1: string;
    sha256: string;
  }> {
    // Calculate file hashes
    const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
    const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Get file extension
    const extension = path.extname(fileName).toLowerCase();
    
    // Detect file type
    let detectedFileType: FileTypeResult | undefined;
    try {
      detectedFileType = await fileTypeFromBuffer(fileBuffer);
    } catch (error) {
      log(`Error detecting file type: ${error}`, 'file-analysis-service');
    }
    
    // Use detected mime type or fall back to provided one
    const mimeType = detectedFileType?.mime || providedMimeType || 'application/octet-stream';
    
    // Determine file type category
    let fileType = 'unknown';
    if (mimeType.startsWith('image/')) fileType = 'image';
    else if (mimeType.startsWith('text/')) fileType = 'text';
    else if (mimeType.startsWith('application/pdf')) fileType = 'pdf';
    else if (mimeType.includes('zip') || mimeType.includes('compressed')) fileType = 'archive';
    else if (mimeType.includes('msdownload') || extension === '.exe') fileType = 'executable';
    else if (extension === '.apk') fileType = 'apk';
    else if (extension === '.dll') fileType = 'dll';
    else if (extension === '.bat' || extension === '.cmd' || extension === '.ps1') fileType = 'script';
    
    return {
      fileName,
      fileSize: fileBuffer.length,
      mimeType,
      extension,
      fileType,
      md5,
      sha1,
      sha256
    };
  }
  
  /**
   * Saves file to temporary location for analysis
   */
  private async saveTempFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    // Create a unique file name to avoid collisions
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex').substring(0, 16);
    const tempFilePath = `/tmp/${hash}_${path.basename(fileName)}`;
    
    await fs.writeFile(tempFilePath, fileBuffer);
    return tempFilePath;
  }
  
  /**
   * Cleans up temporary file
   */
  private async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      log(`Error cleaning up temp file: ${error}`, 'file-analysis-service');
    }
  }
  
  /**
   * Determines if a file is malicious based on all scan results
   */
  private determineIfMalicious(scanResults: any): boolean {
    // Files are considered malicious if VirusTotal detects it or AI analysis strongly suggests it
    const virusTotalMalicious = scanResults.virusTotal?.isMalicious;
    const aiMalicious = scanResults.ai?.isMalicious && scanResults.ai?.confidence > 0.7;
    
    // Executable files that are flagged as suspicious are treated with higher sensitivity
    const isHighRiskFileType = 
      scanResults.fileMetadata?.fileType === 'executable' || 
      scanResults.fileMetadata?.fileType === 'script' ||
      scanResults.fileMetadata?.fileType === 'apk';
    
    // If it's a high-risk file type, we require less confidence to mark it as malicious
    if (isHighRiskFileType) {
      return virusTotalMalicious || aiMalicious || 
             (scanResults.ai?.isMalicious && scanResults.ai?.confidence > 0.5);
    }
    
    return virusTotalMalicious || aiMalicious;
  }
  
  /**
   * Calculates the confidence level of the verdict
   */
  private calculateConfidence(scanResults: any): number {
    let confidence = 0;
    let factorCount = 0;
    
    // VirusTotal results (weighted heavily)
    if (scanResults.virusTotal) {
      if (scanResults.virusTotal.total > 0) {
        confidence += (scanResults.virusTotal.detections / scanResults.virusTotal.total) * 0.9;
      } else {
        confidence += scanResults.virusTotal.isMalicious ? 0.8 : 0.2;
      }
      factorCount++;
    }
    
    // AI results
    if (scanResults.ai) {
      confidence += scanResults.ai.confidence || 0.5;
      factorCount++;
    }
    
    // File type risk adjustment
    const fileType = scanResults.fileMetadata?.fileType;
    if (fileType) {
      let riskFactor = 0.5; // Default
      
      // Adjust risk factor based on file type
      if (fileType === 'executable') riskFactor = 0.7;
      else if (fileType === 'script') riskFactor = 0.65;
      else if (fileType === 'apk') riskFactor = 0.6;
      else if (fileType === 'archive') riskFactor = 0.55;
      else if (fileType === 'text' || fileType === 'image') riskFactor = 0.3;
      
      confidence += riskFactor;
      factorCount++;
    }
    
    // Calculate average confidence
    return factorCount > 0 ? confidence / factorCount : 0.5;
  }
  
  /**
   * Determines the threat type based on all scan results
   */
  private determineThreatType(scanResults: any): string | null {
    // Prioritize VirusTotal threat types
    if (scanResults.virusTotal?.threatCategories?.length > 0) {
      return scanResults.virusTotal.threatCategories[0];
    }
    
    // Check AI analysis
    if (scanResults.ai?.threatType) {
      return scanResults.ai.threatType;
    }
    
    // Based on file type
    const fileType = scanResults.fileMetadata?.fileType;
    if (this.determineIfMalicious(scanResults)) {
      if (fileType === 'executable') return 'malware';
      if (fileType === 'script') return 'malicious_script';
      if (fileType === 'apk') return 'malicious_apk';
      return 'suspicious';
    }
    
    return null;
  }
  
  /**
   * Generates a human-readable verdict based on scan results
   */
  private generateVerdict(scanResults: any, isMalicious: boolean, confidence: number, threatType: string | null): string {
    if (isMalicious) {
      const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'moderate' : 'low';
      const threatText = threatType ? threatType.toLowerCase().replace('_', ' ') : 'suspicious content';
      
      return `This file has been identified as potentially malicious with ${confidenceText} confidence. ` +
            `It may contain ${threatText}. We recommend not opening or executing this file.`;
    } else {
      return 'This file appears to be safe based on our analysis. However, always exercise caution when opening files from unknown sources.';
    }
  }
}

// Export an instance for use across the application
export const fileAnalysisService = new FileAnalysisService();