import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Shield,
  Eye,
  Search,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { ScanResult } from '@shared/schema';
import { format } from 'date-fns';

interface ThreatDetailsProps {
  scanResult: ScanResult;
}

const ThreatDetailsView = ({ scanResult }: ThreatDetailsProps) => {
  const details = scanResult.details as Record<string, any> || {};
  const detailsObj = typeof details === 'string' ? JSON.parse(details) : details;
  
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-medium">Scan Summary</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="font-medium">Scan Type:</span>
            <span>{scanResult.scanType}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Target:</span>
            <span className="text-ellipsis overflow-hidden">{scanResult.targetName}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Result:</span>
            <Badge 
              variant={
                scanResult.result === 'safe' ? 'success' :
                scanResult.result === 'suspicious' ? 'warning' : 'destructive'
              }
            >
              {scanResult.result}
            </Badge>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Threat Type:</span>
            <span>{scanResult.threatType || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Date:</span>
            <span>{format(new Date(scanResult.createdAt), 'PPp')}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">User:</span>
            <span>{detailsObj.user?.username || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Confidence score */}
      {detailsObj.confidence !== undefined && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium">Confidence</h3>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                scanResult.result === 'safe' ? 'bg-green-600' :
                scanResult.result === 'suspicious' ? 'bg-amber-500' : 'bg-red-600'
              }`}
              style={{ width: `${(detailsObj.confidence || 0) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm">{Math.round((detailsObj.confidence || 0) * 100)}% confidence</span>
        </div>
      )}

      {/* Explanation */}
      {detailsObj.explanation && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium">Analysis</h3>
          <p className="text-sm whitespace-pre-wrap">{detailsObj.explanation}</p>
        </div>
      )}

      {/* Verdict */}
      {detailsObj.verdict && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium">Verdict</h3>
          <p className="text-sm whitespace-pre-wrap">{detailsObj.verdict}</p>
        </div>
      )}

      {/* Services used */}
      {detailsObj.scanServices && Object.keys(detailsObj.scanServices).length > 0 && (
        <div className="flex flex-col space-y-1">
          <h3 className="text-lg font-medium">Services Used</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(detailsObj.scanServices).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    value.result === 'safe' ? 'bg-green-600' :
                    value.result === 'suspicious' ? 'bg-amber-500' : 'bg-red-600'
                  }`}
                ></div>
                <span className="text-sm">{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data */}
      <div className="flex flex-col space-y-1">
        <h3 className="text-lg font-medium">Raw Data</h3>
        <div className="bg-secondary p-3 rounded-md overflow-x-auto">
          <pre className="text-xs text-muted-foreground">
            {JSON.stringify(detailsObj, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

const ThreatTable = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const pageSize = 10;

  // Fetch scan results
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/scans', page, resultFilter, threatTypeFilter, searchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      if (resultFilter !== 'all') {
        queryParams.append('result', resultFilter);
      }
      
      if (threatTypeFilter !== 'all') {
        queryParams.append('threatType', threatTypeFilter);
      }
      
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/admin/scans?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch scan results');
      }
      return response.json();
    },
  });

  // Status badge styling based on result
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Safe
          </Badge>
        );
      case 'suspicious':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Suspicious
          </Badge>
        );
      case 'malicious':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Malicious
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <p>Failed to load scan results.</p>
      </div>
    );
  }

  // Calculate pagination details
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Threat Management</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search scans..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/scans'] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Result:</span>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="malicious">Malicious</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Threat Type:</span>
            <Select value={threatTypeFilter} onValueChange={setThreatTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="scam">Scam</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="steganography">Steganography</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Threat</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items && data.items.length > 0 ? (
                data.items.map((scan: ScanResult) => (
                  <TableRow key={scan.id}>
                    <TableCell>
                      {format(new Date(scan.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {scan.userId || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {scan.scanType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {scan.targetName}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(scan.result)}
                    </TableCell>
                    <TableCell>
                      {scan.threatType || 'None'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedScan(scan)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Scan Result Details</DialogTitle>
                          </DialogHeader>
                          {selectedScan && <ThreatDetailsView scanResult={selectedScan} />}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No scan results found with the current filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThreatTable;