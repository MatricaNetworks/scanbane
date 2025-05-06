import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScanResultDialog } from "@/components/scan-result-dialog";
// import { useAuth } from "@/hooks/use-auth";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, File, FileLock, FileWarning, Shield, ShieldCheck, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function FileScanPage() {
  // Mock user data for demo
  const user = {
    id: 1,
    username: "demo",
    subscriptionTier: "free",
    scansUsed: 1
  };
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const scanMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate upload progress
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          setUploadProgress(Math.min(progress, 95));
          if (progress >= 95) clearInterval(interval);
        }, 100);
      };
      
      simulateProgress();
      
      const res = await apiRequest("POST", "/api/scan/file", formData);
      setUploadProgress(100);
      return res.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      setScanResultOpen(true);
      setSelectedFile(null);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      if (error.message.includes("403")) {
        // Trial limit reached
        setUpgradeOpen(true);
      } else {
        toast({
          title: "Scan Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleScan = () => {
    if (selectedFile) {
      scanMutation.mutate(selectedFile);
    } else {
      toast({
        title: "No file selected",
        description: "Please select a file to scan",
        variant: "destructive",
      });
    }
  };

  const getRemainingScans = () => {
    if (!user) return 0;
    return user.subscriptionTier !== 'free' ? '∞' : Math.max(0, 3 - user.scansUsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="File Scan" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {user?.subscriptionTier === 'free' && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    You have {getRemainingScans()} {getRemainingScans() === 1 ? 'scan' : 'scans'} remaining in your trial
                  </p>
                  <p className="text-xs text-gray-600">
                    Upgrade to unlock unlimited scans and advanced features
                  </p>
                </div>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="ml-auto" 
                  onClick={() => setUpgradeOpen(true)}
                >
                  Upgrade
                </Button>
              </div>
            )}

            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-secondary-600 mr-4">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>File Scan</CardTitle>
                    <CardDescription>
                      Analyze files for malware and other threats
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-gray-400 transition-colors">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Drag and drop file here
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files 
                      <span className="text-xs block mt-1">
                        (PDF, EXE, ZIP, MSI, APK, and other files)
                      </span>
                    </p>
                    <Input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Select File
                    </Button>
                  </div>

                  {selectedFile && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB - {selectedFile.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uploading and scanning...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <Button 
                    type="button" 
                    className="w-full" 
                    disabled={!selectedFile || scanMutation.isPending}
                    onClick={handleScan}
                  >
                    {scanMutation.isPending ? "Scanning..." : "Scan File"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="text-lg font-medium">How File Scanning Works</div>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-green-100 text-secondary-600 mr-3 mt-1">
                      <FileLock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Comprehensive Analysis</h3>
                      <p className="text-sm text-gray-600">
                        ScamBane examines files for known malware signatures, suspicious code patterns,
                        and anomalous behaviors that could indicate a threat.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-green-100 text-secondary-600 mr-3 mt-1">
                      <FileWarning className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Safe Quarantine</h3>
                      <p className="text-sm text-gray-600">
                        Infected files are automatically quarantined to prevent them from harming your system.
                        You can review and permanently delete them later.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-green-100 text-secondary-600 mr-3 mt-1">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Real-Time Protection</h3>
                      <p className="text-sm text-gray-600">
                        On desktop, ScamBane automatically scans all downloads in real-time before they can
                        be opened, keeping your system safe from malicious content.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-green-100 text-secondary-600 mr-3 mt-1">
                      <AndroidLogo className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">APK Security Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Specialized scanning for Android application packages (APKs) to detect malicious code,
                        excessive permissions, and backdoors before installation on your device.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <ScanResultDialog 
        open={scanResultOpen} 
        onOpenChange={setScanResultOpen}
        result={scanResult}
      />
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
