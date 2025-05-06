import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Tablet, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Link as LinkIcon,
  FileDown,
  ImageOff,
  Bell,
  ShieldCheck
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom Icons Component
function AndroidLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M17.523 15.3414C17.523 16.0156 16.9716 16.5669 16.2974 16.5669H8.40165C7.72744 16.5669 7.17615 16.0156 7.17615 15.3414V8.67116C7.17615 7.99695 7.72744 7.44566 8.40165 7.44566H16.2974C16.9716 7.44566 17.523 7.99695 17.523 8.67116V15.3414Z" />
      <path d="M6.84995 2.16602C6.08042 2.16602 5.45605 2.79038 5.45605 3.55992V19.6642C5.45605 20.4337 6.08042 21.0581 6.84995 21.0581H18.0447C18.8142 21.0581 19.4386 20.4337 19.4386 19.6642V3.55992C19.4386 2.79038 18.8142 2.16602 18.0447 2.16602H6.84995ZM6.84995 0.772124H18.0447C19.5968 0.772124 20.8325 2.00782 20.8325 3.55992V19.6642C20.8325 21.2163 19.5968 22.452 18.0447 22.452H6.84995C5.29784 22.452 4.06215 21.2163 4.06215 19.6642V3.55992C4.06215 2.00782 5.29784 0.772124 6.84995 0.772124Z" />
    </svg>
  );
}

function AppleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.153-.231-1.725-.751-.367-.32-.83-.87-1.389-1.652-.594-.829-1.086-1.79-1.473-2.881-.418-1.192-.628-2.344-.628-3.455 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z" />
    </svg>
  );
}

function Windows(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  );
}

