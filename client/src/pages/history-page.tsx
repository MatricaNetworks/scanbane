import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScanResultDialog } from "@/components/scan-result-dialog";
import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { 
  Check, 
  AlertTriangle, 
  X, 
  Link as LinkIcon, 
  File, 
  Image as ImageIcon,
  Search,
  Filter,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

export default function HistoryPage() {
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: scanHistory, isLoading, isError } = useQuery({
    queryKey: ["/api/scan/history"],
  });

  const handleScanClick = (scan: any) => {
    // Transform scan data to match the format expected by ScanResultDialog
    const transformedScan = {
      result: scan.result,
      threatType: scan.threatType,
      target: scan.targetName,
      scanType: scan.scanType,
      details: scan.details
    };
    
    setSelectedScan(transformedScan);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/scan/history"] });
  };

  const filteredHistory = scanHistory 
    ? scanHistory.filter((scan: any) => {
        // Apply type filter
        const typeMatch = filterType === "all" || scan.scanType === filterType;
        
        // Apply search query
        const searchMatch = searchQuery === "" || 
          scan.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (scan.threatType && scan.threatType.toLowerCase().includes(searchQuery.toLowerCase()));
        
        return typeMatch && searchMatch;
      })
    : [];

  const getStatusIcon = (result: string) => {
    switch (result) {
      case "safe":
        return <Check className="h-5 w-5 text-secondary-600" />;
      case "suspicious":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "malicious":
        return <X className="h-5 w-5 text-destructive" />;
      default:
        return <Check className="h-5 w-5 text-secondary-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "url":
        return <LinkIcon className="h-5 w-5 text-blue-500" />;
      case "file":
        return <File className="h-5 w-5 text-green-600" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <LinkIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (result: string) => {
    switch (result) {
      case "safe":
        return <Badge variant="outline" className="bg-green-50 text-secondary-600 hover:bg-green-50">Safe</Badge>;
      case "suspicious":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 hover:bg-yellow-50">Suspicious</Badge>;
      case "malicious":
        return <Badge variant="destructive">Malicious</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title="Scan History" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Scan History</h1>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center relative">
                  <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search scans..."
                    className="pl-8 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-40">
                      <div className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="url">URL Scans</SelectItem>
                      <SelectItem value="file">File Scans</SelectItem>
                      <SelectItem value="image">Image Scans</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <Card>
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-gray-500">Loading scan history...</p>
                </div>
              ) : isError ? (
                <div className="p-8 text-center">
                  <p className="text-destructive">Failed to load scan history. Please try again later.</p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    {searchQuery || filterType !== "all"
                      ? "No matching scan results found. Try adjusting your filters."
                      : "No scan history yet. Start by scanning a URL, file, or image."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Threat Type</TableHead>
                        <TableHead>Date & Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((scan: any) => (
                        <TableRow 
                          key={scan.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleScanClick(scan)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(scan.scanType)}
                              <span className="capitalize">{scan.scanType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {scan.targetName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(scan.result)}
                              {getStatusBadge(scan.result)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {scan.threatType 
                              ? <span className="capitalize">{scan.threatType}</span> 
                              : <span className="text-gray-400">None</span>}
                          </TableCell>
                          <TableCell>
                            {scan.createdAt ? format(new Date(scan.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
      
      <ScanResultDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        result={selectedScan}
      />
    </div>
  );
}
