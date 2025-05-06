#!/usr/bin/env python3
"""
Advanced Steganography Detection Module for ScamBane
Implements advanced LSB analysis techniques including:
- Chi-square test
- RS analysis
- Entropy calculations
- Histogram slope analysis
"""

import os
import sys
import json
import logging
import tempfile
import numpy as np
import cv2
from PIL import Image
from scipy.stats import chisquare
from skimage.measure import shannon_entropy

logging.basicConfig(level=logging.INFO)

SUPPORTED_FORMATS = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.bmp', '.tiff', '.tif', '.ico'
]

LOSSY_FORMATS = ['.jpg', '.jpeg', '.webp']


def load_image_safe(image_path: str) -> np.ndarray:
    """
    Load an image file in a way that handles multiple formats and error conditions
    """
    ext = os.path.splitext(image_path)[-1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported file extension: {ext}")
    try:
        if ext in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.tif', '.webp']:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Failed to load image with OpenCV: {image_path}")
        elif ext in ['.gif', '.ico']:
            pil = Image.open(image_path).convert('RGB')
            img = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
        else:
            raise ValueError("Unsupported format for decoding.")
        return img
    except Exception as e:
        raise RuntimeError(f"Failed to load image ({ext}): {e}")


def extract_lsb_plane(image: np.ndarray) -> np.ndarray:
    """
    Extract the least significant bit plane from an image
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return gray & 1


def chi_square_test(lsb_plane: np.ndarray):
    """
    Perform chi-square test on LSB plane to detect unnatural patterns
    """
    flat = lsb_plane.flatten()
    values, counts = np.unique(flat, return_counts=True)
    expected = [len(flat) / 2] * 2  # Expect equal distribution of 0s and 1s
    chi, p = chisquare(counts, f_exp=expected)
    return chi, p


def rs_analysis(gray: np.ndarray):
    """
    Implement RS (Regular-Singular) analysis for steganography detection
    """
    def mask_flip(block, mask):
        return block ^ mask

    mask = np.array([[0, 0], [0, 1]])
    rows, cols = gray.shape
    total, regular, singular = 0, 0, 0
    for i in range(0, rows - 1, 2):
        for j in range(0, cols - 1, 2):
            block = gray[i:i+2, j:j+2]
            if block.shape != (2, 2):
                continue
            flipped = mask_flip(block, mask)
            orig_var = np.var(block)
            flip_var = np.var(flipped)
            if flip_var > orig_var:
                regular += 1
            elif flip_var < orig_var:
                singular += 1
            total += 1
    
    # Return ratio of regular and singular groups
    return (regular / total if total > 0 else 0, 
            singular / total if total > 0 else 0)


def image_entropy(image: np.ndarray) -> float:
    """
    Calculate Shannon entropy of an image plane
    """
    return shannon_entropy(image)


def histogram_slope_analysis(gray: np.ndarray):
    """
    Analyze histogram slope changes - steganography often creates unusual patterns
    """
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    diffs = np.diff(hist)
    slope_changes = np.sum(np.abs(np.diff(np.sign(diffs))))
    return slope_changes


def composite_score(chi_p, entropy, rs_reg, rs_sing, slope_changes):
    """
    Combine multiple detection methods for a more robust result
    """
    score = 0
    # Suspicious if chi-square p-value is low (rejecting uniform distribution)
    if chi_p < 0.05:
        score += 1
    # High entropy in LSB plane is suspicious
    if entropy > 0.9:
        score += 1
    # Equal RS regular and singular ratios are suspicious (common in LSB stego)
    if abs(rs_reg - rs_sing) < 0.05:
        score += 1
    # Many histogram slope changes can indicate hidden data
    if slope_changes > 100:
        score += 1
    # Consider suspicious if 3+ indicators triggered
    return score >= 3


def analyze_image(image_path: str) -> dict:
    """
    Perform comprehensive steganography analysis on an image
    """
    try:
        ext = os.path.splitext(image_path)[-1].lower()
        img = load_image_safe(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lsb = extract_lsb_plane(img)

        # Run various detection methods
        chi_val, chi_p = chi_square_test(lsb)
        entropy_val = image_entropy(lsb)
        rs_reg, rs_sing = rs_analysis(gray)
        slope = histogram_slope_analysis(gray)

        suspicious = composite_score(chi_p, entropy_val, rs_reg, rs_sing, slope)
        notes = []
        if ext in LOSSY_FORMATS:
            notes.append("Lossy format; LSB steganography less likely.")

        confidence = 0.0
        if suspicious:
            # Calculate confidence based on how many tests were positive
            indicators = sum([
                1 if chi_p < 0.05 else 0,
                1 if entropy_val > 0.9 else 0,
                1 if abs(rs_reg - rs_sing) < 0.05 else 0,
                1 if slope > 100 else 0
            ])
            # Scale from 0.6 to 0.95 based on number of indicators
            confidence = 0.6 + (indicators - 3) * 0.35 / 1.0 if indicators >= 3 else 0.0

        return {
            "hasSteganography": suspicious,
            "confidence": round(confidence, 2),
            "detectionMethod": "Advanced LSB Analysis",
            "detectionsByMethod": {
                "chi_square_p": round(chi_p, 5),
                "lsb_entropy": round(entropy_val, 4),
                "rs_regular": round(rs_reg, 4),
                "rs_singular": round(rs_sing, 4),
                "histogram_slope_changes": int(slope)
            },
            "detectionMethods": ["Chi-square test", "RS analysis", "Entropy analysis", "Histogram analysis"],
            "notes": notes
        }
    except Exception as e:
        return {
            "hasSteganography": False,
            "confidence": 0.0,
            "error": str(e),
            "detectionMethod": "Advanced LSB Analysis",
            "detectionsByMethod": {},
            "notes": ["Analysis failed with error"]
        }


def main():
    """
    Process the image file provided as argument and print results as JSON
    """
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Provide exactly one image path argument"}))
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    try:
        result = analyze_image(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()