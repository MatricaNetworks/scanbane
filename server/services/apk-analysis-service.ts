import { fileAnalysisService } from './file-analysis-service';
import { aiService } from './ai-service';
import { log } from '../vite';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const execPromise = promisify(exec);

/**
 * Service for analyzing Android APK packages
 */
export class ApkAnalysisService {
  /**
   * Performs a comprehensive analysis of an APK file
   * @param fileBuffer APK file data buffer
   * @param fileName Original file name
   */
  async analyzeApk(fileBuffer: Buffer, fileName: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    scanResults: {
      basicAnalysis?: any;
      permissions?: string[];
      components?: any;
      metadata?: any;
      ai?: any;
    };
    finalVerdict: string;
  }> {
    try {
      log(`Starting APK analysis: ${fileName}`, 'apk-analysis-service');
      
      if (!fileName.toLowerCase().endsWith('.apk')) {
        throw new Error('Not an APK file');
      }
      
      // First, run the file through the standard file analysis
      const basicAnalysis = await fileAnalysisService.analyzeFile(fileBuffer, fileName);
      
      // Save APK to temporary file for apktool analysis
      const tempFilePath = await this.saveTempFile(fileBuffer, fileName);
      
      try {
        // Extract APK information
        const [permissions, components, metadata] = await Promise.allSettled([
          this.extractPermissions(tempFilePath),
          this.extractComponents(tempFilePath),
          this.extractMetadata(tempFilePath)
        ]);
        
        // Analyze APK specific content with AI
        const permissionsData = permissions.status === 'fulfilled' ? permissions.value : [];
        const componentsData = components.status === 'fulfilled' ? components.value : {};
        const metadataData = metadata.status === 'fulfilled' ? metadata.value : {};
        
        // Use AI to assess the permissions and components
        const aiAnalysis = await this.analyzeApkDataWithAI(permissionsData, componentsData, metadataData);
        
        // Compile all results
        const scanResults: any = {
          basicAnalysis: basicAnalysis.scanResults,
          permissions: permissionsData,
          components: componentsData,
          metadata: metadataData,
          ai: aiAnalysis
        };
        
        // Calculate final verdict
        const isMalicious = this.determineIfMalicious(scanResults, basicAnalysis.isMalicious);
        const confidence = this.calculateConfidence(scanResults, basicAnalysis.confidence);
        const threatType = this.determineThreatType(scanResults, basicAnalysis.threatType);
        const finalVerdict = this.generateVerdict(scanResults, isMalicious, confidence, threatType);
        
        return {
          isMalicious,
          confidence,
          threatType,
          scanResults,
          finalVerdict
        };
      } finally {
        // Clean up temporary files
        await this.cleanupTempFile(tempFilePath);
      }
    } catch (error) {
      log(`Error in APK analysis: ${error}`, 'apk-analysis-service');
      
      // Fallback to basic file analysis
      try {
        const basicAnalysis = await fileAnalysisService.analyzeFile(fileBuffer, fileName);
        return {
          isMalicious: basicAnalysis.isMalicious,
          confidence: basicAnalysis.confidence,
          threatType: basicAnalysis.threatType,
          scanResults: {
            basicAnalysis: basicAnalysis.scanResults,
            error: 'APK-specific analysis failed'
          },
          finalVerdict: 'APK-specific analysis failed. ' + basicAnalysis.finalVerdict
        };
      } catch (fallbackError) {
        return {
          isMalicious: false,
          confidence: 0,
          threatType: null,
          scanResults: {
            error: 'Analysis failed completely'
          },
          finalVerdict: 'Analysis failed due to an error'
        };
      }
    }
  }
  
  /**
   * Saves APK to temporary location for analysis
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
      log(`Error cleaning up temp file: ${error}`, 'apk-analysis-service');
    }
  }
  
  /**
   * Extracts permissions from an APK file
   */
  private async extractPermissions(apkPath: string): Promise<string[]> {
    try {
      const decodePath = '/tmp/apk_decoded_' + path.basename(apkPath, '.apk');
      
      // Use apktool to decode APK
      await execPromise(`apktool d -f ${apkPath} -o ${decodePath}`);
      
      // Attempt to read the AndroidManifest.xml file
      const manifestPath = path.join(decodePath, 'AndroidManifest.xml');
      const manifest = await fs.readFile(manifestPath, 'utf-8');
      
      // Extract permissions using regex
      const permissionRegex = /uses-permission.*?android:name="([^"]+)"/g;
      const permissions: string[] = [];
      let match;
      
