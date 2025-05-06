import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Shield, ShieldCheck, ShieldAlert, Globe, FileText, Image, 
  Smartphone, ArrowRight, Menu, X, Music, Video,
  Twitter, Linkedin, Github, Mail, Download, Search,
  Apple, CheckCircle, Laptop
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [, navigate] = useLocation();
  const user = null; // For now, we'll assume no user is logged in on the landing page

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ScamBane
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#platforms" className="text-foreground/80 hover:text-primary transition-colors">
              Platforms
            </a>
            <a href="#about" className="text-foreground/80 hover:text-primary transition-colors">
              About
            </a>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Button onClick={() => navigate("/")}>
                Dashboard
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Login
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <a 
                href="#features" 
                className="py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#platforms" 
                className="py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Platforms
              </a>
              <a 
                href="#about" 
                className="py-2 text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              {user ? (
                <Button onClick={() => navigate("/")}>
                  Dashboard
                </Button>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Login
                  </Button>
                  <Button onClick={() => navigate("/auth")}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  <span className="block">Advanced Security</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">for the Digital Age</span>
                </h1>
                <p className="text-xl text-foreground/70 max-w-md">
                  Protect yourself from online threats with our comprehensive platform. Scan, analyze, and block malicious URLs, files, images, audio, and video containing malware, phishing, and hidden steganography threats.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Start Scanning <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-border/40 shadow-xl">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-8">
                  <div className="bg-card/70 backdrop-blur-md rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md border border-border/50">
                    <div className="flex items-center space-x-4 mb-6">
                      <ShieldCheck className="h-10 w-10 text-green-500" />
                      <div>
                        <h3 className="text-xl font-semibold">Security Analysis</h3>
                        <p className="text-foreground/70">Scanning for threats...</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="bg-background/50 rounded-md p-4 flex items-center group hover:scale-102 transition-all duration-300 cursor-pointer">
                          <Globe className="h-5 w-5 text-red-500 mr-3 group-hover:animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">URL Scanner</p>
                            <div className="h-2 bg-red-200 dark:bg-red-950/30 rounded-full mt-1 overflow-hidden">
                              <div className="h-2 scanner-progress-red w-2/3" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center group hover:scale-102 transition-all duration-300 cursor-pointer">
                          <FileText className="h-5 w-5 text-green-500 mr-3 group-hover:animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">File Analysis</p>
                            <div className="h-2 bg-green-200 dark:bg-green-950/30 rounded-full mt-1 overflow-hidden">
                              <div className="h-2 scanner-progress-green w-1/2" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center group hover:scale-102 transition-all duration-300 cursor-pointer">
                          <Image className="h-5 w-5 text-blue-500 mr-3 group-hover:animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Image Steganography Detection</p>
                            <div className="h-2 bg-blue-200 dark:bg-blue-950/30 rounded-full mt-1 overflow-hidden">
                              <div className="h-2 scanner-progress-blue w-4/5" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center group hover:scale-102 transition-all duration-300 cursor-pointer">
                          <Music className="h-5 w-5 text-yellow-500 mr-3 group-hover:animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Audio Analysis</p>
                            <div className="h-2 bg-yellow-200 dark:bg-yellow-950/30 rounded-full mt-1 overflow-hidden">
                              <div className="h-2 scanner-progress-yellow w-3/5" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center group hover:scale-102 transition-all duration-300 cursor-pointer">
                          <Video className="h-5 w-5 text-gray-700 dark:text-white mr-3 group-hover:animate-pulse" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Video Security Scanner</p>
                            <div className="h-2 bg-gray-200 dark:bg-gray-600/30 rounded-full mt-1 overflow-hidden">
                              <div className="h-2 scanner-progress-gray w-2/5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Security Features</h2>
              <p className="text-foreground/70">
                Our platform offers multiple scanning technologies to protect you from various cyber threats
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-primary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Globe className="h-6 w-6 text-primary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">URL Scanning</h3>
                <p className="text-foreground/70">
                  Analyze URLs for phishing attempts, malware distribution, and fraudulent websites before you visit them.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-secondary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-6 w-6 text-secondary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">File Analysis</h3>
                <p className="text-foreground/70">
                  Scan files for malware, viruses, and other threats before opening them to ensure your system stays protected.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-primary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Image className="h-6 w-6 text-primary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Image Scanning</h3>
                <p className="text-foreground/70">
                  Detect hidden messages and malicious code embedded in images using advanced steganography detection.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-secondary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Smartphone className="h-6 w-6 text-secondary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">APK Analysis</h3>
                <p className="text-foreground/70">
                  Check Android applications for suspicious permissions, hidden functionality, and potential malware before installation.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-primary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <ShieldAlert className="h-6 w-6 text-primary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Threat Intelligence</h3>
                <p className="text-foreground/70">
                  Leverage multiple security APIs including VirusTotal, Google SafeBrowsing, AbuseIPDB, and more for comprehensive threat detection.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-secondary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Music className="h-6 w-6 text-secondary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Audio Analysis</h3>
                <p className="text-foreground/70">
                  Detect steganography in audio files (MP3, WAV, OGG, FLAC) with advanced frequency domain and LSB analysis.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-primary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Video className="h-6 w-6 text-primary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video Scanning</h3>
                <p className="text-foreground/70">
                  Analyze video files (MP4, MKV, AVI, MOV) for hidden threats, steganography, and behavioral anomalies.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-gradient-to-b hover:from-background hover:to-secondary/5 active:scale-95 cursor-pointer">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Shield className="h-6 w-6 text-secondary transition-all duration-300 hover:animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-foreground/70">
                  Advanced artificial intelligence analyzes potential threats and provides clear explanations of identified risks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">How ScamBane Works</h2>
              <p className="text-foreground/70">
                Our security triad ensures comprehensive protection by automatically intercepting and analyzing all digital content before allowing access
              </p>
            </div>
            
            <div className="md:flex justify-center mb-12">
              <div className="relative w-full max-w-4xl aspect-[4/3]">
                {/* Triangle Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Triangle SVG with Interactive Styling */}
                  <svg viewBox="0 0 800 600" className="w-full h-full">
                    {/* Enhanced Definitions */}
                    <defs>
                      {/* Pulsating radial gradient */}
                      <radialGradient id="triadGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08">
                          <animate attributeName="stop-opacity" values="0.08;0.15;0.08" dur="8s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                      </radialGradient>
                      
                      {/* Enhanced glow effect */}
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      
                      {/* Dynamic gradient for the triangle edges */}
                      <linearGradient id="gradient-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)">
                          <animate attributeName="stop-color" values="var(--color-primary);var(--color-secondary);#ef4444;var(--color-primary)" dur="12s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="var(--color-secondary)">
                          <animate attributeName="stop-color" values="var(--color-secondary);#ef4444;var(--color-primary);var(--color-secondary)" dur="12s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#ef4444">
                          <animate attributeName="stop-color" values="#ef4444;var(--color-primary);var(--color-secondary);#ef4444" dur="12s" repeatCount="indefinite" />
                        </stop>
                      </linearGradient>
                      
                      {/* Animated inner fill gradient */}
                      <linearGradient id="inner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)">
                          <animate attributeName="stop-color" values="var(--color-primary);var(--color-secondary);#ef4444;var(--color-primary)" dur="18s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="50%" stopColor="var(--color-secondary)">
                          <animate attributeName="stop-color" values="var(--color-secondary);#ef4444;var(--color-primary);var(--color-secondary)" dur="18s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#ef4444">
                          <animate attributeName="stop-color" values="#ef4444;var(--color-primary);var(--color-secondary);#ef4444" dur="18s" repeatCount="indefinite" />
                        </stop>
                      </linearGradient>
                      
                      {/* Particle effect */}
                      <filter id="particle">
                        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" />
                        <feDisplacementMap in="SourceGraphic" scale="5" />
                      </filter>
                      
                      {/* Animated pulse for corners */}
                      <radialGradient id="cornerPulse1" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--color-primary)">
                          <animate attributeName="stop-opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </radialGradient>
                      
                      <radialGradient id="cornerPulse2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--color-secondary)">
                          <animate attributeName="stop-opacity" values="0.9;0.4;0.9" dur="4s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                      </radialGradient>
                      
                      <radialGradient id="cornerPulse3" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444">
                          <animate attributeName="stop-opacity" values="0.9;0.4;0.9" dur="5s" repeatCount="indefinite" />
                        </stop>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    
                    {/* Animated Background Glow with pulsing effect */}
                    <circle cx="400" cy="300" r="250" fill="url(#triadGlow)">
                      <animate attributeName="r" values="250;260;250" dur="10s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Animated particles floating in the background */}
                    <g opacity="0.2" filter="url(#particle)">
                      <circle cx="350" cy="250" r="4" fill="var(--color-primary)">
                        <animate attributeName="cy" values="250;240;260;250" dur="20s" repeatCount="indefinite" />
                        <animate attributeName="cx" values="350;360;340;350" dur="25s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="450" cy="350" r="3" fill="var(--color-secondary)">
                        <animate attributeName="cy" values="350;340;360;350" dur="15s" repeatCount="indefinite" />
                        <animate attributeName="cx" values="450;460;440;450" dur="20s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="300" cy="350" r="5" fill="#ef4444">
                        <animate attributeName="cy" values="350;360;340;350" dur="18s" repeatCount="indefinite" />
                        <animate attributeName="cx" values="300;290;310;300" dur="23s" repeatCount="indefinite" />
                      </circle>
                    </g>
                    
                    {/* Outer Triangle with animated gradient stroke */}
                    <path 
                      d="M400,100 L650,450 L150,450 Z" 
                      fill="none" 
                      stroke="url(#gradient-stroke)" 
                      strokeWidth="3" 
                      className="text-foreground/50"
                      filter="url(#glow)"
                    >
                      <animate attributeName="stroke-width" values="3;4;3" dur="10s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Inner Triangle with subtle animated fill */}
                    <path 
                      d="M400,110 L640,440 L160,440 Z" 
                      fill="url(#inner-gradient)" 
                      fillOpacity="0.05"
                    >
                      <animate attributeName="fill-opacity" values="0.05;0.08;0.05" dur="8s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Connection lines with animated dash array and opacity */}
                    <g>
                      {/* Center to top line */}
                      <line 
                        x1="400" y1="300" x2="400" y2="100" 
                        stroke="var(--color-primary)" 
                        strokeWidth="1.5" 
                        strokeDasharray="5,5" 
                        strokeOpacity="0.6"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="20s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.6;0.9;0.6" dur="10s" repeatCount="indefinite" />
                      </line>
                      
                      {/* Center to bottom-right line */}
                      <line 
                        x1="400" y1="300" x2="650" y2="450" 
                        stroke="var(--color-secondary)" 
                        strokeWidth="1.5" 
                        strokeDasharray="5,5"
                        strokeOpacity="0.6"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="25s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.6;0.9;0.6" dur="12s" repeatCount="indefinite" />
                      </line>
                      
                      {/* Center to bottom-left line */}
                      <line 
                        x1="400" y1="300" x2="150" y2="450" 
                        stroke="#ef4444" 
                        strokeWidth="1.5" 
                        strokeDasharray="5,5"
                        strokeOpacity="0.6"
                      >
                        <animate attributeName="stroke-dashoffset" from="0" to="20" dur="22s" repeatCount="indefinite" />
                        <animate attributeName="stroke-opacity" values="0.6;0.9;0.6" dur="15s" repeatCount="indefinite" />
                      </line>
                    </g>
                    
                    {/* Energy flowing along the triangle edges */}
                    <g>
                      {/* Top to bottom-left energy flow */}
                      <circle r="4" fill="#ef4444" opacity="0.7">
                        <animateMotion 
                          path="M400,100 L150,450" 
                          dur="6s" 
                          repeatCount="indefinite" 
                          rotate="auto"
                        />
                        <animate attributeName="opacity" values="0;0.7;0" dur="6s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Top to bottom-right energy flow */}
                      <circle r="4" fill="var(--color-secondary)" opacity="0.7">
                        <animateMotion 
                          path="M400,100 L650,450" 
                          dur="8s" 
                          repeatCount="indefinite" 
                          rotate="auto"
                        />
                        <animate attributeName="opacity" values="0;0.7;0" dur="8s" repeatCount="indefinite" />
                      </circle>
                      
                      {/* Bottom-right to top energy flow */}
                      <circle r="4" fill="#3b82f6" opacity="0.7">
                        <animateMotion 
                          path="M650,450 L400,100" 
                          dur="7s" 
                          repeatCount="indefinite" 
                          rotate="auto"
                        />
                        <animate attributeName="opacity" values="0;0.7;0" dur="7s" repeatCount="indefinite" />
                      </circle>
                    </g>
                    
                    {/* Pulsating corner nodes */}
                    <circle cx="400" cy="100" r="12" fill="url(#cornerPulse1)">
                      <animate attributeName="r" values="12;14;12" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="650" cy="450" r="12" fill="url(#cornerPulse2)">
                      <animate attributeName="r" values="12;14;12" dur="4.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="150" cy="450" r="12" fill="url(#cornerPulse3)">
                      <animate attributeName="r" values="12;14;12" dur="5s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Small inner connecting dots at corners */}
                    <circle cx="400" cy="100" r="4" fill="#ef4444" fillOpacity="0.8" />
                    <circle cx="650" cy="450" r="4" fill="var(--color-secondary)" fillOpacity="0.8" />
                    <circle cx="150" cy="450" r="4" fill="#3b82f6" fillOpacity="0.8" />
                  </svg>
                  
                  {/* Node 1 - Top of Triangle */}
                  <div className="absolute top-[5%] left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                      <div className="rounded-full bg-gradient-to-br from-red-500/30 to-red-500/10 w-24 h-24 flex items-center justify-center mb-2 transition-all duration-300 hover:scale-110 hover:from-red-500/40 hover:to-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] border border-red-500/20 backdrop-blur-sm hover:rotate-12">
                        <Shield className="h-12 w-12 text-red-500 dark:text-red-400 transition-all duration-300 group-hover:scale-125 drop-shadow-md animate-pulse" />
                      </div>
                      <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border transition-all duration-300 group-hover:shadow-xl group-hover:border-red-500/20 min-w-[220px] text-center mt-3 relative group-hover:-rotate-3 opacity-0 group-hover:opacity-100 absolute top-full left-1/2 transform -translate-x-1/2 z-20">
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500/20"></div>
                        <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 text-red-500 dark:text-red-400 bg-clip-text">Automatic Interception</h3>
                        <p className="text-sm text-foreground/70">Stops threats before they reach you</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Node 2 - Bottom Left Corner of Triangle */}
                  <div className="absolute bottom-[10%] left-[5%] z-10">
                    <div className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                      <div className="rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 w-24 h-24 flex items-center justify-center mb-2 transition-all duration-300 hover:scale-110 hover:from-secondary/40 hover:to-secondary/20 shadow-[0_0_15px_rgba(var(--color-secondary-rgb),0.3)] border border-secondary/20 backdrop-blur-sm hover:rotate-12 dark:from-green-500/30 dark:to-green-500/10 dark:hover:from-green-500/40 dark:hover:to-green-500/20 dark:shadow-[0_0_15px_rgba(34,197,94,0.3)] dark:border-green-500/20">
                        <ShieldAlert className="h-12 w-12 text-secondary dark:text-green-500 transition-all duration-300 group-hover:scale-125 drop-shadow-md animate-pulse" />
                      </div>
                      <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border transition-all duration-300 group-hover:shadow-xl group-hover:border-secondary/20 dark:group-hover:border-green-500/20 min-w-[220px] text-center mt-3 relative group-hover:rotate-3 opacity-0 group-hover:opacity-100 absolute top-0 left-full z-20">
                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-secondary/20 dark:bg-green-500/20"></div>
                        <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 text-secondary dark:text-green-500 bg-clip-text">Intelligent Analysis</h3>
                        <p className="text-sm text-foreground/70">Advanced AI threat detection</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Node 3 - Bottom Right Corner of Triangle */}
                  <div className="absolute bottom-[10%] right-[5%] z-10">
                    <div className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-105">
                      <div className="rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 w-24 h-24 flex items-center justify-center mb-2 transition-all duration-300 hover:scale-110 hover:from-blue-500/40 hover:to-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/20 backdrop-blur-sm hover:-rotate-12">
                        <ShieldCheck className="h-12 w-12 text-blue-500 dark:text-blue-400 transition-all duration-300 group-hover:scale-125 drop-shadow-md animate-pulse" />
                      </div>
                      <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border transition-all duration-300 group-hover:shadow-xl group-hover:border-blue-500/20 min-w-[220px] text-center mt-3 relative group-hover:-rotate-3 opacity-0 group-hover:opacity-100 absolute top-0 right-full z-20">
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-500/20"></div>
                        <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 text-blue-500 dark:text-blue-400 bg-clip-text">Safe Access & Reporting</h3>
                        <p className="text-sm text-foreground/70">Secure content delivery with detailed insights</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Interactive Center Text */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="relative">
                      {/* Outer ring with rotating gradient effect */}
                      <div className="absolute inset-0 rounded-full border-4 border-transparent p-1 animate-[spin_30s_linear_infinite]">
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-red-500 via-secondary to-blue-500 opacity-30"></div>
                      </div>
                      
                      {/* Inner glowing core */}
                      <div className="bg-background/60 backdrop-blur-xl rounded-full p-4 shadow-[0_0_30px_rgba(var(--shadow-rgb),0.25)] border border-border/60 flex items-center justify-center w-36 h-36 transition-all duration-500 hover:scale-110 hover:shadow-[0_0_40px_rgba(var(--shadow-rgb),0.4)] group relative overflow-hidden cursor-pointer">
                        {/* Animated highlight */}
                        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        
                        {/* Animated Rays */}
                        <div className="absolute inset-0 opacity-20 overflow-hidden rounded-full">
                          <div className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 animate-[spin_15s_linear_infinite]">
                            <div className="w-full h-2 bg-red-500 absolute top-1/2 left-0 blur-sm"></div>
                            <div className="w-full h-2 bg-secondary absolute top-1/2 left-0 rotate-60 blur-sm"></div>
                            <div className="w-full h-2 bg-blue-500 absolute top-1/2 left-0 rotate-120 blur-sm"></div>
                          </div>
                        </div>
                        
                        {/* Text Content */}
                        <div className="relative z-10 text-center transform transition-all duration-300 group-hover:scale-105">
                          <div className="text-2xl font-bold bg-gradient-to-r from-red-500 via-secondary to-blue-500 bg-clip-text text-transparent animate-[pulse_5s_ease-in-out_infinite]">ScamBane</div>
                        </div>
                        
                        {/* Company info popup on hover - similar to triangle points */}
                        <div className="bg-card/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-border transition-all duration-300 group-hover:shadow-xl group-hover:border-primary/20 text-center mt-3 absolute opacity-0 group-hover:opacity-100 top-full z-40 min-w-[230px] transform group-hover:translate-y-2">
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-border/50"></div>
                          <h3 className="text-lg font-semibold mb-1 bg-gradient-to-r from-red-500 via-primary to-blue-500 bg-clip-text text-transparent">Matrica Networks</h3>
                          <p className="text-sm text-foreground/80">Pvt Ltd</p>
                          <p className="text-xs text-foreground/60 mt-1">Comprehensive Cybersecurity Solutions</p>
                        </div>
                      </div>
                      
                      {/* Pulsing outer highlight rings */}
                      <div className="absolute -inset-4 rounded-full border border-primary/30 opacity-60 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                      <div className="absolute -inset-6 rounded-full border border-secondary/20 opacity-0 group-hover:opacity-60 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Alternative for Triangle */}
            <div className="md:hidden space-y-8 mt-8">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-gradient-to-br from-red-500/30 to-red-500/10 w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <Shield className="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-red-500 dark:text-red-400">Automatic Interception</h3>
                  <p className="text-sm text-foreground/70">Stops threats before they reach you</p>
                </div>
              </div>
              
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-gradient-to-br from-secondary/30 to-secondary/10 w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-secondary/40 shadow-[0_0_10px_rgba(var(--color-secondary-rgb),0.2)] dark:from-green-500/30 dark:to-green-500/10 dark:shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <ShieldAlert className="h-8 w-8 text-secondary dark:text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-secondary dark:text-green-500">Intelligent Analysis</h3>
                  <p className="text-sm text-foreground/70">Advanced AI threat detection</p>
                </div>
              </div>
              
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm transform transition-all duration-300 hover:scale-102 hover:shadow-md active:scale-98">
                <div className="flex flex-col items-center text-center">
                  <div className="rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300 hover:scale-110 hover:bg-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    <ShieldCheck className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-blue-500 dark:text-blue-400">Safe Access & Reporting</h3>
                  <p className="text-sm text-foreground/70">Secure content delivery with detailed insights</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-foreground/70">
                Choose the plan that works for your security needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-102 hover:bg-gradient-to-b hover:from-background hover:to-muted/30 active:scale-98">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Free</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>10 URL scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>5 File scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Basic threat detection</span>
                  </li>
                  <li className="flex items-center opacity-50">
                    <X className="h-5 w-5 text-destructive mr-2" />
                    <span>No audio & video scanning</span>
                  </li>
                  <li className="flex items-center opacity-50">
                    <X className="h-5 w-5 text-destructive mr-2" />
                    <span>No APK analysis</span>
                  </li>
                  <li className="flex items-center opacity-50">
                    <X className="h-5 w-5 text-destructive mr-2" />
                    <span>No AI-powered detection</span>
                  </li>
                </ul>
                
                <Button className="w-full transition-transform duration-200 hover:scale-105 active:scale-95" variant="outline" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
              
              <div className="bg-gradient-to-b from-background to-muted/10 border border-primary/20 rounded-xl p-6 shadow-lg relative lg:scale-105 z-10 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.07] hover:border-primary/40 active:scale-[1.03]">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full transition-all duration-300 hover:scale-110">
                  Most Popular
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Premium</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">$9.99</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Unlimited URL scans</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>100 File scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Advanced threat detection</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>APK analysis</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Audio & video scanning</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>AI-powered detection</span>
                  </li>
                </ul>
                
                <Button className="w-full transition-transform duration-200 hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" onClick={() => navigate("/auth")}>
                  Upgrade Now
                </Button>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transform transition-all duration-300 hover:shadow-lg hover:scale-102 hover:bg-gradient-to-b hover:from-background hover:to-muted/30 active:scale-98">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Enterprise</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$29.99</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Unlimited all scans</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Priority analysis</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Advanced threat intelligence</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2 transition-transform duration-300 hover:scale-110" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full transition-transform duration-200 hover:scale-105 active:scale-95" onClick={() => navigate("/auth")}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">About ScamBane</h2>
              <p className="text-foreground/70 mb-6">
                ScamBane is a comprehensive cybersecurity platform developed by Matrica Networks Private Limited, dedicated to protecting users from digital threats through advanced scanning and threat detection technologies. Our mission is to make the internet a safer place by offering accessible, intelligent, and user-friendly security tools for individuals and organizations alike.
              </p>
              <p className="text-foreground/70 mb-6">
                Founded by a team of seasoned cybersecurity professionals, ScamBane integrates multiple threat intelligence sources with cutting-edge artificial intelligence to proactively detect and analyze potential risks—ranging from phishing and malware to steganography hidden in multimedia content.
              </p>
              <p className="text-foreground/70 mb-6">
                At ScamBane, we are committed to transparency, privacy, and user empowerment. Our platform doesn't just block threats—it explains them, providing users with clear insights to help them make informed decisions about their digital safety.
              </p>
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={() => navigate("/auth")} 
                  size="lg" 
                  className="transform transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 px-8 py-6 text-lg"
                >
                  Join ScamBane Today
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Download Platforms Section */}
        <section id="platforms" className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Available on All Your Devices</h2>
              <p className="text-foreground/70">
                Download ScamBane for your preferred platform and stay protected everywhere
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {/* Android Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-green-500/30 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <Smartphone className="h-8 w-8 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Android</h3>
                  <p className="text-sm text-foreground/70 mt-2">
                    Download from Google Play Store
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300" 
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.scambane.app', '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" /> Download
                </Button>
              </div>
              
              {/* iOS Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-red-500/30 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/30 to-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <Apple className="h-8 w-8 text-red-500 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">iOS</h3>
                  <p className="text-sm text-foreground/70 mt-2">
                    Download from Apple App Store
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300" 
                  onClick={() => window.open('https://apps.apple.com/app/scambane/id12345678', '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" /> Download
                </Button>
              </div>
              
              {/* Windows Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-500/30 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Laptop className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Windows</h3>
                  <p className="text-sm text-foreground/70 mt-2">
                    Download .exe installer
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300" 
                  onClick={() => window.open('/downloads/scambane-setup.exe', '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" /> Download
                </Button>
              </div>
              
              {/* macOS Card */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-yellow-500/30 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/30 to-yellow-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                    <Apple className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">macOS</h3>
                  <p className="text-sm text-foreground/70 mt-2">
                    Download .dmg installer
                  </p>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300" 
                  onClick={() => window.open('/downloads/scambane-installer.dmg', '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" /> Download
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ScamBane</span>
              </div>
              <p className="text-foreground/70 mb-4">
                Advanced security for the digital age.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">URL Scanning</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">File Analysis</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Image Scanning</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Audio Analysis</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Video Scanning</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#features" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">APK Analysis</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#platforms" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Download Apps</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">About Us</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Contact</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></a></li>
                <li><Link href="/privacy-policy" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Privacy Policy</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></Link></li>
                <li><Link href="/terms-of-service" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><span className="transform transition-transform duration-300 group-hover:scale-105">Terms of Service</span><ArrowRight className="ml-1 h-0 w-0 opacity-0 group-hover:h-4 group-hover:w-4 group-hover:opacity-100 transition-all duration-300" /></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><Twitter className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary" /><span className="transform transition-transform duration-300 group-hover:scale-105">Twitter</span></a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><Linkedin className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary" /><span className="transform transition-transform duration-300 group-hover:scale-105">LinkedIn</span></a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><Github className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary" /><span className="transform transition-transform duration-300 group-hover:scale-105">GitHub</span></a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-flex items-center group"><Mail className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-125 group-hover:text-primary" /><span className="transform transition-transform duration-300 group-hover:scale-105">Email Us</span></a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/60 text-sm">
              © {new Date().getFullYear()} ScamBane. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}