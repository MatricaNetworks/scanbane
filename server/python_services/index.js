/**
 * Python Services Integration Module
 * 
 * Provides bridge functions to call the Python-based security services
 * from JavaScript/TypeScript in the main application.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { log } = require('../vite');

const SERVICES_DIR = __dirname;

// Helper to execute Python scripts and return results
async function executePythonScript(scriptName, args = [], input = null) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SERVICES_DIR, scriptName);
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python script not found: ${scriptPath}`));
    }
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    let stdoutData = '';
    let stderrData = '';
    
    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    
    // Collect stderr data
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Python script execution failed with code ${code}: ${stderrData}`, 'python-service');
        return reject(new Error(`Python script execution failed with code ${code}: ${stderrData}`));
      }
      
      try {
        // Try to parse JSON output
        const result = JSON.parse(stdoutData);
        resolve(result);
      } catch (err) {
        log(`Failed to parse Python script output: ${err.message}`, 'python-service');
        reject(new Error(`Failed to parse Python script output: ${err.message} - Output: ${stdoutData}`));
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (err) => {
      log(`Python process error: ${err.message}`, 'python-service');
      reject(new Error(`Python process error: ${err.message}`));
    });
    
    // Send input to the Python process if provided
    if (input !== null) {
      if (typeof input === 'object') {
        pythonProcess.stdin.write(JSON.stringify(input));
      } else {
        pythonProcess.stdin.write(input.toString());
      }
      pythonProcess.stdin.end();
    }
  });
}

// Steganography Detection Service
class SteganographyDetectionService {
  /**
   * Detect steganography in an image
   * @param {Buffer} imageBuffer - Image data buffer
   * @returns {Promise<Object>} Detection results
   */
  async detectSteganography(imageBuffer) {
    try {
      // Save buffer to a temporary file
      const tempFilePath = path.join(os.tmpdir(), `steganography_${Date.now()}.png`);
      fs.writeFileSync(tempFilePath, imageBuffer);
      
      try {
        // Call Python script with the temp file path
        const result = await executePythonScript('steganography_service.py', [tempFilePath]);
        return result;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } catch (error) {
      log(`Steganography detection error: ${error.message}`, 'python-service');
      return {
        hasSteganography: false,
        confidence: 0.0,
        error: error.message
      };
    }
  }
}

// Malware Detection Service
class MalwareDetectionService {
  /**
   * Analyze a file for malware
   * @param {Buffer} fileBuffer - File data buffer
   * @param {string} fileName - Name of the file
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeFile(fileBuffer, fileName) {
    try {
      // Save buffer to a temporary file
      const tempFilePath = path.join(os.tmpdir(), `malware_scan_${Date.now()}_${path.basename(fileName)}`);
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      try {
        // Call Python script with the temp file path
        const result = await executePythonScript('malware_detection_service.py', [tempFilePath]);
        return result;
      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } catch (error) {
      log(`Malware detection error: ${error.message}`, 'python-service');
      return {
        isMalicious: false,
        confidence: 0.0,
        error: error.message
      };
    }
  }
}

// URL Analysis Service
class URLAnalysisService {
  /**
   * Analyze a URL for threats
   * @param {string} url - URL to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeURL(url) {
    try {
      // Call Python script with the URL
      const result = await executePythonScript('url_analysis_service.py', [url]);
      return result;
    } catch (error) {
      log(`URL analysis error: ${error.message}`, 'python-service');
      return {
        isMalicious: false,
        confidence: 0.0,
        error: error.message
      };
    }
  }
}

// Export singleton instances of the services
module.exports = {
  steganographyDetectionService: new SteganographyDetectionService(),
  malwareDetectionService: new MalwareDetectionService(),
  urlAnalysisService: new URLAnalysisService()
};