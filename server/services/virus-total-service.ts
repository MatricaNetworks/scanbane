import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import { log } from '../vite';

// Use axios for direct API calls instead of the virustotal-api library
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const VT_API_URL = 'https://www.virustotal.com/api/v3';

// Helper function for making VirusTotal API requests
async function vtRequest(endpoint: string, method = 'GET', data?: any) {
  try {
    const response = await axios({
      url: `${VT_API_URL}${endpoint}`,
      method,
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Content-Type': 'application/json'
      },
      data
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      log(`VirusTotal API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`, 'virus-total-service');
    } else {
      log(`VirusTotal API error: ${error}`, 'virus-total-service');
    }
    throw error;
  }
}

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
      
      // Create URL identifier (base64 encoded)
      const urlId = Buffer.from(url).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      // First, check if the URL has been analyzed before
      let analysisResult;
      try {
        // Try to get existing analysis
        const response = await vtRequest(`/urls/${urlId}`);
        analysisResult = response.data.attributes.last_analysis_results;
      } catch (error) {
        // If no analysis exists, submit URL for scanning
        log(`No recent scan found for URL, submitting for scanning: ${url}`, 'virus-total-service');
        await vtRequest('/urls', 'POST', { url });
        
        // Wait a moment for the scan to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to get analysis again
        try {
          const response = await vtRequest(`/urls/${urlId}`);
          analysisResult = response.data.attributes.last_analysis_results;
        } catch (retryError) {
          throw new Error('Failed to get analysis after submission');
        }
      }
      
      if (!analysisResult) {
        throw new Error('Invalid response from VirusTotal');
      }
      
      // Process the results
      let detections = 0;
      let total = 0;
      const threatCategories: string[] = [];
      
      // Count detections and collect categories
      Object.values(analysisResult).forEach((result: any) => {
        total++;
        if (result.category === 'malicious' || result.category === 'suspicious') {
          detections++;
          if (result.result) {
            threatCategories.push(result.result);
          }
        }
      });
      
      const isMalicious = detections > 0;
      const scanDate = new Date().toISOString();
      
      return {
        isMalicious,
        detections,
        total,
        scanDate,
        threatCategories: Array.from(new Set(threatCategories)), // Remove duplicates
        reportLink: `https://www.virustotal.com/gui/url/${urlId}/detection`
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

      // First, check if the file has been analyzed before using its hash
      let analysisResult;
      try {
        // Try to get existing analysis
        const response = await vtRequest(`/files/${sha256}`);
        analysisResult = response.data.attributes.last_analysis_results;
      } catch (error) {
        // If no analysis exists, upload the file for scanning
        log(`No recent scan found for file, uploading for scanning: ${fileName}`, 'virus-total-service');
        
        // We'll need to upload the file using form data
        // Use a temporary file since VirusTotal API requires file uploads
        const tempFilePath = `/tmp/${sha256}_${fileName}`;
        await fs.promises.writeFile(tempFilePath, fileBuffer);
        
        try {
          // Create a form with the file to upload
          const FormData = require('form-data');
          const form = new FormData();
          form.append('file', fs.createReadStream(tempFilePath));
          
          // Upload directly using axios
          await axios({
            method: 'post',
            url: 'https://www.virustotal.com/api/v3/files',
            headers: {
              'x-apikey': VIRUSTOTAL_API_KEY,
              ...form.getHeaders()
            },
            data: form
          });
          
          // Wait a moment for the scan to complete
          await new Promise(resolve => setTimeout(resolve, 15000));
          
          // Try to get analysis again
          try {
            const response = await vtRequest(`/files/${sha256}`);
            analysisResult = response.data.attributes.last_analysis_results;
          } catch (retryError) {
            // File might still be processing
            throw new Error('Failed to get analysis after upload, file may still be processing');
          }
        } finally {
          // Clean up the temporary file
          try {
            await fs.promises.unlink(tempFilePath);
          } catch (cleanupError) {
            log(`Error cleaning up temporary file: ${cleanupError}`, 'virus-total-service');
          }
        }
      }
      
      if (!analysisResult) {
        throw new Error('Invalid response from VirusTotal');
      }
      
      // Process the results
      let detections = 0;
      let total = 0;
      const threatCategories: string[] = [];
      
      // Count detections and collect categories
      Object.values(analysisResult).forEach((result: any) => {
        total++;
        if (result.category === 'malicious' || result.category === 'suspicious') {
          detections++;
          if (result.result) {
            threatCategories.push(result.result);
          }
        }
      });
      
      const isMalicious = detections > 0;
      const scanDate = new Date().toISOString();

      return {
        isMalicious,
        detections,
        total,
        scanDate,
        threatCategories: Array.from(new Set(threatCategories)), // Remove duplicates
        md5,
        sha1,
        sha256,
        reportLink: `https://www.virustotal.com/gui/file/${sha256}/detection`
      };
    } catch (error) {
      log(`Error scanning file with VirusTotal: ${error}`, 'virus-total-service');
      // Return a safe default response
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