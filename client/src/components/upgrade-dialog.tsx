import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      const res = await apiRequest("POST", "/api/license/generate", { tier });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upgrade Successful",
        description: `Your account has been upgraded to ${data.tier}. License key: ${data.licenseKey}`,
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Upgrade Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = (tier: string) => {
    setSelectedTier(tier);
    upgradeMutation.mutate(tier);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade Your Protection</DialogTitle>
          <DialogDescription>
            Choose a plan to continue protecting your devices:
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Individual Plan */}
          <Card className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium text-gray-900">Individual</h3>
                <p className="mt-1 text-2xl font-bold text-primary">$5.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">1 device</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Unlimited scans</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Real-time protection</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade("individual")}
                disabled={upgradeMutation.isPending && selectedTier === "individual"}
              >
                {upgradeMutation.isPending && selectedTier === "individual" ? "Processing..." : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Small Company Plan */}
          <Card className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow border-primary">
            <CardContent className="p-0">
              <div className="p-4 bg-primary-50 border-b border-primary">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Small Company</h3>
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">Popular</span>
                </div>
                <p className="mt-1 text-2xl font-bold text-primary">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Up to 5 devices</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Unlimited scans</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Advanced reporting</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade("small")}
                disabled={upgradeMutation.isPending && selectedTier === "small"}
              >
                {upgradeMutation.isPending && selectedTier === "small" ? "Processing..." : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Enterprise Plan */}
          <Card className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-medium text-gray-900">Enterprise</h3>
                <p className="mt-1 text-2xl font-bold text-primary">$99.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Unlimited devices</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Unlimited scans</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">24/7 Premium support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-secondary-600 mr-2" />
                    <span className="text-sm">Custom deployment</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade("enterprise")}
                disabled={upgradeMutation.isPending && selectedTier === "enterprise"}
              >
                {upgradeMutation.isPending && selectedTier === "enterprise" ? "Processing..." : "Contact Sales"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
