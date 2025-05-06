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
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertTriangle, FileText, Image, Link, Search, Shield, Loader2 } from 'lucide-react';
import { ScanResult } from '@shared/schema';

const ThreatTable = () => {
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch scans
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/scans', page, filterType],
    queryFn: async () => {
      const limit = 10;
      const offset = page * limit;
      const filterParam = filterType !== 'all' ? `&scanType=${filterType}` : '';
      const response = await fetch(`/api/admin/scans?limit=${limit}&offset=${offset}${filterParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scan data');
      }
      
      return await response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const scanTypes = {
    url: { icon: <Link className="h-4 w-4" />, label: 'URL' },
    file: { icon: <FileText className="h-4 w-4" />, label: 'File' },
    image: { icon: <Image className="h-4 w-4" />, label: 'Image' },
    apk: { icon: <Shield className="h-4 w-4" />, label: 'APK' },
  };

  const getScanTypeIcon = (type: string) => {
    return scanTypes[type as keyof typeof scanTypes]?.icon || <FileText className="h-4 w-4" />;
  };

  const getScanTypeLabel = (type: string) => {
    return scanTypes[type as keyof typeof scanTypes]?.label || type;
  };

  const getResultColor = (result: string) => {
    switch (result.toLowerCase()) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'malicious':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'suspicious':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Filter scans based on search query
  const filteredScans = data?.scans?.filter((scan: ScanResult) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      scan.targetName.toLowerCase().includes(query) ||
      (scan.threatType && scan.threatType.toLowerCase().includes(query)) ||
      scan.result.toLowerCase().includes(query)
    );
  });

  const totalPages = data ? Math.ceil(data.pagination?.total / 10) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <p>Failed to load threat data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan Results</h2>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="url">URLs</SelectItem>
                <SelectItem value="file">Files</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="apk">APK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Threat Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScans && filteredScans.length > 0 ? (
                filteredScans.map((scan: any) => (
                  <TableRow key={scan.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center">
                        {getScanTypeIcon(scan.scanType)}
                        <span className="ml-2">{getScanTypeLabel(scan.scanType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate" title={scan.targetName}>
                      {scan.targetName}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getResultColor(scan.result)}`}>
                        {scan.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {scan.threatType || <span className="text-muted-foreground">None</span>}
                    </TableCell>
                    <TableCell>{scan.user?.username || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(scan.createdAt)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedScan(scan)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32">
                    {searchQuery ? (
                      <div className="text-muted-foreground">
                        No results matching "{searchQuery}"
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No scan results found
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {page * 10 + 1}-{Math.min((page + 1) * 10, data?.pagination?.total || 0)} of {data?.pagination?.total || 0} results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Scan Details Dialog */}
      <Dialog open={!!selectedScan} onOpenChange={(open) => !open && setSelectedScan(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scan Details</DialogTitle>
            <DialogDescription>
              {selectedScan?.scanType.toUpperCase()} Scan - {selectedScan?.targetName}
            </DialogDescription>
          </DialogHeader>

          {selectedScan && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Scan Type</h3>
                  <p className="flex items-center">
                    {getScanTypeIcon(selectedScan.scanType)}
                    <span className="ml-2">{getScanTypeLabel(selectedScan.scanType)}</span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Result</h3>
                  <Badge className={`${getResultColor(selectedScan.result)}`}>
                    {selectedScan.result}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Threat Type</h3>
                  <p>{selectedScan.threatType || 'None detected'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p>{formatDate(selectedScan.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User</h3>
                  <p>{selectedScan.user?.username || 'Unknown'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Confidence</h3>
                  <p>{selectedScan.details?.confidence || 'N/A'}%</p>
                </div>
              </div>

              {selectedScan.details?.explanation && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Analysis</h3>
                  <p className="text-sm whitespace-pre-line bg-muted p-3 rounded-md">
                    {selectedScan.details.explanation}
                  </p>
                </div>
              )}

              {selectedScan.details?.scanServices && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Services Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedScan.details.scanServices.map((service: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced details collapsible */}
              <div className="mt-4 border rounded-md p-3">
                <h3 className="text-sm font-medium">Advanced Details</h3>
                <pre className="text-xs mt-2 overflow-x-auto bg-muted p-3 rounded-md">
                  {JSON.stringify(selectedScan.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThreatTable;