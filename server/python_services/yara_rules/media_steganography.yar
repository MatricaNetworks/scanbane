/*
  Media Steganography Detection YARA Rules
  Purpose: Detect potential steganography in audio and video files
  Author: ScamBane Security Team
  Date: 2025
*/

// Audio LSB Steganography signatures
rule AudioLSBSteganography {
  meta:
    description = "Detects potential LSB steganography in audio files"
    author = "ScamBane Security Team"
    severity = "medium"
    reference = "https://www.sans.org/reading-room/whitepapers/stenganography/steganography-steganalysis-overview-553"
  
  strings:
    // Common steganography software signatures
    $s1 = "Mp3Stego" ascii wide nocase
    $s2 = "AudioStego" ascii wide nocase
    $s3 = "WavSteg" ascii wide nocase
    $s4 = "Audio Steganography" ascii wide nocase
    $s5 = "steganography" ascii wide nocase
    
    // Binary patterns that might be consistent with LSB embedding
    $b1 = { 00 00 00 01 00 00 00 01 00 00 00 01 00 00 00 01 }
    $b2 = { 01 00 01 00 01 00 01 00 01 00 01 00 }
    
    // WAV format specifics
    $wav_steg1 = "STEGANOGRAPHY" ascii wide nocase
    $wav_steg2 = "LSBSteg" ascii wide nocase
    
    // MP3 format signature for steganography
    $mp3_steg = "LAME3.99" ascii wide // Modified LAME signature sometimes used in stego
    
  condition:
    (uint32(0) == 0x46464952 or // "RIFF" (WAV files)
     uint32(0) == 0x6468544D or // "MThd" (MIDI files)
     uint32(0) == 0x43614666 or // "fLaC" (FLAC files)
     uint16(0) == 0x4449 or     // "ID3" (MP3 files)
     uint32(0) == 0x4F676753)   // "OggS" (OGG files)
    and
    (
      any of ($s*) or
      any of ($b*) or
      any of ($wav_steg*) or
      $mp3_steg
    )
}

// Video-based steganography
rule VideoSteganography {
  meta:
    description = "Detects potential steganography in video files"
    author = "ScamBane Security Team"
    severity = "medium"
    reference = "https://www.sciencedirect.com/science/article/pii/S1877050920316318"
  
  strings:
    // Steganography software strings
    $s1 = "VideoSteg" ascii wide nocase
    $s2 = "OpenPuff" ascii wide nocase
    $s3 = "DeepSound" ascii wide nocase
    $s4 = "MSU StegoVideo" ascii wide nocase
    $s5 = "Video Steganography" ascii wide nocase
    
    // Common technique markers
    $tech1 = "LSB embedding" ascii wide nocase
    $tech2 = "frame differencing" ascii wide nocase
    $tech3 = "motion vector" ascii wide nocase
    
    // Patterns for frame metadata analysis
    $b1 = { F5 46 DC B9 }  // Specific bit patterns
    $b2 = { 00 01 00 01 00 01 00 01 00 01 }  // Repeated LSB patterns
    
    // Uncommon codec patterns that could signal embedding
    $codec1 = "FFCA" ascii wide
    $codec2 = "MJLS" ascii wide  // Motion JPEG Lossless
    
  condition:
    (uint32(0) == 0x464D4143 or  // "CAMF" (CAM format)
     uint32(0) == 0x38766167 or  // "gv8" (Google Video)
     uint32(0) == 0x6976614D or  // "Mavi" (some AVI formats)
     uint32(0) == 0x5367674F or  // "OggS" (Ogg video)
     uint32(0) == 0x70797466 or  // "ftyp" (MP4, MOV, etc.)
     uint32(0) == 0x464C4546)    // "FLIF" (FLIF format)
    and
    (
      any of ($s*) or
      any of ($tech*) or
      any of ($b*) or
      any of ($codec*)
    )
}

