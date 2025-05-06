"""
Advanced Media Steganography Detection Module for ScamBane
Extends steganography detection to audio and video files

Implements advanced detection techniques including:
- LSB analysis for images, audio, and video
- Chi-square test
- Entropy calculations
- Frame analysis for videos
"""

import os
import json
import logging
import numpy as np
import cv2
from PIL import Image
from scipy.stats import chisquare
from skimage.measure import shannon_entropy
import matplotlib.pyplot as plt
import io
import tempfile
import sys
from pydub import AudioSegment
import wave
import librosa
import ffmpeg
import scipy.fft
import pyheif
import cairosvg

logging.basicConfig(level=logging.INFO)

SUPPORTED_FORMATS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', 
    '.bmp', '.tiff', '.tif', '.ico', '.heic',
    '.heif', '.svg', '.avif', '.mp3', '.wav', '.aac', '.flac', '.ogg', '.amr', 
    '.mp4', '.avi', '.mkv', '.mov', '.webm', '.flv'
]

LOSSY_FORMATS = ['.jpg', '.jpeg', '.webp', '.heic', '.heif', '.avif', '.mp3', '.aac', '.ogg', '.amr', '.flv']

# Helper functions

def load_image_safe(image_path: str) -> np.ndarray:
    """
    Load an image file safely handling various formats
    """
    try:
        ext = os.path.splitext(image_path)[-1].lower()
        
        # Handle HEIC/HEIF files
        if ext in ['.heic', '.heif']:
            heif_file = pyheif.read(image_path)
            image = Image.frombytes(
                heif_file.mode, 
                heif_file.size, 
                heif_file.data,
                "raw",
                heif_file.mode,
                heif_file.stride,
            )
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
        # Handle SVG files
        elif ext == '.svg':
            png_data = cairosvg.svg2png(url=image_path)
            image = Image.open(io.BytesIO(png_data))
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
        # Regular image formats
        else:
            return cv2.imread(image_path)
            
    except Exception as e:
        logging.error(f"Error loading image {image_path}: {e}")
        # Return a small blank image as fallback
        return np.zeros((50, 50, 3), dtype=np.uint8)

def load_image_from_buffer(image_data: bytes) -> np.ndarray:
    """
    Load image from bytes buffer, supporting multiple formats
    """
    try:
        # First try to load with PIL which handles more formats
        pil_img = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        if pil_img.mode == 'RGBA':
            img_array = np.array(pil_img)
            return cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
        else:
            img_array = np.array(pil_img)
            return cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    except Exception as e:
        logging.error(f"Error loading image from buffer: {e}")
        # Return a small blank image as fallback
        return np.zeros((50, 50, 3), dtype=np.uint8)

def save_buffer_to_temp_file(buffer: bytes, extension: str = '.tmp') -> str:
    """Save buffer data to a temporary file and return the path"""
    with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as temp:
        temp.write(buffer)
        return temp.name

# Audio Functions

def extract_audio_from_video(video_path: str) -> str:
    """Extract audio from video file"""
    audio_output_path = tempfile.NamedTemporaryFile(suffix='.wav', delete=False).name
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_output_path)
            .run(capture_stdout=True, capture_stderr=True, quiet=True)
        )
        return audio_output_path
    except Exception as e:
        logging.error(f"Error extracting audio from video: {e}")
        return None

def analyze_audio_lsb(audio_path: str) -> dict:
    """Detect LSB steganography in audio files"""
    try:
        # Load audio file
        audio = AudioSegment.from_file(audio_path)
        samples = np.array(audio.get_array_of_samples())
        
        # Perform LSB analysis
        lsb_plane = samples & 1
        chi_val, chi_p = chi_square_test(lsb_plane)
        entropy_val = shannon_entropy(lsb_plane)
        
        # Calculate suspiciousness based on chi-square test and entropy
        is_suspicious = chi_p < 0.05 or entropy_val > 0.97
        confidence = 0.5
        
        if chi_p < 0.01 and entropy_val > 0.98:
            confidence = 0.9  # Very likely
        elif chi_p < 0.05 and entropy_val > 0.97:
            confidence = 0.7  # Likely
        elif chi_p < 0.1 and entropy_val > 0.95:
            confidence = 0.5  # Possible
        else:
            confidence = 0.3  # Less likely
            is_suspicious = False
        
        return {
            "hasSteganography": is_suspicious,
            "confidence": confidence,
            "chi_square_p": float(chi_p),
            "lsb_entropy": float(entropy_val),
            "detectionMethods": ["LSB Analysis", "Chi-Square Test", "Entropy Analysis"]
        }
    except Exception as e:
        logging.error(f"Error analyzing audio: {e}")
        return {
            "hasSteganography": False,
            "confidence": 0,
            "error": str(e)
        }

