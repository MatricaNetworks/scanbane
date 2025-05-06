import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScanResultDialog } from "@/components/scan-result-dialog";
import { useAuth } from "@/hooks/use-auth";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ImageIcon, ImageOff, ShieldCheck, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function ImageScanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const scanMutation = useMutation({
    mutationFn: async (image: File) => {
      const formData = new FormData();
      formData.append('image', image);
      
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
      
      const res = await apiRequest("POST", "/api/scan/image", formData);
      setUploadProgress(100);
      return res.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      setScanResultOpen(true);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    if (selectedImage) {
      scanMutation.mutate(selectedImage);
    } else {
      toast({
        title: "No image selected",
        description: "Please select an image to scan",
        variant: "destructive",
      });
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const getRemainingScans = () => {
    if (!user) return 0;
    return user.subscriptionTier !== 'free' ? '∞' : Math.max(0, 3 - user.scansUsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Image Scan" />
        
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
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-4">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>Image Scan</CardTitle>
                    <CardDescription>
                      Detect steganography and hidden malicious code in images
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!previewUrl ? (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center border-gray-300 hover:border-gray-400 transition-colors">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Drag and drop image here
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to browse images
                        <span className="text-xs block mt-1">
                          (JPEG, PNG, GIF, and other image formats)
                        </span>
                      </p>
                      <Input
                        type="file"
                        className="hidden"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <ImageIcon className="h-5 w-5 text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedImage?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB - {selectedImage?.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedImage}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="relative rounded-md overflow-hidden h-48 bg-gray-100">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="object-contain w-full h-full"
                        />
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
                    style={{ backgroundColor: 'rgb(147, 51, 234)' }}
                    disabled={!selectedImage || scanMutation.isPending}
                    onClick={handleScan}
                  >
                    {scanMutation.isPending ? "Scanning..." : "Scan Image"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="text-lg font-medium">About Steganography Detection</div>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 mt-1">
                      <ImageOff className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">What is Steganography?</h3>
                      <p className="text-sm text-gray-600">
                        Steganography is the practice of hiding secret data within ordinary, non-secret files or messages.
                        Attackers can hide malware or exfiltrate data in normal-looking images.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 mt-1">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">How ScamBane Detects Hidden Content</h3>
                      <p className="text-sm text-gray-600">
                        Our advanced AI and least significant bit (LSB) analysis can identify suspicious patterns
                        and anomalies that indicate hidden content in images, protecting you from stealth attacks.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3 mt-1">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">When to Use Image Scanning</h3>
                      <p className="text-sm text-gray-600">
                        Scan images you receive from unknown sources, download from the internet, or that seem suspicious.
                        Especially important for organizations handling sensitive information.
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
