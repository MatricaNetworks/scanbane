import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useState } from "react";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { ScanResultDialog } from "@/components/scan-result-dialog";
import {
  Check,
  AlertTriangle,
  X,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
  Clock,
  ShieldCheck,
  MessageSquare,
  FileDown,
  ImageOff,
  Bell,
  Tablet
} from "lucide-react";

export default function HomePage() {
  // Mock user data for demo purposes
  const user = {
    id: 1,
    username: "demo",
    subscriptionTier: "free",
    scansUsed: 1
  };
  
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  // Mock recent scans for demo
  const recentScans = [
    {
      id: 1,
      userId: 1,
      scanType: "url",
      targetName: "https://example-phishing.com",
      result: "malicious",
      threatType: "phishing",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      details: { confidence: 95 }
    },
    {
      id: 2,
      userId: 1,
      scanType: "file",
      targetName: "suspicious_file.exe",
      result: "suspicious",
      threatType: "potential malware",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      details: { confidence: 75 }
    },
    {
      id: 3,
      userId: 1,
      scanType: "image",
      targetName: "photo.jpg",
      result: "safe",
      threatType: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      details: { confidence: 98 }
    }
  ];

  const handleUrlSubmit = async (url: string) => {
    // This would be handled by the URL scan page
    // Just for demo, we'll show the scan result dialog
    const isMalicious = Math.random() < 0.3;
    setScanResult({
      result: isMalicious ? "malicious" : "safe",
      threatType: isMalicious ? "phishing" : null,
      target: url,
      scanType: "url"
    });
    setScanResultOpen(true);
  };

  const getRemainingScans = () => {
    if (!user) return 0;
    return user.subscriptionTier !== 'free' ? '∞' : Math.max(0, 3 - user.scansUsed);
  };

  const getScanStatusIcon = (result: string) => {
    switch (result) {
      case 'safe':
        return <Check className="text-secondary-600" />;
      case 'suspicious':
        return <AlertTriangle className="text-yellow-500" />;
      case 'malicious':
        return <X className="text-destructive" />;
      default:
        return <Check className="text-secondary-600" />;
    }
  };

  const getScanStatusBg = (result: string) => {
    switch (result) {
      case 'safe':
        return 'bg-green-100';
      case 'suspicious':
        return 'bg-yellow-100';
      case 'malicious':
        return 'bg-red-100';
      default:
        return 'bg-green-100';
    }
  };

  const getScanStatusText = (result: string) => {
    switch (result) {
      case 'safe':
        return 'text-secondary-600';
      case 'suspicious':
        return 'text-yellow-500';
      case 'malicious':
        return 'text-destructive';
      default:
        return 'text-secondary-600';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {/* Welcome Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Welcome to ScamBane!</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Your comprehensive protection against phishing, malware, and other cyber threats.
                  </p>
                </div>
                
                {user?.subscriptionTier === 'free' && (
                  <div className="mt-4 md:mt-0 p-3 bg-orange-50 text-warning-500 rounded-md flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">
                        {getRemainingScans()} {getRemainingScans() === 1 ? 'scan' : 'scans'} remaining in trial
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs font-medium text-primary hover:text-primary/90"
                        onClick={() => setUpgradeOpen(true)}
                      >
                        Upgrade now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Scan Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">Quick Scan</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* URL Scan Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-primary">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-800">URL Scan</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Detect phishing and malicious websites before accessing them.
                  </p>
                  <div className="mt-4">
                    <Link href="/url-scan">
                      <Button className="w-full" variant="default">
                        Scan URL
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* File Scan Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-secondary-600">
                      <File className="h-5 w-5" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-800">File Scan</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Check files for viruses, malware, and other threats.
                  </p>
                  <div className="mt-4">
                    <Link href="/file-scan">
                      <Button className="w-full" variant="default" style={{ backgroundColor: 'hsl(var(--secondary))' }}>
                        Scan File
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Image Scan Card */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-800">Image Scan</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Detect steganography and hidden malicious code in images.
                  </p>
                  <div className="mt-4">
                    <Link href="/image-scan">
                      <Button className="w-full" style={{ backgroundColor: 'rgb(147, 51, 234)' }}>
                        Scan Image
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Scans and Downloads */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scans */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Recent Scans</h2>
                <Link href="/history">
                  <Button variant="link" className="text-primary">
                    View all
                  </Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-0">
                  {!recentScans || recentScans.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No scan history yet. Start by scanning a URL, file, or image.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {recentScans.slice(0, 5).map((scan: any) => (
                        <li key={scan.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <span className={`p-2 rounded-full ${getScanStatusBg(scan.result)} ${getScanStatusText(scan.result)}`}>
                                {getScanStatusIcon(scan.result)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {scan.targetName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {scan.scanType.charAt(0).toUpperCase() + scan.scanType.slice(1)} Scan
                                {scan.threatType ? ` - ${scan.threatType}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {new Date(scan.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Download Section */}
            <div>
              <h2 className="mb-4 text-lg font-medium text-gray-800">Download ScamBane</h2>
              <Card>
                <CardContent className="p-5">
                  <p className="mb-4 text-sm text-gray-600">
                    Install ScamBane on all your devices for complete protection:
                  </p>
                  
                  <div className="space-y-3">
                    <Link href="https://play.google.com/store/apps/details?id=com.scambane">
                      <Button variant="outline" className="w-full justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.523 15.3414C17.523 16.0156 16.9716 16.5669 16.2974 16.5669H8.40165C7.72744 16.5669 7.17615 16.0156 7.17615 15.3414V8.67116C7.17615 7.99695 7.72744 7.44566 8.40165 7.44566H16.2974C16.9716 7.44566 17.523 7.99695 17.523 8.67116V15.3414Z" />
                          <path d="M6.84995 2.16602C6.08042 2.16602 5.45605 2.79038 5.45605 3.55992V19.6642C5.45605 20.4337 6.08042 21.0581 6.84995 21.0581H18.0447C18.8142 21.0581 19.4386 20.4337 19.4386 19.6642V3.55992C19.4386 2.79038 18.8142 2.16602 18.0447 2.16602H6.84995ZM6.84995 0.772124H18.0447C19.5968 0.772124 20.8325 2.00782 20.8325 3.55992V19.6642C20.8325 21.2163 19.5968 22.452 18.0447 22.452H6.84995C5.29784 22.452 4.06215 21.2163 4.06215 19.6642V3.55992C4.06215 2.00782 5.29784 0.772124 6.84995 0.772124Z" />
                        </svg>
                        <div className="text-left">
                          <span className="text-sm font-medium text-gray-900">Android</span>
                          <p className="text-xs text-gray-500">Play Store</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="https://apps.apple.com/app/id123456789">
                      <Button variant="outline" className="w-full justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.019-1.153-.231-1.725-.751-.367-.32-.83-.87-1.389-1.652-.594-.829-1.086-1.79-1.473-2.881-.418-1.192-.628-2.344-.628-3.455 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z" />
                        </svg>
                        <div className="text-left">
                          <span className="text-sm font-medium text-gray-900">iOS</span>
                          <p className="text-xs text-gray-500">App Store</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="https://scambane.com/downloads/scambane-setup.exe">
                      <Button variant="outline" className="w-full justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                        </svg>
                        <div className="text-left">
                          <span className="text-sm font-medium text-gray-900">Windows</span>
                          <p className="text-xs text-gray-500">.exe installer</p>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="https://scambane.com/downloads/scambane-mac.dmg">
                      <Button variant="outline" className="w-full justify-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.368 12.9726C22.3665 11.3443 22.9681 9.76292 24.0664 8.57373C22.9205 6.96355 21.052 6.01807 19.0733 6.00131C16.9718 5.79158 14.9255 7.23047 13.858 7.23047C12.7657 7.23047 11.0821 6.02125 9.33606 6.05296C7.08819 6.11639 5.0612 7.42029 4.03261 9.43976C1.85333 13.5765 3.45874 19.651 5.5325 22.9203C6.56363 24.5222 7.77028 26.3347 9.36133 26.2666C10.9077 26.1937 11.4879 25.2587 13.3351 25.2587C15.1572 25.2587 15.7073 26.2666 17.3339 26.2212C18.9954 26.1937 20.0406 24.5825 21.0347 22.9636C21.8021 21.7197 22.3606 20.3587 22.6861 18.9311C20.2017 17.9164 18.5728 15.5789 18.5801 12.9726" transform="scale(0.9)" />
                          <path d="M9 4C10.9888 4.00242 12.8601 4.77848 14.2216 6.14485C15.5831 7.51121 16.3476 9.3867 16.3374 11.3755C16.3374 11.7989 16.2991 12.2223 16.2226 12.6394C14.2 12.1181 12.0499 12.4218 10.2709 13.4743C8.49196 14.5268 7.23843 16.2335 6.78711 18.2196" transform="scale(0.9)" />
                        </svg>
                        <div className="text-left">
                          <span className="text-sm font-medium text-gray-900">macOS</span>
                          <p className="text-xs text-gray-500">.dmg package</p>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Overview */}
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-medium text-gray-800">ScamBane Features</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <LinkIcon className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">URL Interception</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Intercepts links from all apps including WhatsApp, Telegram, SMS, browsers and more. 
                    Blocks access to malicious URLs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <MessageSquare className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">Smishing Defense</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scans SMS messages to extract and analyze suspicious URLs in real-time using advanced AI detection.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <FileDown className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">Download Protection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Analyses all downloads (PDFs, executables, images) before access. 
                    Malicious content is instantly blocked and deleted.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <ImageOff className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">Steganography Detection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Detects hidden malware in images using advanced AI techniques and least significant bit detection.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <Bell className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">Push Notifications</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Real-time alerts on detected threats using Firebase Cloud Messaging and native notification systems.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center mb-3">
                    <Tablet className="text-primary mr-2 h-5 w-5" />
                    <h3 className="text-base font-medium text-gray-800">Cross-Platform</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Available on Android, iOS, Windows, and macOS. Synchronized protection across all your devices.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <ScanResultDialog 
        open={scanResultOpen} 
        onOpenChange={setScanResultOpen}
        result={scanResult}
      />
    </div>
  );
}
