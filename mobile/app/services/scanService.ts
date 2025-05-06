import apiClient from './apiClient';
import * as FileSystem from 'expo-file-system';

// Interface for scan result
interface ScanResult {
  scanId: number;
  result: 'safe' | 'malicious' | 'suspicious';
  threatType: string | null;
  details: {
    confidence: number;
    detectionTime: string;
    explanation: string;
    scanServices: string[];
    [key: string]: any; // Other properties specific to scan type
  };
  scanDetails: Record<string, any>;
  scansUsed: number;
  target: string;
}

// Scan a URL
export async function scanUrl(url: string): Promise<ScanResult> {
  const response = await apiClient.post('/scan/url', { url });
  return response.data;
}

// Scan a file
export async function scanFile(
  uri: string, 
  fileName: string,
  mimeType: string
): Promise<ScanResult> {
  // Create form data for the file upload
  const formData = new FormData();
  
  // Convert local URI to blob
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error("File doesn't exist");
  }
  
  // Read the file as base64
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  
  // Create blob and append to form
  const blob: any = {
    uri,
    name: fileName,
    type: mimeType,
  };
  
  formData.append('file', blob);
  
  const response = await apiClient.post('/scan/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

// Scan an image
export async function scanImage(
  uri: string,
  fileName: string
): Promise<ScanResult> {
  // Create form data for the image upload
  const formData = new FormData();
  
  // Create blob and append to form
  const blob: any = {
    uri,
    name: fileName,
    type: 'image/jpeg', // Assuming JPEG, adjust as needed
  };
  
  formData.append('image', blob);
  
  const response = await apiClient.post('/scan/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
}

// Get scan history
export async function getScanHistory(limit = 10): Promise<ScanResult[]> {
  const response = await apiClient.get(`/scan/history?limit=${limit}`);
  return response.data;
}