/*
  Media Steganography Detection YARA Rules
  Purpose: Detect potential steganography in audio and video files
  Author: ScamBane Security Team
  Date: 2025
  
  These rules detect various steganography techniques in different media formats
  including frequency domain steganography, spread spectrum techniques, and 
  specific steganography software signatures.
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

// Advanced DCT (Discrete Cosine Transform) steganography detection
rule DCTFrequencyDomainSteganography {
  meta:
    description = "Detects patterns consistent with DCT-based steganography in media"
    author = "ScamBane Security Team"
    severity = "high"
    reference = "https://link.springer.com/article/10.1007/s11042-019-08010-4"
  
  strings:
    // Software that uses DCT/frequency domain embedding
    $s1 = "JSteg" ascii wide nocase
    $s2 = "F5stego" ascii wide nocase
    $s3 = "OutGuess" ascii wide nocase
    $s4 = "StegHide" ascii wide nocase
    $s5 = "frequency domain" ascii wide nocase
    $s6 = "DCT coefficient" ascii wide nocase
    $s7 = "spectrum embedding" ascii wide nocase
    
    // Libraries for frequency domain operations
    $lib1 = "libfftw" ascii wide
    $lib2 = "fft.h" ascii wide
    $lib3 = "cosine transform" ascii wide nocase
    
    // Specific byte patterns sometimes found in DCT steganography
    $bin1 = { 3F 3F 3F 3F 40 40 40 40 }  // Coefficient quantization pattern
    $bin2 = { FD FC FD FC FD FC FD FC }  // Unusual high-frequency pattern
    
  condition:
    (
      // Image or video formats that use DCT
      uint32(0) == 0xE0FFD8FF or  // JPEG
      uint32(0) == 0x70797466 or  // MP4, etc.
      uint32(0) == 0x6976614D     // AVI
    )
    and
    (
      2 of ($s*) or
      any of ($lib*) or
      any of ($bin*)
    )
}

// Pattern-based detection for Echo Hiding in audio
rule AudioEchoHidingSteganography {
  meta:
    description = "Detects potential echo hiding steganography in audio files"
    author = "ScamBane Security Team"
    severity = "medium"
    reference = "https://www.researchgate.net/publication/272091091_Echo_Hiding_Steganography"
  
  strings:
    // Echo hiding terminology
    $echo1 = "echo hiding" ascii wide nocase
    $echo2 = "echo steg" ascii wide nocase
    $echo3 = "time domain" ascii wide nocase
    $echo4 = "delay" ascii wide nocase
    $echo5 = "signal processing" ascii wide nocase
    
    // Software features for echo hiding
    $feat1 = "delay parameter" ascii wide nocase
    $feat2 = "decay factor" ascii wide nocase
    $feat3 = "echo coder" ascii wide nocase
    $feat4 = "echo detector" ascii wide nocase
    
    // Names of tools
    $tool1 = "SoundHide" ascii wide nocase
    $tool2 = "EchoHider" ascii wide nocase
    $tool3 = "AudioSteganography" ascii wide nocase
    
  condition:
    (
      // Audio formats
      uint32(0) == 0x46464952 or  // RIFF (WAV)
      uint16(0) == 0x4449 or      // ID3 (MP3)
      uint32(0) == 0x43614666 or  // FLAC
      uint32(0) == 0x4F676753     // OGG
    )
    and
    (
      2 of ($echo*) or
      any of ($feat*) or
      any of ($tool*)
    )
}

// Spread Spectrum steganography detection
rule SpreadSpectrumSteganography {
  meta:
    description = "Detects spread spectrum steganography techniques across media types"
    author = "ScamBane Security Team"
    severity = "high"
    reference = "https://link.springer.com/chapter/10.1007/978-3-540-74124-0_22"
  
  strings:
    // Spread spectrum terminology
    $ss1 = "spread spectrum" ascii wide nocase
    $ss2 = "DSSS" ascii wide  // Direct Sequence Spread Spectrum
    $ss3 = "FHSS" ascii wide  // Frequency Hopping Spread Spectrum
    $ss4 = "pseudo-random" ascii wide nocase
    $ss5 = "pseudo random" ascii wide nocase
    
    // Common tools and libraries
    $lib1 = "SStek" ascii wide nocase
    $lib2 = "SpreadSteg" ascii wide nocase
    $lib3 = "HideInPlainSpectrum" ascii wide nocase
    
    // Specific code patterns
    $code1 = "watermark.spread(" ascii wide
    $code2 = "generatePRSequence" ascii wide
    $code3 = "spreadSequence" ascii wide
    
  condition:
    (
      // Any media format
      uint32(0) == 0x46464952 or  // RIFF (WAV/AVI)
      uint32(0) == 0x5367674F or  // OggS
      uint32(0) == 0x70797466 or  // ftyp (MP4)
      uint32(0) == 0xE0FFD8FF or  // JPEG
      uint32(0) == 0x474E5089     // PNG
    )
    and
    (
      2 of ($ss*) or
      any of ($lib*) or
      any of ($code*)
    )
}

// Advanced Malicious JavaScript in media files
rule MediaEmbeddedJavaScript {
  meta:
    description = "Detects JavaScript embedded in media file metadata or content"
    author = "ScamBane Security Team"
    severity = "critical"
    reference = "https://owasp.org/www-community/attacks/Embedding_Null_in_HTTP_Header"
  
  strings:
    // JavaScript markers
    $js1 = "<script" ascii wide nocase
    $js2 = "javascript:" ascii wide nocase
    $js3 = "eval(" ascii wide
    $js4 = "document.write" ascii wide
    $js5 = "fromCharCode" ascii wide
    $js6 = "unescape(" ascii wide
    
    // Obfuscation techniques
    $obf1 = "\\x" ascii
    $obf2 = "\\u00" ascii
    $obf3 = "%u00" ascii
    $obf4 = "btoa" ascii
    $obf5 = "atob" ascii
    
    // Exploitation markers
    $exp1 = "XSS" ascii wide nocase
    $exp2 = "iFrame" ascii wide nocase
    $exp3 = "fetch(" ascii wide
    $exp4 = "onload=" ascii wide nocase
    
  condition:
    (
      // Any media format
      uint32(0) == 0x46464952 or  // RIFF (WAV/AVI)
      uint32(0) == 0x5367674F or  // OggS
      uint32(0) == 0x70797466 or  // ftyp (MP4)
      uint32(0) == 0xE0FFD8FF or  // JPEG
      uint32(0) == 0x474E5089     // PNG
    )
    and
    (
      2 of ($js*) or
      (any of ($js*) and any of ($obf*)) or
      (any of ($js*) and any of ($exp*))
    )
}