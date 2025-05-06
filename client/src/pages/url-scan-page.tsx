import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { urlScanSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScanResultDialog } from "@/components/scan-result-dialog";
import { useAuth } from "@/hooks/use-auth";
import { UpgradeDialog } from "@/components/upgrade-dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Link, Shield, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UrlScanPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanResultOpen, setScanResultOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const form = useForm<z.infer<typeof urlScanSchema>>({
    resolver: zodResolver(urlScanSchema),
    defaultValues: {
      url: "",
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof urlScanSchema>) => {
      const res = await apiRequest("POST", "/api/scan/url", data);
      return res.json();
    },
    onSuccess: (data) => {
      setScanResult(data);
      setScanResultOpen(true);
      form.reset();
    },
    onError: (error: any) => {
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

  const onSubmit = (data: z.infer<typeof urlScanSchema>) => {
    scanMutation.mutate(data);
  };

  const getRemainingScans = () => {
    if (!user) return 0;
    return user.subscriptionTier !== 'free' ? '∞' : Math.max(0, 3 - user.scansUsed);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="URL Scan" />
        
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
                  <div className="p-2 rounded-full bg-blue-100 text-primary mr-4">
                    <Link className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>URL Scan</CardTitle>
                    <CardDescription>
                      Check URLs for phishing, malware, and other threats
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enter URL to scan</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            We'll check this URL for phishing, malware, and other security risks
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={scanMutation.isPending}
                    >
                      {scanMutation.isPending ? "Scanning..." : "Scan URL"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="text-lg font-medium">How URL Scanning Works</div>
              
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100 text-primary mr-3 mt-1">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">URL Interception</h3>
                      <p className="text-sm text-gray-600">
                        ScamBane intercepts links opened from browsers, messaging apps, and across the system.
                        Each link is analyzed before it's allowed to load.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100 text-primary mr-3 mt-1">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Multi-Layer Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Our system checks URLs against multiple threat databases including VirusTotal, Google Safe Browsing, 
                        and uses AI to detect previously unknown threats.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-100 text-primary mr-3 mt-1">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Immediate Protection</h3>
                      <p className="text-sm text-gray-600">
                        If a URL is found to be malicious, ScamBane blocks access instantly, preventing 
                        potential data theft, malware infection, or account compromise.
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
