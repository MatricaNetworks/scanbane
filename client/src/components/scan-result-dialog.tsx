import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Link as LinkIcon, 
  File, 
  Image as ImageIcon 
} from "lucide-react";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ScanResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any;
}

export function ScanResultDialog({ open, onOpenChange, result }: ScanResultDialogProps) {
  const { toast } = useToast();

  const getScanTypeIcon = useCallback(() => {
    if (!result) return <LinkIcon />;
    
    switch (result.scanType || result.type) {
      case 'url':
        return <LinkIcon className="h-8 w-8" />;
      case 'file':
        return <File className="h-8 w-8" />;
      case 'image':
        return <ImageIcon className="h-8 w-8" />;
      default:
        return <LinkIcon className="h-8 w-8" />;
    }
  }, [result]);

  const getResultIcon = useCallback(() => {
    if (!result) return null;
    
    switch (result.result) {
      case 'safe':
        return <CheckCircle className="h-16 w-16 text-secondary-600" />;
      case 'malicious':
        return <XCircle className="h-16 w-16 text-destructive" />;
      case 'suspicious':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <CheckCircle className="h-16 w-16 text-secondary-600" />;
    }
  }, [result]);

  const getResultClass = useCallback(() => {
    if (!result) return 'bg-green-100 text-secondary-600';
    
    switch (result.result) {
      case 'safe':
        return 'bg-green-100 text-secondary-600';
      case 'malicious':
        return 'bg-red-100 text-destructive';
      case 'suspicious':
        return 'bg-yellow-100 text-yellow-500';
      default:
        return 'bg-green-100 text-secondary-600';
    }
  }, [result]);

  const getResultTitle = useCallback(() => {
    if (!result) return 'Scan Result';
    
    switch (result.result) {
      case 'safe':
        return 'Safe Content';
      case 'malicious':
        return 'Threat Detected!';
      case 'suspicious':
        return 'Suspicious Content';
      default:
        return 'Scan Result';
    }
  }, [result]);

  const getResultDescription = useCallback(() => {
    if (!result) return '';
    
    switch (result.result) {
      case 'safe':
        return 'This content has been analyzed and appears to be safe.';
      case 'malicious':
        return 'This content contains malicious elements and has been blocked.';
      case 'suspicious':
        return 'This content may contain suspicious elements. Proceed with caution.';
      default:
        return '';
    }
  }, [result]);

  const handleDeleteContent = useCallback(() => {
    // In a real implementation, this would delete or quarantine the file
    toast({
      title: "Content deleted",
      description: "The malicious content has been removed.",
    });
    onOpenChange(false);
  }, [toast, onOpenChange]);

  const handleReportFalsePositive = useCallback(() => {
    toast({
      title: "Report submitted",
      description: "Thank you for your feedback. Our team will review this scan.",
    });
    onOpenChange(false);
  }, [toast, onOpenChange]);

  if (!result) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Result</DialogTitle>
        </DialogHeader>
        
        <div className="text-center p-4">
          <div className={`p-3 inline-flex rounded-full ${getResultClass()} mb-4`}>
            {getResultIcon()}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">{getResultTitle()}</h3>
          <p className="text-gray-600 mb-4">{getResultDescription()}</p>
          
          <div className={`p-3 rounded text-left mb-4 ${result.result === 'malicious' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium text-gray-700">Details:</p>
            <div className="flex items-center gap-2 mt-1">
              {getScanTypeIcon()}
              <div>
                <p className="text-sm text-gray-600 font-medium">{result.target || result.targetName}</p>
                <p className="text-sm text-gray-500">
                  {result.scanType?.charAt(0).toUpperCase() || result.type?.charAt(0).toUpperCase() || 'URL'} 
                  {result.type?.slice(1) || result.scanType?.slice(1) || ' Scan'}
                </p>
              </div>
            </div>
            
            {result.threatType && (
              <div className="mt-2">
                <Badge variant={result.result === 'malicious' ? 'destructive' : 'outline'} className="mt-1">
                  {result.threatType.charAt(0).toUpperCase() + result.threatType.slice(1)}
                </Badge>
              </div>
            )}
            
            {result.details && (
              <p className="text-sm text-gray-600 mt-2">
                Confidence: {result.details.confidence}%
              </p>
            )}
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-2">
            {result.result === 'malicious' || result.result === 'suspicious' ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReportFalsePositive}
                >
                  Report False Positive
                </Button>
                {result.result === 'malicious' && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteContent}
                  >
                    Delete Content
                  </Button>
                )}
                {result.result === 'suspicious' && (
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => onOpenChange(false)}
                  >
                    Proceed Anyway
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="default"
                className="w-full"
                style={{ backgroundColor: 'hsl(var(--secondary))' }}
                onClick={() => onOpenChange(false)}
              >
                Proceed Safely
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
