#!/usr/bin/env python3
"""
Test script for media steganography detection
This script creates sample audio and video files with simulated steganography
for testing the detection capabilities
"""

import os
import sys
import json
import numpy as np
import tempfile
import logging
from pydub import AudioSegment
from pydub.generators import Sine
import cv2
import random
from advanced_media_steganography import detect_media_steganography

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TestMediaSteganography")

def create_test_audio(with_steganography=False):
    """Create a test audio file with optional steganography"""
    # Create a simple sine wave audio
    sine_wave = Sine(440)  # 440 Hz sine wave
    audio = sine_wave.to_audio_segment(duration=3000)  # 3 seconds
    
    if with_steganography:
        # Get raw audio data as array
        samples = np.array(audio.get_array_of_samples())
        
        # Create a message (10101010...) pattern
        message = np.array([1, 0] * (len(samples) // 2))[:len(samples)]
        
        # Perform LSB steganography (replace least significant bit)
        # Clear the LSB first
        samples_modified = samples & ~1
        # Set the LSB according to our message
        samples_modified = samples_modified | message
        
        # Convert back to audio
        audio = audio._spawn(samples_modified.tobytes())
    
    # Save to temporary file
    fd, temp_path = tempfile.mkstemp(suffix='.wav')
    os.close(fd)
    audio.export(temp_path, format="wav")
    
    return temp_path

def create_test_video(with_steganography=False):
    """Create a test video file with optional steganography"""
    # Create a temporary file
    fd, temp_path = tempfile.mkstemp(suffix='.avi')
    os.close(fd)
    
    # Video properties
    width, height = 320, 240
    fps = 24
    duration = 3  # seconds
    
    # Create a VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(temp_path, fourcc, fps, (width, height))
    
    # Create simple frames (grayscale gradient)
    frames = []
    for i in range(fps * duration):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Create a gradient pattern
        for y in range(height):
            for x in range(width):
                value = (x + y + i) % 256
                frame[y, x] = [value, value, value]
        
        if with_steganography:
            # Embed data in LSB of the frame
            # Create a checkerboard pattern for visibility in testing
            for y in range(0, height, 8):
                for x in range(0, width, 8):
                    # Clear LSB
                    frame[y:y+8, x:x+8, 0] = frame[y:y+8, x:x+8, 0] & ~1
                    # Set LSB in a checkerboard pattern
                    if (x//8 + y//8 + i) % 2 == 0:
                        frame[y:y+8, x:x+8, 0] = frame[y:y+8, x:x+8, 0] | 1
        
        frames.append(frame)
        out.write(frame)
    
    # Release resources
    out.release()
    
    return temp_path

def test_steganography_detection():
    """Test the steganography detection capabilities"""
    results = []
    
    # Test audio without steganography
    logger.info("Creating test audio without steganography...")
    audio_path = create_test_audio(with_steganography=False)
    logger.info(f"Created test audio at {audio_path}")
    
    # Read the file content
    with open(audio_path, 'rb') as f:
        audio_data = f.read()
    
    logger.info("Testing audio without steganography...")
    audio_clean_result = detect_media_steganography(audio_data, os.path.basename(audio_path))
    logger.info(f"Detection result: {json.dumps(audio_clean_result, indent=2)}")
    results.append({
        'type': 'audio_clean',
        'path': audio_path,
        'result': audio_clean_result
    })
    
    # Test audio with steganography
    logger.info("Creating test audio with steganography...")
    audio_stego_path = create_test_audio(with_steganography=True)
    logger.info(f"Created test audio at {audio_stego_path}")
    
    # Read the file content
    with open(audio_stego_path, 'rb') as f:
        audio_stego_data = f.read()
    
    logger.info("Testing audio with steganography...")
    audio_stego_result = detect_media_steganography(audio_stego_data, os.path.basename(audio_stego_path))
    logger.info(f"Detection result: {json.dumps(audio_stego_result, indent=2)}")
    results.append({
        'type': 'audio_stego',
        'path': audio_stego_path,
        'result': audio_stego_result
    })
    
    # Test video without steganography
    logger.info("Creating test video without steganography...")
    video_path = create_test_video(with_steganography=False)
    logger.info(f"Created test video at {video_path}")
    
    # Read the file content
    with open(video_path, 'rb') as f:
        video_data = f.read()
    
    logger.info("Testing video without steganography...")
    video_clean_result = detect_media_steganography(video_data, os.path.basename(video_path))
    logger.info(f"Detection result: {json.dumps(video_clean_result, indent=2)}")
    results.append({
        'type': 'video_clean',
        'path': video_path,
        'result': video_clean_result
    })
    
    # Test video with steganography
    logger.info("Creating test video with steganography...")
    video_stego_path = create_test_video(with_steganography=True)
    logger.info(f"Created test video at {video_stego_path}")
    
    # Read the file content
    with open(video_stego_path, 'rb') as f:
        video_stego_data = f.read()
    
    logger.info("Testing video with steganography...")
    video_stego_result = detect_media_steganography(video_stego_data, os.path.basename(video_stego_path))
    logger.info(f"Detection result: {json.dumps(video_stego_result, indent=2)}")
    results.append({
        'type': 'video_stego',
        'path': video_stego_path,
        'result': video_stego_result
    })
    
    # Clean up temporary files
    for result in results:
        try:
            os.unlink(result['path'])
        except Exception as e:
            logger.warning(f"Could not delete temporary file {result['path']}: {e}")
    
    # Print summary
    logger.info("===== Steganography Detection Test Summary =====")
    for result in results:
        detection = result['result']['hasSteganography'] if 'hasSteganography' in result['result'] else False
        confidence = result['result']['confidence'] if 'confidence' in result['result'] else 0
        expected = 'stego' in result['type']
        success = detection == expected
        
        logger.info(f"Test: {result['type']}")
        logger.info(f"  - Expected detection: {expected}")
        logger.info(f"  - Actual detection: {detection}")
        logger.info(f"  - Confidence: {confidence}")
        logger.info(f"  - Success: {'✅' if success else '❌'}")
    
    return results

if __name__ == "__main__":
    test_steganography_detection()