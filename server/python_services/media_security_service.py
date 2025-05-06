"""
Media Security Service for ScamBane
Provides comprehensive media security features including:
- Sandboxing and analysis of media files
- Metadata stripping
- Detection of uncommon codec usage
- Steganography detection in audio and video
- Behavioral anomaly detection

This service is designed to enhance the security of media handling in the ScamBane platform.
"""

import os
import sys
import json
import logging
import tempfile
import numpy as np
import cv2
from PIL import Image, ExifTags
import io
from pydub import AudioSegment
import wave
import ffmpeg
import subprocess
import hashlib
import re
import yara
from advanced_media_steganography import detect_media_steganography

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("MediaSecurityService")

# Supported file types
AUDIO_FORMATS = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.amr']
VIDEO_FORMATS = ['.mp4', '.avi', '.mkv', '.mov', '.webm', '.flv', '.m4v', '.3gp']
IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.ico', '.heic', '.heif', '.svg', '.avif']

# List of uncommon or suspicious codecs
SUSPICIOUS_CODECS = [
    'MJLS', 'Lagarith', 'FFV1', 'HuffYUV', 'CamStudio', 'LOCO',  # Video
    'Monkey\'s Audio', 'TTA', 'WavPack', 'ALAC',  # Audio
    'Custom', 'Modified', 'Experimental'  # General
]