function Apple(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M22.368 12.9726C22.3665 11.3443 22.9681 9.76292 24.0664 8.57373C22.9205 6.96355 21.052 6.01807 19.0733 6.00131C16.9718 5.79158 14.9255 7.23047 13.858 7.23047C12.7657 7.23047 11.0821 6.02125 9.33606 6.05296C7.08819 6.11639 5.0612 7.42029 4.03261 9.43976C1.85333 13.5765 3.45874 19.651 5.5325 22.9203C6.56363 24.5222 7.77028 26.3347 9.36133 26.2666C10.9077 26.1937 11.4879 25.2587 13.3351 25.2587C15.1572 25.2587 15.7073 26.2666 17.3339 26.2212C18.9954 26.1937 20.0406 24.5825 21.0347 22.9636C21.8021 21.7197 22.3606 20.3587 22.6861 18.9311C20.2017 17.9164 18.5728 15.5789 18.5801 12.9726" transform="scale(0.9)" />
      <path d="M9 4C10.9888 4.00242 12.8601 4.77848 14.2216 6.14485C15.5831 7.51121 16.3476 9.3867 16.3374 11.3755C16.3374 11.7989 16.2991 12.2223 16.2226 12.6394C14.2 12.1181 12.0499 12.4218 10.2709 13.4743C8.49196 14.5268 7.23843 16.2335 6.78711 18.2196" transform="scale(0.9)" />
    </svg>
  );
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">ScamBane</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl">
                Advanced Cybersecurity Protection
              </h1>
              <p className="mt-6 text-xl">
                Download ScamBane and protect your devices from phishing, malware, 
                and other cyber threats in real-time.
              </p>
              <div className="mt-10">
                <Tabs defaultValue="mobile" className="max-w-md mx-auto">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="mobile">Mobile</TabsTrigger>
                    <TabsTrigger value="desktop">Desktop</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="mobile" className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
                    <a href="https://play.google.com/store/apps/details?id=com.scambane" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full sm:w-auto gap-2 bg-gray-800 hover:bg-gray-900">
                        <AndroidLogo className="h-5 w-5" />
                        Android
                      </Button>
                    </a>
                    <a href="https://apps.apple.com/app/id123456789" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full sm:w-auto gap-2 bg-gray-800 hover:bg-gray-900 mt-3 sm:mt-0">
                        <AppleLogo className="h-5 w-5" />
                        iOS
                      </Button>
                    </a>
                  </TabsContent>
                  
                  <TabsContent value="desktop" className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
                    <a href="https://scambane.com/downloads/scambane-setup.exe" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full sm:w-auto gap-2 bg-gray-800 hover:bg-gray-900">
                        <Windows className="h-5 w-5" />
                        Windows
                      </Button>
                    </a>
                    <a href="https://scambane.com/downloads/scambane-mac.dmg" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full sm:w-auto gap-2 bg-gray-800 hover:bg-gray-900 mt-3 sm:mt-0">
                        <Apple className="h-5 w-5" />
                        macOS
                      </Button>
                    </a>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Comprehensive Protection</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                ScamBane offers multi-layered security to keep you safe from modern cyber threats.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-blue-100 text-primary p-3 rounded-full w-fit mb-4">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">URL Interception</h3>
                  <p className="text-gray-600">
                    Intercepts links from all apps including WhatsApp, Telegram, SMS, browsers and more. 
                    Blocks access to malicious URLs before they can harm you.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-green-100 text-secondary-600 p-3 rounded-full w-fit mb-4">
                    <FileDown className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Download Protection</h3>
                  <p className="text-gray-600">
                    Analyses all downloads (PDFs, executables, images) before access. 
                    Malicious content is instantly blocked and deleted.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-fit mb-4">
                    <ImageOff className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Steganography Detection</h3>
                  <p className="text-gray-600">
                    Detects hidden malware in images using advanced AI techniques and 
                    least significant bit detection technology.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-amber-100 text-amber-600 p-3 rounded-full w-fit mb-4">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smishing Defense</h3>
                  <p className="text-gray-600">
                    Scans SMS messages to extract and analyze suspicious URLs in real-time
                    using advanced AI detection algorithms.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-red-100 text-red-600 p-3 rounded-full w-fit mb-4">
                    <Bell className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Real-Time Alerts</h3>
                  <p className="text-gray-600">
                    Get instant notifications about detected threats using Firebase Cloud Messaging
                    and native notification systems.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-fit mb-4">
                    <Tablet className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Cross-Platform Protection</h3>
                  <p className="text-gray-600">
                    Available on Android, iOS, Windows, and macOS. Synchronized protection
                    across all your devices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">Download ScamBane Today</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Get protected on all your devices with our easy-to-use applications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <AndroidLogo className="h-16 w-16 mx-auto text-gray-800" />
                    <h3 className="text-xl font-semibold mt-4">Android</h3>
                    <p className="text-gray-500 mt-1">Via Google Play Store</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Full system integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Real-time URL interception</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">SMS protection</span>
                    </li>
                  </ul>
                  <a href="https://play.google.com/store/apps/details?id=com.scambane" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">Download</Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <AppleLogo className="h-16 w-16 mx-auto text-gray-800" />
                    <h3 className="text-xl font-semibold mt-4">iOS</h3>
                    <p className="text-gray-500 mt-1">Via App Store</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Share extension</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Shortcuts integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Image analysis</span>
                    </li>
                  </ul>
                  <a href="https://apps.apple.com/app/id123456789" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">Download</Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <Windows className="h-16 w-16 mx-auto text-gray-800" />
                    <h3 className="text-xl font-semibold mt-4">Windows</h3>
                    <p className="text-gray-500 mt-1">Direct download</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Browser integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Download monitoring</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">File scan protection</span>
                    </li>
                  </ul>
                  <a href="https://scambane.com/downloads/scambane-setup.exe" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">Download</Button>
                  </a>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <Apple className="h-16 w-16 mx-auto text-gray-800" />
                    <h3 className="text-xl font-semibold mt-4">macOS</h3>
                    <p className="text-gray-500 mt-1">DMG package</p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Native integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">URL filtering</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                      <span className="text-sm">Download protection</span>
                    </li>
                  </ul>
                  <a href="https://scambane.com/downloads/scambane-mac.dmg" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full">Download</Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Web Demo CTA */}
        <section className="py-16 bg-primary text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Try ScamBane Online</h2>
            <p className="mt-4 text-xl max-w-2xl mx-auto">
              Not ready to download? Try our web scanner to check URLs, files, and images for threats.
            </p>
            <div className="mt-8">
              <Link href="/auth">
                <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-gray-100">
                  Try Web Scanner
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <ShieldCheck className="h-6 w-6 text-primary mr-2" />
                <span className="text-xl font-bold">ScamBane</span>
              </div>
              <p className="mt-4 text-gray-400">
                Advanced cybersecurity protection for all your devices.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Mobile Apps</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Desktop Apps</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Web Scanner</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Enterprise Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Security Tips</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ScamBane Security. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