      while ((match = permissionRegex.exec(manifest)) !== null) {
        permissions.push(match[1]);
      }
      
      // Clean up decoded directory
      await execPromise(`rm -rf ${decodePath}`);
      
      return permissions;
    } catch (error) {
      log(`Error extracting APK permissions: ${error}`, 'apk-analysis-service');
      
      // Fallback: try using aapt if available
      try {
        const { stdout } = await execPromise(`aapt dump permissions ${apkPath}`);
        const lines = stdout.split('\n');
        const permissions = lines
          .filter(line => line.trim().startsWith('uses-permission:'))
          .map(line => line.split("'")[1]);
        
        return permissions;
      } catch (aaptError) {
        log(`Error using aapt fallback: ${aaptError}`, 'apk-analysis-service');
        return [];
      }
    }
  }
  
  /**
   * Extracts components (activities, services, receivers) from an APK file
   */
  private async extractComponents(apkPath: string): Promise<any> {
    try {
      const decodePath = '/tmp/apk_decoded_' + path.basename(apkPath, '.apk');
      
      // Use apktool to decode APK
      await execPromise(`apktool d -f ${apkPath} -o ${decodePath}`);
      
      // Attempt to read the AndroidManifest.xml file
      const manifestPath = path.join(decodePath, 'AndroidManifest.xml');
      const manifest = await fs.readFile(manifestPath, 'utf-8');
      
      // Extract components using regex
      const components = {
        activities: this.extractComponentsByType(manifest, 'activity'),
        services: this.extractComponentsByType(manifest, 'service'),
        receivers: this.extractComponentsByType(manifest, 'receiver'),
        providers: this.extractComponentsByType(manifest, 'provider')
      };
      
      // Clean up decoded directory
      await execPromise(`rm -rf ${decodePath}`);
      
      return components;
    } catch (error) {
      log(`Error extracting APK components: ${error}`, 'apk-analysis-service');
      return {
        activities: [],
        services: [],
        receivers: [],
        providers: []
      };
    }
  }
  
  /**
   * Helper function to extract components by type from manifest
   */
  private extractComponentsByType(manifest: string, componentType: string): string[] {
    const regex = new RegExp(`<${componentType}[^>]*?android:name="([^"]+)"`, 'g');
    const components: string[] = [];
    let match;
    
    while ((match = regex.exec(manifest)) !== null) {
      components.push(match[1]);
    }
    
    return components;
  }
  
  /**
   * Extracts metadata from an APK file
   */
  private async extractMetadata(apkPath: string): Promise<any> {
    try {
      // Try to use aapt to get basic metadata
      const { stdout } = await execPromise(`aapt dump badging ${apkPath}`);
      const lines = stdout.split('\n');
      
      const metadata: any = {};
      
      // Extract package name, version, etc.
      const packageLine = lines.find(line => line.startsWith('package:'));
      if (packageLine) {
        const nameMatch = packageLine.match(/name='([^']+)'/);
        const versionCodeMatch = packageLine.match(/versionCode='([^']+)'/);
        const versionNameMatch = packageLine.match(/versionName='([^']+)'/);
        
        if (nameMatch) metadata.packageName = nameMatch[1];
        if (versionCodeMatch) metadata.versionCode = versionCodeMatch[1];
        if (versionNameMatch) metadata.versionName = versionNameMatch[1];
      }
      
      // Extract application label
      const applicationLine = lines.find(line => line.startsWith('application:'));
      if (applicationLine) {
        const labelMatch = applicationLine.match(/label='([^']+)'/);
        if (labelMatch) metadata.appName = labelMatch[1];
      }
      
      // Extract SDK version info
      const sdkLine = lines.find(line => line.startsWith('sdkVersion:'));
      if (sdkLine) {
        const sdkMatch = sdkLine.match(/sdkVersion:'([^']+)'/);
        if (sdkMatch) metadata.sdkVersion = sdkMatch[1];
      }
      
      // Extract target SDK
      const targetSdkLine = lines.find(line => line.startsWith('targetSdkVersion:'));
      if (targetSdkLine) {
        const targetSdkMatch = targetSdkLine.match(/targetSdkVersion:'([^']+)'/);
        if (targetSdkMatch) metadata.targetSdkVersion = targetSdkMatch[1];
      }
      
      return metadata;
    } catch (error) {
      log(`Error extracting APK metadata: ${error}`, 'apk-analysis-service');
      return {};
    }
  }
  
  /**
   * Analyzes APK data with AI to detect suspicious patterns
   */
  private async analyzeApkDataWithAI(
    permissions: string[],
    components: any,
    metadata: any
  ): Promise<{
    isSuspicious: boolean;
    suspiciousPermissions: string[];
    suspiciousComponents: string[];
    explanation: string;
    confidence: number;
  }> {
    try {
      // Prepare APK data for AI analysis
      const apkData = {
        permissions,
        activities: components.activities || [],
        services: components.services || [],
        receivers: components.receivers || [],
        providers: components.providers || [],
        metadata
      };
      
      log(`Analyzing APK data with AI`, 'apk-analysis-service');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a mobile security expert specializing in Android APK analysis. " +
              "Analyze the provided APK data (permissions, components, metadata) for security risks. " +
              "Look for suspicious permission combinations, potentially dangerous components, and other security red flags."
          },
          {
            role: "user",
            content: `Analyze this APK data for security issues:\n\n${JSON.stringify(apkData)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        isSuspicious: result.isSuspicious || false,
        suspiciousPermissions: result.suspiciousPermissions || [],
        suspiciousComponents: result.suspiciousComponents || [],
        explanation: result.explanation || "No explanation provided",
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      log(`Error analyzing APK data with AI: ${error}`, 'apk-analysis-service');
      
      // Fallback: perform basic permission analysis
      const suspiciousPermissions = this.identifySuspiciousPermissions(permissions);
      
      return {
        isSuspicious: suspiciousPermissions.length > 0,
        suspiciousPermissions,
        suspiciousComponents: [],
        explanation: 'AI analysis failed. Found potentially suspicious permissions.',
        confidence: 0.5
      };
    }
  }
  
  /**
   * Internal method to analyze APK data with AI
   */
  private async analyzeApkDataInternal(apkData: string): Promise<{
    isSuspicious: boolean;
    suspiciousPermissions: string[];
    suspiciousComponents: string[];
    explanation: string;
    confidence: number;
  }> {
    try {
      log(`Analyzing APK data with AI internally`, 'apk-analysis-service');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a mobile security expert specializing in Android APK analysis. " +
              "Analyze the provided APK data (permissions, components, metadata) for security risks. " +
              "Look for suspicious permission combinations, potentially dangerous components, and other security red flags."
          },
          {
            role: "user",
            content: `Analyze this APK data for security issues:\n\n${apkData}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        isSuspicious: result.isSuspicious || false,
        suspiciousPermissions: result.suspiciousPermissions || [],
        suspiciousComponents: result.suspiciousComponents || [],
        explanation: result.explanation || "No explanation provided",
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      log(`Error analyzing APK data with AI internally: ${error}`, 'apk-analysis-service');
      return {
        isSuspicious: false,
        suspiciousPermissions: [],
        suspiciousComponents: [],
        explanation: "Unable to analyze APK data due to an error",
        confidence: 0.5
      };
    }
  }
  
  /**
   * Basic analysis of suspicious permissions
   */
  private identifySuspiciousPermissions(permissions: string[]): string[] {
    const highRiskPermissions = [
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.PROCESS_OUTGOING_CALLS',
      'android.permission.CALL_PHONE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.READ_CALL_LOG',
      'android.permission.RECORD_AUDIO',
      'android.permission.CAMERA',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.READ_CONTACTS',
      'android.permission.GET_ACCOUNTS',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.PACKAGE_USAGE_STATS',
      'android.permission.WRITE_SETTINGS',
      'android.permission.RECEIVE_BOOT_COMPLETED'
    ];
    
    return permissions.filter(permission => highRiskPermissions.includes(permission));
  }
  
  /**
   * Determines if an APK is malicious based on all scan results
   */
  private determineIfMalicious(scanResults: any, basicMalicious: boolean): boolean {
    // If basic file analysis already flagged it as malicious
    if (basicMalicious) return true;
    
    // Check AI analysis of APK data
    if (scanResults.ai?.isSuspicious && scanResults.ai?.confidence > 0.7) {
      return true;
    }
    
    // Check for suspicious permissions pattern
    const suspiciousPermCount = scanResults.ai?.suspiciousPermissions?.length || 0;
    if (suspiciousPermCount >= 3) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Calculates the confidence level of the verdict
   */
  private calculateConfidence(scanResults: any, basicConfidence: number): number {
    // Start with basic file analysis confidence
    let confidence = basicConfidence;
    
    // Add AI analysis confidence if available
    if (scanResults.ai?.confidence) {
      confidence = (confidence + scanResults.ai.confidence) / 2;
    }
    
    // Adjust based on number of suspicious permissions
    const suspiciousPermCount = scanResults.ai?.suspiciousPermissions?.length || 0;
    if (suspiciousPermCount > 0) {
      const permConfidence = Math.min(0.9, 0.5 + (suspiciousPermCount * 0.1));
      confidence = (confidence + permConfidence) / 2;
    }
    
    return confidence;
  }
  
  /**
   * Determines the threat type based on all scan results
   */
  private determineThreatType(scanResults: any, basicThreatType: string | null): string | null {
    // If basic analysis found a threat type, use it
    if (basicThreatType) return basicThreatType;
    
    // Determine threat type based on suspicious permissions and components
    const suspiciousPerms = scanResults.ai?.suspiciousPermissions || [];
    
    if (suspiciousPerms.some(p => p.includes('SMS') || p.includes('CALL'))) {
      return 'premium_service_abuser';
    }
    
    if (suspiciousPerms.some(p => p.includes('LOCATION'))) {
      return 'spyware';
    }
    
    if (suspiciousPerms.some(p => p.includes('CAMERA') || p.includes('RECORD_AUDIO'))) {
      return 'surveillance';
    }
    
    if (suspiciousPerms.some(p => p.includes('EXTERNAL_STORAGE'))) {
      return 'data_stealer';
    }
    
    if (scanResults.ai?.isSuspicious) {
      return 'suspicious_app';
    }
    
    return null;
  }
  
  /**
   * Generates a human-readable verdict based on scan results
   */
  private generateVerdict(scanResults: any, isMalicious: boolean, confidence: number, threatType: string | null): string {
    if (isMalicious) {
      const confidenceText = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'moderate' : 'low';
      let threatText: string;
      
      switch (threatType) {
        case 'premium_service_abuser':
          threatText = 'premium service fraud capabilities';
          break;
        case 'spyware':
          threatText = 'spyware capabilities that may track your location';
          break;
        case 'surveillance':
          threatText = 'surveillance capabilities that may access your camera or microphone';
          break;
        case 'data_stealer':
          threatText = 'capabilities to access and potentially steal your personal data';
          break;
        default:
          threatText = 'potentially harmful capabilities';
      }
      
      // Add suspicious permission information if available
      let permissionsInfo = '';
      const suspiciousPerms = scanResults.ai?.suspiciousPermissions || [];
      if (suspiciousPerms.length > 0) {
        permissionsInfo = ` The app requests ${suspiciousPerms.length} potentially dangerous permissions.`;
      }
      
      return `This APK has been identified as potentially malicious with ${confidenceText} confidence. ` +
            `It may contain ${threatText}.${permissionsInfo} We recommend not installing this application.`;
    } else {
      return 'This APK appears to be safe based on our analysis. However, always exercise caution when installing applications from unknown sources.';
    }
  }
}