class MediaSecurityService:
    """Comprehensive service for secure media handling"""
    
    def __init__(self):
        """Initialize the service"""
        # Try to load YARA rules
        self.yara_rules = None
        try:
            yara_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), 
                'yara_rules', 
                'media_steganography.yar'
            )
            if os.path.exists(yara_path):
                self.yara_rules = yara.compile(filepath=yara_path)
                logger.info(f"Loaded YARA rules from {yara_path}")
            else:
                logger.warning(f"YARA rules not found at {yara_path}")
        except Exception as e:
            logger.error(f"Failed to load YARA rules: {e}")
    
    def analyze_media_file(self, file_data, file_name):
        """
        Main entry point for comprehensive media analysis
        
        Args:
            file_data (bytes): The file content
            file_name (str): The name of the file
        
        Returns:
            dict: Analysis results including security recommendations
        """
        try:
            # Get file extension
            file_ext = os.path.splitext(file_name)[1].lower()
            
            # Save to temporary file for analysis
            with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_file:
                temp_file.write(file_data)
                temp_file_path = temp_file.name
            
            try:
                # Results container
                results = {
                    "fileName": file_name,
                    "fileSize": len(file_data),
                    "fileType": self._determine_file_type(file_ext),
                    "securityStatus": {
                        "isSafe": True,
                        "threatLevel": "none",
                        "warnings": [],
                        "recommendations": []
                    },
                    "analysis": {},
                    "metadata": {}
                }
                
                # Extract and analyze metadata
                metadata_result = self.extract_metadata(temp_file_path, file_ext)
                results["metadata"] = metadata_result
                
                # Check for suspicious metadata
                if metadata_result.get("suspicious_fields", []):
                    results["securityStatus"]["isSafe"] = False
                    results["securityStatus"]["threatLevel"] = "low"
                    results["securityStatus"]["warnings"].append("Suspicious metadata detected")
                    results["securityStatus"]["recommendations"].append("Strip metadata before sharing or opening")
                
                # Detect steganography
                stego_result = detect_media_steganography(file_data, file_name)
                results["analysis"]["steganography"] = stego_result
                
                if stego_result.get("hasSteganography", False):
                    threat_level = "medium"
                    if stego_result.get("confidence", 0) > 0.7:
                        threat_level = "high"
                    
                    results["securityStatus"]["isSafe"] = False
                    results["securityStatus"]["threatLevel"] = threat_level
                    results["securityStatus"]["warnings"].append("Potential hidden data detected")
                    results["securityStatus"]["recommendations"].append("Avoid opening this file - it may contain concealed malicious content")
                
                # Scan with YARA rules
                if self.yara_rules:
                    yara_results = self.scan_with_yara(temp_file_path)
                    results["analysis"]["yara"] = yara_results
                    
                    if yara_results.get("matches", []):
                        results["securityStatus"]["isSafe"] = False
                        current_level = results["securityStatus"]["threatLevel"]
                        if current_level == "none":
                            results["securityStatus"]["threatLevel"] = "medium"
                        results["securityStatus"]["warnings"].append("Matched patterns associated with steganography techniques")
                
                # Check for uncommon codecs
                if file_ext in AUDIO_FORMATS + VIDEO_FORMATS:
                    codec_info = self.detect_uncommon_codecs(temp_file_path)
                    results["analysis"]["codecAnalysis"] = codec_info
                    
                    if codec_info.get("uncommonCodecDetected", False):
                        results["securityStatus"]["isSafe"] = False
                        results["securityStatus"]["threatLevel"] = max(
                            self._threat_level_to_numeric(results["securityStatus"]["threatLevel"]),
                            self._threat_level_to_numeric("medium")
                        )
                        results["securityStatus"]["warnings"].append("Uncommon codec detected")
                        results["securityStatus"]["recommendations"].append("Use caution when opening - uncommon codecs may contain exploits")
                
                # Add general security recommendations
                self._add_security_recommendations(results)
                
                # Convert numeric threat level back to string
                if isinstance(results["securityStatus"]["threatLevel"], int):
                    results["securityStatus"]["threatLevel"] = self._numeric_to_threat_level(
                        results["securityStatus"]["threatLevel"]
                    )
                
                return results
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"Error analyzing media file: {e}")
            return {
                "fileName": file_name,
                "error": str(e),
                "securityStatus": {
                    "isSafe": False,
                    "threatLevel": "unknown",
                    "warnings": ["Analysis failed - treat file with caution"],
                    "recommendations": ["Do not open this file as it could not be properly analyzed"]
                }
            }
    
    def extract_metadata(self, file_path, file_ext):
        """
        Extract metadata from media files
        
        Args:
            file_path (str): Path to the media file
            file_ext (str): File extension
        
        Returns:
            dict: Extracted metadata with suspicious fields highlighted
        """
        metadata = {
            "format": file_ext,
            "suspicious_fields": []
        }
        
        try:
            # Image metadata extraction
            if file_ext in IMAGE_FORMATS:
                try:
                    with Image.open(file_path) as img:
                        # Extract EXIF data if available
                        if hasattr(img, '_getexif') and img._getexif():
                            exif = {
                                ExifTags.TAGS.get(k, k): v
                                for k, v in img._getexif().items()
                                if k in ExifTags.TAGS
                            }
                            metadata["exif"] = {}
                            
                            # Look for suspicious fields
                            suspicious_keywords = ['secret', 'hidden', 'password', 'stego', 'confidential']
                            
                            for key, value in exif.items():
                                if isinstance(value, (str, bytes)):
                                    str_value = str(value)
                                    # Truncate very long values
                                    if len(str_value) > 100:
                                        str_value = str_value[:100] + "..."
                                    metadata["exif"][key] = str_value
                                    
                                    # Check for suspicious content
                                    if any(keyword in str_value.lower() for keyword in suspicious_keywords):
                                        metadata["suspicious_fields"].append(key)
                                else:
                                    metadata["exif"][key] = str(type(value))
                        
                        # Get basic image properties
                        metadata["dimensions"] = img.size
                        metadata["mode"] = img.mode
                        metadata["format"] = img.format
                except Exception as e:
                    logger.error(f"Error extracting image metadata: {e}")
                    metadata["error"] = str(e)
            
            # Audio metadata extraction
            elif file_ext in AUDIO_FORMATS:
                try:
                    audio = AudioSegment.from_file(file_path)
                    metadata["channels"] = audio.channels
                    metadata["sample_width"] = audio.sample_width
                    metadata["frame_rate"] = audio.frame_rate
                    metadata["duration_seconds"] = len(audio) / 1000.0
                    
                    # MP3 specific tags
                    if file_ext == '.mp3':
                        # Using subprocess for tag extraction
                        try:
                            result = subprocess.run(
                                ['ffprobe', '-loglevel', 'quiet', '-show_format', '-print_format', 'json', file_path],
                                capture_output=True, text=True
                            )
                            if result.returncode == 0:
                                probe_data = json.loads(result.stdout)
                                if 'format' in probe_data and 'tags' in probe_data['format']:
                                    metadata["tags"] = probe_data['format']['tags']
                                    
                                    # Check for suspicious tags
                                    suspicious_keywords = ['secret', 'hidden', 'password', 'stego', 'confidential']
                                    for key, value in metadata["tags"].items():
                                        if isinstance(value, str) and any(keyword in value.lower() for keyword in suspicious_keywords):
                                            metadata["suspicious_fields"].append(key)
                        except Exception as e:
                            logger.warning(f"Could not extract MP3 tags: {e}")
                except Exception as e:
                    logger.error(f"Error extracting audio metadata: {e}")
                    metadata["error"] = str(e)
            
            # Video metadata extraction
            elif file_ext in VIDEO_FORMATS:
                try:
                    # Using ffprobe for video metadata
                    result = subprocess.run(
                        ['ffprobe', '-loglevel', 'quiet', '-show_format', '-show_streams', '-print_format', 'json', file_path],
                        capture_output=True, text=True
                    )
                    
                    if result.returncode == 0:
                        probe_data = json.loads(result.stdout)
                        
                        # Extract format information
                        if 'format' in probe_data:
                            metadata["format_info"] = {
                                "format_name": probe_data['format'].get('format_name'),
                                "duration": float(probe_data['format'].get('duration', 0)),
                                "size": int(probe_data['format'].get('size', 0)),
                                "bit_rate": int(probe_data['format'].get('bit_rate', 0)) if 'bit_rate' in probe_data['format'] else None
                            }
                            
                            # Check for tags
                            if 'tags' in probe_data['format']:
                                metadata["tags"] = probe_data['format']['tags']
                                
                                # Check for suspicious tags
                                suspicious_keywords = ['secret', 'hidden', 'password', 'stego', 'confidential']
                                for key, value in metadata["tags"].items():
                                    if isinstance(value, str) and any(keyword in value.lower() for keyword in suspicious_keywords):
                                        metadata["suspicious_fields"].append(key)
                        
                        # Extract stream information
                        if 'streams' in probe_data:
                            metadata["streams"] = []
                            
                            for stream in probe_data['streams']:
                                stream_info = {
                                    "codec_type": stream.get('codec_type'),
                                    "codec_name": stream.get('codec_name'),
                                    "codec_long_name": stream.get('codec_long_name')
                                }
                                
                                # Add video-specific info
                                if stream.get('codec_type') == 'video':
                                    stream_info.update({
                                        "width": stream.get('width'),
                                        "height": stream.get('height'),
                                        "fps": eval(stream.get('r_frame_rate', '0/1')) if 'r_frame_rate' in stream else None
                                    })
                                
                                # Add audio-specific info
                                elif stream.get('codec_type') == 'audio':
                                    stream_info.update({
                                        "sample_rate": stream.get('sample_rate'),
                                        "channels": stream.get('channels')
                                    })
                                
                                metadata["streams"].append(stream_info)
                                
                                # Check for unusual codecs
                                if stream.get('codec_name') and any(
                                    suspicious in stream.get('codec_name', '') 
                                    for suspicious in SUSPICIOUS_CODECS
                                ):
                                    metadata["suspicious_fields"].append(f"codec: {stream.get('codec_name')}")
                except Exception as e:
                    logger.error(f"Error extracting video metadata: {e}")
                    metadata["error"] = str(e)
        
        except Exception as e:
            logger.error(f"Error in metadata extraction: {e}")
            metadata["error"] = str(e)
        
        return metadata
    
    def detect_uncommon_codecs(self, file_path):
        """
        Detect uncommon or suspicious codecs in media files
        
        Args:
            file_path (str): Path to the media file
        
        Returns:
            dict: Codec analysis results
        """
        result = {
            "uncommonCodecDetected": False,
            "suspiciousCodecs": [],
            "codecs": []
        }
        
        try:
            # Use ffprobe to get codec info
            ffprobe_cmd = [
                'ffprobe', 
                '-v', 'quiet', 
                '-show_streams', 
                '-show_format',
                '-print_format', 'json',
                file_path
            ]
            
            process = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
            
            if process.returncode == 0:
                data = json.loads(process.stdout)
                
                if 'streams' in data:
                    for stream in data['streams']:
                        codec_name = stream.get('codec_name', '').upper()
                        codec_info = {
                            "codec_name": codec_name,
                            "codec_type": stream.get('codec_type'),
                            "codec_long_name": stream.get('codec_long_name'),
                            "is_suspicious": False
                        }
                        
                        # Check if codec is in suspicious list
                        for suspicious in SUSPICIOUS_CODECS:
                            if suspicious.upper() in codec_name:
                                codec_info["is_suspicious"] = True
                                result["uncommonCodecDetected"] = True
                                result["suspiciousCodecs"].append(codec_name)
                                break
                        
                        result["codecs"].append(codec_info)
            
            return result
            
        except Exception as e:
            logger.error(f"Error detecting uncommon codecs: {e}")
            return {
                "error": str(e),
                "uncommonCodecDetected": False
            }
    
    def scan_with_yara(self, file_path):
        """
        Scan a file with YARA rules
        
        Args:
            file_path (str): Path to the file to scan
        
        Returns:
            dict: YARA scan results
        """
        result = {
            "matches": []
        }
        
        if not self.yara_rules:
            result["error"] = "YARA rules not available"
            return result
        
        try:
            matches = self.yara_rules.match(file_path)
            
            for match in matches:
                result["matches"].append({
                    "rule": match.rule,
                    "tags": match.tags,
                    "meta": match.meta,
                    "strings": [
                        {"identifier": s[1], "data": s[2].hex() if isinstance(s[2], bytes) else s[2]}
                        for s in match.strings
                    ]
                })
            
            return result
            
        except Exception as e:
            logger.error(f"Error in YARA scan: {e}")
            return {
                "error": str(e),
                "matches": []
            }
    
    def strip_metadata(self, file_data, file_name):
        """
        Strip metadata from media files
        
        Args:
            file_data (bytes): The file content
            file_name (str): The name of the file
        
        Returns:
            bytes: File content with metadata removed
        """
        try:
            file_ext = os.path.splitext(file_name)[1].lower()
            
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as temp_in:
                temp_in.write(file_data)
                temp_in_path = temp_in.name
                
            temp_out_path = temp_in_path + "_stripped"
            
            try:
                # Image metadata stripping
                if file_ext in IMAGE_FORMATS:
                    # For JPEG, PNG, etc.
                    try:
                        with Image.open(temp_in_path) as img:
                            # Create a new image without metadata
                            data = io.BytesIO()
                            
                            # PIL's save() without exif/metadata
                            params = {}
                            if file_ext in ['.jpg', '.jpeg']:
                                params = {"exif": b""}
                            
                            img.save(data, format=img.format, **params)
                            return data.getvalue()
                    except Exception as e:
                        logger.error(f"Error stripping image metadata: {e}")
                        return file_data  # Return original if failed
                
                # Audio/Video metadata stripping using FFmpeg
                elif file_ext in AUDIO_FORMATS + VIDEO_FORMATS:
                    try:
                        # Use FFmpeg to strip metadata
                        subprocess.run([
                            'ffmpeg',
                            '-i', temp_in_path,
                            '-map_metadata', '-1',  # Strip all metadata
                            '-c', 'copy',  # Copy without re-encoding
                            temp_out_path
                        ], check=True, capture_output=True)
                        
                        # Read the stripped file
                        with open(temp_out_path, 'rb') as f:
                            return f.read()
                    except Exception as e:
                        logger.error(f"Error stripping audio/video metadata: {e}")
                        return file_data  # Return original if failed
                
                # Unsupported format - return original
                else:
                    return file_data
            
            finally:
                # Clean up temporary files
                try:
                    if os.path.exists(temp_in_path):
                        os.unlink(temp_in_path)
                    if os.path.exists(temp_out_path):
                        os.unlink(temp_out_path)
                except:
                    pass
        
        except Exception as e:
            logger.error(f"Error in metadata stripping: {e}")
            return file_data  # Return original data if any error
    
    def _determine_file_type(self, file_ext):
        """Determine the general file type based on extension"""
        if file_ext in AUDIO_FORMATS:
            return "audio"
        elif file_ext in VIDEO_FORMATS:
            return "video"
        elif file_ext in IMAGE_FORMATS:
            return "image"
        else:
            return "unknown"
    
    def _add_security_recommendations(self, results):
        """Add appropriate security recommendations based on file type"""
        file_type = results.get("fileType", "")
        recommendations = results["securityStatus"]["recommendations"]
        
        # General recommendations for all media files
        if not any("sandbox" in r.lower() for r in recommendations):
            recommendations.append("Sandbox media files before opening them in your main environment")
            
        if not any("metadata" in r.lower() for r in recommendations):
            recommendations.append("Strip metadata from media files before sharing")
        
        # Audio/video specific recommendations
        if file_type in ["audio", "video"]:
            if not any("autoplay" in r.lower() for r in recommendations):
                recommendations.append("Disable autoplay in media players for untrusted content")
                
            if not any("codec" in r.lower() for r in recommendations):
                recommendations.append("Monitor and block uncommon codec usage which may hide malicious code")
        
        # Add user behavior recommendations
        recommendations.append("Use behavioral anomaly detection for unusual file interactions")
    
    def _threat_level_to_numeric(self, level):
        """Convert string threat level to numeric for comparison"""
        levels = {
            "none": 0,
            "low": 1,
            "medium": 2,
            "high": 3,
            "critical": 4,
            "unknown": -1
        }
        return levels.get(level, -1)
    
    def _numeric_to_threat_level(self, numeric_level):
        """Convert numeric threat level back to string"""
        levels = {
            0: "none",
            1: "low",
            2: "medium", 
            3: "high",
            4: "critical",
            -1: "unknown"
        }
        return levels.get(numeric_level, "unknown")