# Video Functions

def extract_frames_from_video(video_path: str, max_frames: int = 10):
    """Extract video frames for analysis"""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise Exception(f"Could not open video: {video_path}")
            
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frames = []
        
        # If too many frames, extract a sample
        if frame_count > max_frames:
            indices = np.linspace(0, frame_count-1, max_frames, dtype=int)
            for idx in indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                if ret:
                    frames.append(frame)
        else:
            # Extract all frames if fewer than max_frames
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                frames.append(frame)
                
        cap.release()
        return frames
    except Exception as e:
        logging.error(f"Error extracting frames: {e}")
        return []

def analyze_video(video_path: str) -> dict:
    """Detect LSB steganography in video files"""
    try:
        frames = extract_frames_from_video(video_path)
        if not frames:
            return {
                "hasSteganography": False,
                "confidence": 0,
                "error": "No frames could be extracted from video"
            }
        
        # Analyze frames for LSB steganography
        suspicious_frames = 0
        chi_p_values = []
        entropy_values = []
        
        for frame in frames:
            lsb_plane = extract_lsb_plane(frame)
            chi_val, chi_p = chi_square_test(lsb_plane)
            entropy_val = shannon_entropy(lsb_plane)
            
            chi_p_values.append(chi_p)
            entropy_values.append(entropy_val)
            
            if chi_p < 0.05 or entropy_val > 0.97:
                suspicious_frames += 1
        
        # Also analyze audio if present
        audio_result = None
        try:
            audio_path = extract_audio_from_video(video_path)
            if audio_path:
                audio_result = analyze_audio_lsb(audio_path)
                # Clean up temp audio file
                if os.path.exists(audio_path):
                    os.unlink(audio_path)
        except Exception as e:
            logging.error(f"Error analyzing video audio: {e}")
        
        # Calculate confidence based on proportion of suspicious frames
        suspicious_ratio = suspicious_frames / len(frames) if frames else 0
        
        # Determine if steganography is present
        has_steg = False
        confidence = 0.0
        
        if suspicious_ratio > 0.5:
            has_steg = True
            confidence = 0.7 + (suspicious_ratio - 0.5) * 0.6  # Scale 0.7-1.0
        elif suspicious_ratio > 0.3:
            has_steg = True
            confidence = 0.5 + (suspicious_ratio - 0.3) * 2.0  # Scale 0.5-0.7
        elif suspicious_ratio > 0.1:
            has_steg = True
            confidence = 0.3 + (suspicious_ratio - 0.1) * 2.0  # Scale 0.3-0.5
        else:
            has_steg = suspicious_ratio > 0
            confidence = suspicious_ratio * 3.0  # Scale 0-0.3
        
        # Consider audio analysis in final verdict
        if audio_result and audio_result.get("hasSteganography", False):
            has_steg = True
            # Average confidence with audio result, giving video more weight
            confidence = (confidence * 2 + audio_result.get("confidence", 0)) / 3
        
        # Cap confidence at 1.0
        confidence = min(confidence, 1.0)
        
        return {
            "hasSteganography": has_steg,
            "confidence": confidence,
            "framesAnalyzed": len(frames),
            "suspiciousFrames": suspicious_frames,
            "avgChiSquareP": float(np.mean(chi_p_values)) if chi_p_values else None,
            "avgLsbEntropy": float(np.mean(entropy_values)) if entropy_values else None,
            "audioSteganography": audio_result,
            "detectionMethods": ["Frame LSB Analysis", "Chi-Square Test", "Entropy Analysis"]
        }
    except Exception as e:
        logging.error(f"Error analyzing video: {e}")
        return {
            "hasSteganography": False,
            "confidence": 0,
            "error": str(e)
        }

# LSB Detection for Images

def extract_lsb_plane(image: np.ndarray) -> np.ndarray:
    """Extract the least significant bit plane from an image"""
    try:
        if len(image.shape) == 3:  # Color image
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:  # Already grayscale
            gray = image
        return gray & 1
    except Exception as e:
        logging.error(f"Error extracting LSB plane: {e}")
        return np.zeros((50, 50), dtype=np.uint8)  # Return empty on error

