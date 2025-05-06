#!/usr/bin/env python3
"""
Steganography Detection Service for ScamBane
Implements LSB analysis, StegExpose, and OpenStego detection
"""

from PIL import Image
import numpy as np
import io
import os
import subprocess
import json
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SteganographyDetector:
    """Comprehensive steganography detection using multiple methods"""
    
    def __init__(self):
        """Initialize paths to required tools"""
        self.stegexpose_path = os.environ.get('STEGEXPOSE_PATH', './tools/stegexpose')
        self.openstego_path = os.environ.get('OPENSTEGO_PATH', './tools/openstego')
    
    def detect_steganography(self, image_data):
        """
        Main detection method using multiple approaches
        
        Args:
            image_data: Bytes containing the image data
            
        Returns:
            dict: Detection results from all available methods
        """
        try:
            results = {
                "hasSteganography": False,
                "confidence": 0.0,
                "detectionMethods": [],
                "detailsByMethod": {}
            }
            
            # Create temporary file for analysis
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                temp_file.write(image_data)
                temp_path = temp_file.name
            
            try:
                # Run all detection methods
                lsb_result = self.detect_lsb(image_data)
                results["detailsByMethod"]["lsb_analysis"] = lsb_result
                
                # Only run external tools if LSB didn't already detect something with high confidence
                if lsb_result["confidence"] < 0.8:
                    try:
                        stegexpose_result = self.detect_stegexpose(temp_path)
                        results["detailsByMethod"]["stegexpose"] = stegexpose_result
                    except Exception as e:
                        logger.error(f"StegExpose detection error: {str(e)}")
                        results["detailsByMethod"]["stegexpose"] = {"error": str(e)}
                    
                    try:
                        openstego_result = self.detect_openstego(temp_path)
                        results["detailsByMethod"]["openstego"] = openstego_result
                    except Exception as e:
                        logger.error(f"OpenStego detection error: {str(e)}")
                        results["detailsByMethod"]["openstego"] = {"error": str(e)}
                
                # Aggregate results - check if any method found steganography
                for method, method_result in results["detailsByMethod"].items():
                    if method_result.get("detected", False):
                        results["hasSteganography"] = True
                        results["detectionMethods"].append(method)
                
                # Calculate overall confidence (weighted average of all methods)
                confidence_sum = 0
                methods_count = 0
                
                for method, method_result in results["detailsByMethod"].items():
                    if "confidence" in method_result:
                        if method == "lsb_analysis":
                            # Give more weight to LSB analysis
                            confidence_sum += method_result["confidence"] * 2
                            methods_count += 2
                        else:
                            confidence_sum += method_result["confidence"]
                            methods_count += 1
                
                if methods_count > 0:
                    results["confidence"] = confidence_sum / methods_count
                
                return results
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_path)
                except Exception as e:
                    logger.error(f"Error removing temp file: {str(e)}")
        
        except Exception as e:
            logger.error(f"Steganography detection error: {str(e)}")
            return {
                "hasSteganography": False,
                "confidence": 0.0,
                "error": str(e),
                "detectionMethods": []
            }
    
    def detect_lsb(self, image_data):
        """
        Detect steganography using LSB (Least Significant Bit) analysis
        
        Args:
            image_data: Bytes containing the image data
            
        Returns:
            dict: LSB detection results
        """
        try:
            # Open image with Pillow
            img = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if needed
            if img.mode != "RGB":
                img = img.convert("RGB")
            
            # Get pixel data
            pixels = np.array(img)
            
            # Calculate LSB frequencies for each color channel
            lsb_freqs = []
            for channel in range(3):  # RGB channels
                lsb_values = pixels[:,:,channel] % 2  # Extract LSBs
                lsb_freq = np.sum(lsb_values) / lsb_values.size
                lsb_freqs.append(lsb_freq)
            
            # Check for anomalies in LSB distribution
            # In normal images, LSBs should be close to 0.5 frequency
            anomaly_scores = [abs(freq - 0.5) for freq in lsb_freqs]
            max_anomaly = max(anomaly_scores)
            
            # Calculate chi-square test for randomness
            chi_square_values = []
            for channel in range(3):
                channel_data = pixels[:,:,channel].flatten()
                observed_0 = np.sum(channel_data % 2 == 0)
                observed_1 = np.sum(channel_data % 2 == 1)
                expected = channel_data.size / 2  # Expected is 50% for each
                chi_square = ((observed_0 - expected)**2 / expected) + ((observed_1 - expected)**2 / expected)
                chi_square_values.append(chi_square)
            
            avg_chi_square = sum(chi_square_values) / len(chi_square_values)
            
            # Detect pairs analysis
            # Count transitions between adjacent pixels
            transitions = 0
            for channel in range(3):
                for row in range(pixels.shape[0]):
                    for col in range(pixels.shape[1]-1):
                        if (pixels[row,col,channel] % 2) != (pixels[row,col+1,channel] % 2):
                            transitions += 1
            
            transition_ratio = transitions / (pixels.shape[0] * pixels.shape[1] * 3)
            
            # Calculate final detection score
            anomaly_weight = 0.4
            chi_square_weight = 0.4  
            transition_weight = 0.2
            
            # Normalize chi-square value for scoring (higher chi-square = less random = more suspicious)
            # This is a simple mapping, could be improved with proper statistical thresholds
            chi_score = min(1.0, avg_chi_square / 20)
            
            # For transition ratio, very low values are suspicious
            transition_score = max(0, 0.6 - transition_ratio) * 2  
            
            final_score = (
                max_anomaly * anomaly_weight + 
                chi_score * chi_square_weight + 
                transition_score * transition_weight
            )
            
            # Determine if steganography is detected based on thresholds
            is_detected = final_score > 0.5
            confidence = min(0.95, final_score)
            
            return {
                "detected": is_detected,
                "confidence": confidence,
                "lsb_frequencies": lsb_freqs,
                "chi_square_avg": avg_chi_square,
                "transition_ratio": transition_ratio,
                "anomaly_score": max_anomaly,
                "details": {
                    "image_size": f"{img.width}x{img.height}",
                    "color_mode": img.mode
                }
            }
            
        except Exception as e:
            logger.error(f"LSB detection error: {str(e)}")
            return {
                "detected": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def detect_stegexpose(self, image_path):
        """
        Detect steganography using StegExpose tool
        
        Args:
            image_path: Path to image file
            
        Returns:
            dict: StegExpose detection results
        """
        try:
            # Run StegExpose tool
            cmd = ["java", "-jar", f"{self.stegexpose_path}/StegExpose.jar", image_path, "-all"]
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"StegExpose failed: {stderr.decode()}")
            
            # Parse output (sample format: "filename,chi-square,weighted,sample-pairs,fusion")
            output = stdout.decode().strip()
            parts = output.split(",")
            
            if len(parts) < 5:
                raise Exception(f"Unexpected StegExpose output format: {output}")
            
            # Parse fusion score (overall detection result)
            fusion_score = float(parts[4])
            is_detected = fusion_score > 0.5  # Threshold may need adjustment
            confidence = min(0.95, fusion_score)
            
            return {
                "detected": is_detected,
                "confidence": confidence,
                "chi_square_score": float(parts[1]),
                "weighted_score": float(parts[2]),
                "sample_pairs_score": float(parts[3]),
                "fusion_score": fusion_score
            }
            
        except Exception as e:
            logger.error(f"StegExpose detection error: {str(e)}")
            return {
                "detected": False,
                "confidence": 0.0,
                "error": str(e)
            }
    
    def detect_openstego(self, image_path):
        """
        Detect steganography using OpenStego tool
        
        Args:
            image_path: Path to image file
            
        Returns:
            dict: OpenStego detection results
        """
        try:
            # Run OpenStego detection
            cmd = ["java", "-jar", f"{self.openstego_path}/openstego.jar", "extract", "-a", "lsb", "-sf", image_path]
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()
            
            # Check output - if OpenStego found a signature, it will report extraction
            output = stdout.decode() + stderr.decode()
            
            # Determine if steganography was detected
            is_detected = "Extracted" in output or "extracted" in output
            
            # Set confidence based on detection
            confidence = 0.85 if is_detected else 0.0
            
            return {
                "detected": is_detected,
                "confidence": confidence,
                "tool_output": output.strip()
            }
            
        except Exception as e:
            logger.error(f"OpenStego detection error: {str(e)}")
            return {
                "detected": False,
                "confidence": 0.0,
                "error": str(e)
            }

# Create singleton instance
steganography_detector = SteganographyDetector()

# API function to be called from Node.js
def detect_steganography_in_image(image_data):
    """API function for Node.js integration"""
    return steganography_detector.detect_steganography(image_data)

# Command line testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python steganography_service.py <image_path>")
        sys.exit(1)
    
    with open(sys.argv[1], 'rb') as f:
        image_data = f.read()
    
    result = steganography_detector.detect_steganography(image_data)
    print(json.dumps(result, indent=2))