def analyze_media_security(file_data, file_name):
    """
    API function for Node.js integration
    
    Args:
        file_data (bytes): The file content as bytes
        file_name (str): The name of the file
        
    Returns:
        dict: Security analysis results
    """
    try:
        service = MediaSecurityService()
        result = service.analyze_media_file(file_data, file_name)
        
        # Print the result as JSON to stdout for the Node.js integration
        print(json.dumps(result))
        return result
        
    except Exception as e:
        error_result = {
            "fileName": file_name,
            "error": str(e),
            "securityStatus": {
                "isSafe": False,
                "threatLevel": "unknown",
                "warnings": ["Analysis failed due to an error"],
                "recommendations": ["Exercise caution with this file"]
            }
        }
        print(json.dumps(error_result))
        return error_result

# Main entry point
if __name__ == "__main__":
    # First parameter is the script name
    if len(sys.argv) < 2:
        logger.error("Missing required argument: file path")
        print(json.dumps({"error": "Missing required argument: file path"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    file_name = os.path.basename(file_path)
    
    # Read file data from stdin or file
    try:
        file_data = sys.stdin.buffer.read()
        if not file_data:
            with open(file_path, 'rb') as f:
                file_data = f.read()
        
        analyze_media_security(file_data, file_name)
        
    except Exception as e:
        logger.error(f"Error: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)