import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Shield, ShieldCheck, ShieldAlert, Globe, FileText, Image, Smartphone, ArrowRight, Menu, X } from 'lucide-react';

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
                  <span className="block">Advanced</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Security Scanning</span>
                  <span className="block">for the Digital Age</span>
                </h1>
                <p className="text-xl text-foreground/70 max-w-md">
                  Protect yourself from online threats with our comprehensive security platform. Scan URLs, files, and images for malware, phishing, and hidden threats.
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <Button size="lg" onClick={() => navigate("/auth")}>
                    Start Scanning <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-background" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70">
                    Trusted by <span className="font-bold">10,000+</span> users
                  </p>
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
                        <div className="bg-background/50 rounded-md p-4 flex items-center">
                          <Globe className="h-5 w-5 text-primary mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">URL Scanner</p>
                            <div className="h-2 bg-primary/10 rounded-full mt-1">
                              <div className="h-2 bg-primary rounded-full w-2/3" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center">
                          <FileText className="h-5 w-5 text-secondary mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">File Analysis</p>
                            <div className="h-2 bg-secondary/10 rounded-full mt-1">
                              <div className="h-2 bg-secondary rounded-full w-1/2" />
                            </div>
                          </div>
                        </div>
                        <div className="bg-background/50 rounded-md p-4 flex items-center">
                          <Image className="h-5 w-5 text-primary mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Image Steganography Detection</p>
                            <div className="h-2 bg-primary/10 rounded-full mt-1">
                              <div className="h-2 bg-primary rounded-full w-4/5" />
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
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">URL Scanning</h3>
                <p className="text-foreground/70">
                  Analyze URLs for phishing attempts, malware distribution, and fraudulent websites before you visit them.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">File Analysis</h3>
                <p className="text-foreground/70">
                  Scan files for malware, viruses, and other threats before opening them to ensure your system stays protected.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Image Scanning</h3>
                <p className="text-foreground/70">
                  Detect hidden messages and malicious code embedded in images using advanced steganography detection.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">APK Analysis</h3>
                <p className="text-foreground/70">
                  Check Android applications for suspicious permissions, hidden functionality, and potential malware before installation.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Threat Intelligence</h3>
                <p className="text-foreground/70">
                  Leverage multiple security APIs including VirusTotal, Google SafeBrowsing, AbuseIPDB, and more for comprehensive threat detection.
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-full bg-secondary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
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
                Our multi-layered approach ensures comprehensive protection against various cyber threats
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-4">
              <div className="flex flex-col items-center text-center p-6">
                <div className="relative">
                  <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-primary/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit for Analysis</h3>
                <p className="text-foreground/70">
                  Upload a file, paste a URL, or select an image for scanning through our intuitive interface.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="relative">
                  <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-primary/30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-layered Scanning</h3>
                <p className="text-foreground/70">
                  Our system analyzes your submission using multiple security APIs and AI-powered detection engines.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Comprehensive Results</h3>
                <p className="text-foreground/70">
                  Receive detailed analysis results with clear threat indicators and recommendations for safe browsing.
                </p>
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
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Free</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>10 URL scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>5 File scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Basic threat detection</span>
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
                
                <Button className="w-full" variant="outline" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
              
              <div className="bg-gradient-to-b from-background to-muted/10 border border-primary/20 rounded-xl p-6 shadow-lg relative lg:scale-105 z-10">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                  Most Popular
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Premium</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited URL scans</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>100 File scans per day</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced threat detection</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>APK analysis</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>AI-powered detection</span>
                  </li>
                </ul>
                
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Upgrade Now
                </Button>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-foreground/70">Enterprise</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$29.99</span>
                    <span className="text-foreground/70">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Unlimited all scans</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority analysis</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced threat intelligence</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span>Dedicated support</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
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
                ScamBane is a comprehensive cybersecurity platform designed to protect users from digital threats through advanced scanning technologies. Our mission is to make the internet safer by providing accessible security tools for everyone.
              </p>
              <p className="text-foreground/70 mb-6">
                Founded by a team of cybersecurity experts, ScamBane combines multiple threat intelligence sources with artificial intelligence to detect and analyze potential security risks before they can harm you.
              </p>
              <p className="text-foreground/70 mb-6">
                We believe in transparency, privacy, and user education. That's why our platform not only identifies threats but also explains them, helping users understand and make informed decisions about their digital safety.
              </p>
              <div className="flex justify-center mt-8">
                <Button onClick={() => navigate("/auth")} size="lg">
                  Join ScamBane Today
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
                Advanced security scanning for the digital age.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">URL Scanning</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">File Analysis</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Image Scanning</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">APK Analysis</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-foreground/70 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">GitHub</a></li>
                <li><a href="#" className="text-foreground/70 hover:text-primary transition-colors">Email Us</a></li>
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