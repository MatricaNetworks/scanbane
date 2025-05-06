import VirusTotal from 'virustotal-api';
import { promisify } from 'util';
import fs from 'fs';
import crypto from 'crypto';
import { log } from '../vite';

// Initialize VirusTotal client
const virusTotal = new VirusTotal(process.env.VIRUSTOTAL_API_KEY || '');

// Convert callback-based methods to Promise-based methods
const vtUrlLookup = promisify(virusTotal.urlLookup.bind(virusTotal));
const vtFileLookup = promisify(virusTotal.fileLookup.bind(virusTotal));
const vtUrlScan = promisify(virusTotal.urlScan.bind(virusTotal));
const vtFileReport = promisify(virusTotal.fileReport.bind(virusTotal));
const vtFileUpload = promisify(virusTotal.fileUpload.bind(virusTotal));

/**
 * VirusTotal service for scanning URLs and files
 */
export class VirusTotalService {
  /**
   * Scan a URL for threats using VirusTotal
   * @param url The URL to scan
   */
  async scanUrl(url: string): Promise<{
    isMalicious: boolean;
    detections: number;
    total: number;
    scanDate: string;
    threatCategories: string[];
    reportLink?: string;
  }> {
    try {
      log(`Scanning URL with VirusTotal: ${url}`, 'virus-total-service');

      // First, check if the URL has been scanned recently
      let result;
      try {
        // Try to get an existing report
        const lookupResult = await vtUrlLookup(url);
        result = lookupResult;
      } catch (lookupError) {
        // If lookup fails, submit the URL for scanning
        log(`No recent scan found for URL, submitting for scanning: ${url}`, 'virus-total-service');
        const scanResult = await vtUrlScan(url);
        // Wait a moment for the scan to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        result = await vtUrlLookup(url);
      }

      if (!result || !result.response_code) {
        throw new Error('Invalid response from VirusTotal');
      }

      // Process the result
      const detections = result.positives || 0;
      const total = result.total || 0;
      const isMalicious = detections > 0;
      const scanDate = result.scan_date || new Date().toISOString();

      // Extract threat categories
      const threatCategories: string[] = [];
      if (result.scans) {
        for (const [scannerName, scannerResult] of Object.entries<any>(result.scans)) {
          if (scannerResult.detected && scannerResult.result) {
            threatCategories.push(scannerResult.result);
          }
        }
      }

      return {
        isMalicious,
        detections,
        total,
        scanDate,
        threatCategories: [...new Set(threatCategories)], // Remove duplicates
        reportLink: `https://www.virustotal.com/gui/url/${encodeURIComponent(url)}/detection`
      };
    } catch (error) {
      log(`Error scanning URL with VirusTotal: ${error}`, 'virus-total-service');
      return {
        isMalicious: false,
        detections: 0,
        total: 0,
        scanDate: new Date().toISOString(),
        threatCategories: []
      };
    }
  }

  /**
   * Scan a file for threats using VirusTotal
   * @param fileBuffer Buffer containing the file data
   * @param fileName Name of the file
   */
  async scanFile(fileBuffer: Buffer, fileName: string): Promise<{
    isMalicious: boolean;
    detections: number;
    total: number;
    scanDate: string;
    threatCategories: string[];
    md5?: string;
    sha1?: string;
    sha256?: string;
    reportLink?: string;
  }> {
    try {
      log(`Scanning file with VirusTotal: ${fileName}`, 'virus-total-service');

      // Calculate file hashes
      const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
      const sha1 = crypto.createHash('sha1').update(fileBuffer).digest('hex');
      const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // First, check if the file has been scanned recently using its hash
      let result;
      try {
        // Try to get an existing report
        const fileReportResult = await vtFileReport(sha256);
        result = fileReportResult;
      } catch (lookupError) {
        // If lookup fails, upload the file for scanning
        log(`No recent scan found for file, uploading for scanning: ${fileName}`, 'virus-total-service');
        
        // Save the file temporarily
        const tempFilePath = `/tmp/${sha256}_${fileName}`;
        fs.writeFileSync(tempFilePath, fileBuffer);
        
        try {
          // Upload file for scanning
          const uploadResult = await vtFileUpload(tempFilePath);
          
          // Wait a moment for the scan to complete
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          // Get the report
          result = await vtFileReport(sha256);
        } finally {
          // Clean up the temporary file
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        }
      }

      if (!result || !result.response_code) {
        throw new Error('Invalid response from VirusTotal');
      }

      // Process the result
      const detections = result.positives || 0;
      const total = result.total || 0;
      const isMalicious = detections > 0;
      const scanDate = result.scan_date || new Date().toISOString();

      // Extract threat categories
      const threatCategories: string[] = [];
      if (result.scans) {
        for (const [scannerName, scannerResult] of Object.entries<any>(result.scans)) {
          if (scannerResult.detected && scannerResult.result) {
            threatCategories.push(scannerResult.result);
          }
        }
      }

      return {
        isMalicious,
        detections,
        total,
        scanDate,
        threatCategories: [...new Set(threatCategories)], // Remove duplicates
        md5,
        sha1,
        sha256,
        reportLink: `https://www.virustotal.com/gui/file/${sha256}/detection`
      };
    } catch (error) {
      log(`Error scanning file with VirusTotal: ${error}`, 'virus-total-service');
      return {
        isMalicious: false,
        detections: 0,
        total: 0,
        scanDate: new Date().toISOString(),
        threatCategories: []
      };
    }
  }
}

// Export an instance for use across the application
export const virusTotalService = new VirusTotalService();