def chi_square_test(lsb_plane: np.ndarray):
    """Perform chi-square test on LSB plane to detect unnatural patterns"""
    try:
        flat = lsb_plane.flatten()
        values, counts = np.unique(flat, return_counts=True)
        expected = [len(flat) / len(values)] * len(values)
        chi, p = chisquare(counts, f_exp=expected)
        return chi, p
    except Exception as e:
        logging.error(f"Error in chi-square test: {e}")
        return 0, 1.0  # Return no significance on error

def image_entropy(image: np.ndarray) -> float:
    """Calculate Shannon entropy of an image plane"""
    try:
        return shannon_entropy(image)
    except Exception as e:
        logging.error(f"Error calculating entropy: {e}")
        return 0.0  # Return low entropy on error

def rs_analysis(gray: np.ndarray):
    """Implement RS (Regular-Singular) analysis for steganography detection"""
    def mask_flip(block, mask):
        return np.bitwise_xor(block, mask)
    
    try:
        height, width = gray.shape
        block_size = 4
        mask1 = np.array([[0, 1], [1, 0]])
        mask2 = np.array([[1, 0], [0, 1]])
        
        # Expand masks to block_size if needed
        if block_size > 2:
            mask1 = np.tile(mask1, (block_size//2, block_size//2))
            mask2 = np.tile(mask2, (block_size//2, block_size//2))
        
        # Calculate discrimination functions
        def calculate_groups(img):
            regular_groups = 0
            singular_groups = 0
            
            # Analyze blocks
            for y in range(0, height - block_size + 1, block_size):
                for x in range(0, width - block_size + 1, block_size):
                    block = img[y:y+block_size, x:x+block_size]
                    
                    # Calculate differences
                    diffs = np.abs(np.diff(block.astype(float), axis=0))
                    smoothness = np.sum(diffs)
                    
                    # Apply mask1
                    flipped = mask_flip(block, mask1)
                    flipped_diffs = np.abs(np.diff(flipped.astype(float), axis=0))
                    flipped_smoothness = np.sum(flipped_diffs)
                    
                    # Classify block
                    if flipped_smoothness > smoothness:
                        regular_groups += 1
                    elif flipped_smoothness < smoothness:
                        singular_groups += 1
                    
                    # Apply mask2 (different mask pattern)
                    flipped2 = mask_flip(block, mask2)
                    flipped_diffs2 = np.abs(np.diff(flipped2.astype(float), axis=0))
                    flipped_smoothness2 = np.sum(flipped_diffs2)
                    
                    # Classify block with second mask
                    if flipped_smoothness2 > smoothness:
                        regular_groups += 1
                    elif flipped_smoothness2 < smoothness:
                        singular_groups += 1
            
            total_blocks = ((height // block_size) * (width // block_size)) * 2  # *2 for two masks
            return regular_groups / total_blocks if total_blocks > 0 else 0, singular_groups / total_blocks if total_blocks > 0 else 0
        
        r_m, s_m = calculate_groups(gray)
        return r_m, s_m
    except Exception as e:
        logging.error(f"Error in RS analysis: {e}")
        return 0.5, 0.5  # Return neutral values on error

def analyze_image(image_data):
    """
    Perform comprehensive steganography analysis on image data
    
    Args:
        image_data: Bytes containing the image data
        
    Returns:
        dict: Analysis results
    """
    try:
        # Load the image data
        image = load_image_from_buffer(image_data)
        if image is None or image.size == 0:
            return {
                "hasSteganography": False,
                "confidence": 0,
                "error": "Failed to load image data"
            }
        
        # Extract the LSB plane
        lsb_plane = extract_lsb_plane(image)
        
        # Perform Chi-square test on LSB plane
        chi_val, chi_p = chi_square_test(lsb_plane)
        
        # Calculate entropy of the LSB plane
        entropy_val = image_entropy(lsb_plane)
        
        # Perform RS analysis if image is not too large
        if image.shape[0] * image.shape[1] < 4000000:  # Limit analysis to <= 4MP images
            rs_reg, rs_sing = rs_analysis(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))
        else:
            # For large images, sample a portion for RS analysis
            scaled_img = cv2.resize(image, (1024, 1024))
            rs_reg, rs_sing = rs_analysis(cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY))
        
        # Analyze the combined results to determine probability of steganography
        indicator_score = 0
        confidence_score = 0
        detection_methods = []
        
        # Chi-square test (highly reliable for LSB replacement)
        if chi_p < 0.001:
            indicator_score += 3
            confidence_score += 0.4
            detection_methods.append("Chi-Square Test")
        elif chi_p < 0.01:
            indicator_score += 2
            confidence_score += 0.3
            detection_methods.append("Chi-Square Test")
        elif chi_p < 0.05:
            indicator_score += 1
            confidence_score += 0.2
            detection_methods.append("Chi-Square Test")
        
        # Entropy analysis (natural images have less random LSB planes)
        if entropy_val > 0.98:
            indicator_score += 3
            confidence_score += 0.3
            detection_methods.append("Entropy Analysis")
        elif entropy_val > 0.95:
            indicator_score += 2
            confidence_score += 0.2
            detection_methods.append("Entropy Analysis")
        elif entropy_val > 0.9:
            indicator_score += 1
            confidence_score += 0.1
            detection_methods.append("Entropy Analysis")
        
        # RS analysis (compare regular vs singular groups)
        rs_diff = abs(rs_reg - rs_sing)
        if rs_diff < 0.05:  # Very close - suspicious
            indicator_score += 2
            confidence_score += 0.2
            detection_methods.append("RS Analysis")
        elif rs_diff < 0.1:  # Close - somewhat suspicious
            indicator_score += 1
            confidence_score += 0.1
            detection_methods.append("RS Analysis")
        
        # Determine final verdict
        has_steganography = indicator_score >= 3
        
        # Scale confidence score to a more intuitive range
        if confidence_score > 0:
            confidence_score = min(0.3 + confidence_score, 1.0)
        
        return {
            "hasSteganography": has_steganography,
            "confidence": confidence_score,
            "chi_square_p": float(chi_p),
            "lsb_entropy": float(entropy_val),
            "rs_regular": float(rs_reg),
            "rs_singular": float(rs_sing),
            "indicator_score": indicator_score,
            "detectionMethods": detection_methods
        }
    except Exception as e:
        logging.error(f"Error analyzing image: {e}")
        return {
            "hasSteganography": False,
            "confidence": 0,
            "error": str(e)
        }

def detect_media_steganography(file_data, file_name):
    """
    Detect steganography in various media files (image, audio, video)
    
    Args:
        file_data: Bytes containing the file data
        file_name: Name of the file
        
    Returns:
        dict: Detection results
    """
    try:
        ext = os.path.splitext(file_name)[-1].lower()
        
        # Save data to temporary file for certain formats
        temp_file_path = None
        
        # Process based on file type
        if ext in ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.amr']:
            # Audio files
            temp_file_path = save_buffer_to_temp_file(file_data, ext)
            result = analyze_audio_lsb(temp_file_path)
            result["mediaType"] = "audio"
            
        elif ext in ['.mp4', '.avi', '.mkv', '.mov', '.webm', '.flv']:
            # Video files
            temp_file_path = save_buffer_to_temp_file(file_data, ext)
            result = analyze_video(temp_file_path)
            result["mediaType"] = "video"
            
        elif ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.ico', '.heic', '.heif', '.svg', '.avif']:
            # Image files
            result = analyze_image(file_data)
            result["mediaType"] = "image"
            
        else:
            # Unsupported format
            result = {
                "hasSteganography": False,
                "confidence": 0,
                "error": f"Unsupported file format: {ext}",
                "mediaType": "unknown"
            }
        
        # Clean up temporary file if created
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass
                
        return result
        
    except Exception as e:
        logging.error(f"Error in steganography detection: {e}")
        return {
            "hasSteganography": False,
            "confidence": 0,
            "error": f"Analysis failed: {str(e)}",
            "mediaType": "unknown"
        }

# API function for integration with Node.js
def detect_steganography_in_media(file_data):
    """
    API function for Node.js integration that detects steganography in media files
    
    Args:
        file_data: Bytes containing the file data
        
    Returns:
        dict: Detection results
    """
    try:
        # First parameter is always the script name
        if len(sys.argv) < 2:
            logging.error("Missing required argument: file path")
            return json.dumps({"error": "Missing required argument: file path"})
            
        file_path = sys.argv[1]
        file_name = os.path.basename(file_path)
        
        # Read file data from stdin if not provided
        if not file_data:
            file_data = sys.stdin.buffer.read()
            
        # If still no data, try to read from file path
        if not file_data:
            with open(file_path, 'rb') as f:
                file_data = f.read()
        
        result = detect_media_steganography(file_data, file_name)
        
        # Print the result as JSON to stdout
        print(json.dumps(result))
        return result
        
    except Exception as e:
        logging.error(f"Error in steganography detection API: {e}")
        error_result = {
            "hasSteganography": False,
            "confidence": 0,
            "error": str(e)
        }
        print(json.dumps(error_result))
        return error_result

if __name__ == "__main__":
    detect_steganography_in_media(None)