// Extend aiService with APK analysis method
declare module './ai-service' {
  interface AIService {
    analyzeApkData(apkData: string): Promise<{
      isSuspicious: boolean;
      suspiciousPermissions: string[];
      suspiciousComponents: string[];
      explanation: string;
      confidence: number;
    }>;
  }
}

// Implement APK analysis method
aiService.analyzeApkData = async function(apkData: string): Promise<{
  isSuspicious: boolean;
  suspiciousPermissions: string[];
  suspiciousComponents: string[];
  explanation: string;
  confidence: number;
}> {
  try {
    log(`Analyzing APK data with AI`, 'ai-service');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a mobile security expert specializing in Android APK analysis. " +
            "Analyze the provided APK data (permissions, components, metadata) for security risks. " +
            "Look for suspicious permission combinations, potentially dangerous components, and other security red flags."
        },
        {
          role: "user",
          content: `Analyze this APK data for security issues:\n\n${apkData}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      isSuspicious: result.isSuspicious || false,
      suspiciousPermissions: result.suspiciousPermissions || [],
      suspiciousComponents: result.suspiciousComponents || [],
      explanation: result.explanation || "No explanation provided",
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    log(`Error analyzing APK data with AI: ${error}`, 'ai-service');
    return {
      isSuspicious: false,
      suspiciousPermissions: [],
      suspiciousComponents: [],
      explanation: "Unable to analyze APK data due to an error",
      confidence: 0.5
    };
  }
};

// Export an instance for use across the application
export const apkAnalysisService = new ApkAnalysisService();