// Metadata Manipulation Detection (both audio and video)
rule MediaMetadataManipulation {
  meta:
    description = "Detects unusual or suspicious metadata in media files"
    author = "ScamBane Security Team"
    severity = "low"
    reference = "https://www.blackhat.com/presentations/bh-europe-05/BH_EU_05-Hyams.pdf"
  
  strings:
    // Unusual metadata strings
    $meta1 = "secret" ascii wide nocase
    $meta2 = "hidden" ascii wide nocase
    $meta3 = "confidential" ascii wide nocase
    $meta4 = "steganography" ascii wide nocase
    $meta5 = "stegano" ascii wide nocase
    
    // Patterns that indicate metadata modification
    $mod1 = "modified with" ascii wide nocase
    $mod2 = "edited" ascii wide nocase
    
    // Tools often used for steganography
    $tool1 = "Outguess" ascii wide nocase
    $tool2 = "Steghide" ascii wide nocase
    $tool3 = "OpenStego" ascii wide nocase
    $tool4 = "Invisible Secrets" ascii wide nocase
    
  condition:
    (
      // Formats with extensive metadata
      uint32(0) == 0x46464952 or  // RIFF
      uint32(0) == 0x5367674F or  // OggS
      uint32(0) == 0x70797466 or  // ftyp
      uint16(0) == 0x4449        // ID3
    ) 
    and
    (
      2 of ($meta*) or
      any of ($mod*) or
      any of ($tool*)
    )
}

// Unusual Codec Usage Detection
rule UncommonCodecUsage {
  meta:
    description = "Detects uncommon or suspicious codec usage in media files"
    author = "ScamBane Security Team"
    severity = "medium"
    reference = "https://securingtomorrow.mcafee.com/consumer/consumer-threat-notices/steganography/"
  
  strings:
    // Uncommon codecs that might be used for steganography
    $codec1 = "MJLS" ascii wide  // Motion JPEG Lossless
    $codec2 = "Lagarith" ascii wide  // Lossless codec
    $codec3 = "FFV1" ascii wide  // FFmpeg Video Codec 1
    $codec4 = "HuffYUV" ascii wide
    $codec5 = "CamStudio" ascii wide
    $codec6 = "LOCO" ascii wide  // LOCO-I/JPEG-LS
    
    // Unusual audio codecs
    $acodec1 = "FLAC" ascii wide
    $acodec2 = "Monkey's Audio" ascii wide
    $acodec3 = "TTA" ascii wide  // True Audio codec
    $acodec4 = "WavPack" ascii wide
    $acodec5 = "ALAC" ascii wide  // Apple Lossless
    
    // Modified common codecs
    $mod1 = "custom codec" ascii wide nocase
    $mod2 = "modified codec" ascii wide nocase
    
  condition:
    (
      // Video or audio file formats
      uint32(0) == 0x46464952 or  // RIFF (WAV/AVI)
      uint32(0) == 0x5367674F or  // OggS
      uint32(0) == 0x70797466 or  // ftyp (MP4)
      uint16(0) == 0x4D42 or      // BM (BMP)
      uint32(0) == 0x474E5089     // PNG
    ) 
    and
    (
      any of ($codec*) or
      any of ($acodec*) or
      any of ($mod*)
    )
}

// Suspicious File Analysis (cross-format analysis)
rule SuspiciousMediaTransformation {
  meta:
    description = "Detects signs of media transformation consistent with steganography"
    author = "ScamBane Security Team"
    severity = "medium"
    reference = "https://www.sans.org/reading-room/whitepapers/stenganography/steganography-steganalysis-overview-553"
  
  strings:
    // Transformation markers
    $t1 = "converted from" ascii wide nocase
    $t2 = "transformed" ascii wide nocase
    $t3 = "processed with" ascii wide nocase
    
    // Format conversion strings
    $conv1 = "WAV to MP3" ascii wide nocase
    $conv2 = "JPEG to PNG" ascii wide nocase
    $conv3 = "MP4 to AVI" ascii wide nocase
    
    // Statistical anomaly signs
    $stat1 = "normalized" ascii wide nocase
    $stat2 = "equalized" ascii wide nocase
    $stat3 = "histogram" ascii wide nocase
    
  condition:
    (
      // Media file formats
      uint32(0) == 0x46464952 or  // RIFF (WAV/AVI)
      uint32(0) == 0x5367674F or  // OggS
      uint32(0) == 0x70797466 or  // ftyp (MP4)
      uint32(0) == 0xE0FFD8FF or  // JPEG
      uint32(0) == 0x474E5089     // PNG
    )
    and
    (
      any of ($t*) or
      any of ($conv*) or
      any of ($stat*)
    )
}