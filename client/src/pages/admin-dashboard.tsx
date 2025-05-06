import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { Loader2, AlertTriangle, ShieldCheck, Shield, Users, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import ThreatTable from '@/components/admin/threat-table';
import UserManagement from '@/components/admin/user-management';
import StatsCards from '@/components/admin/stats-cards';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not an admin user
  if (!user) return null; // Wait for authentication check
  if (user.role !== 'admin') {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access the admin dashboard.",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  // Fetch dashboard stats
  const { data: resultStats, isLoading: resultStatsLoading } = useQuery({
    queryKey: ['/api/admin/stats/results'],
    retry: false,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: threatStats, isLoading: threatStatsLoading } = useQuery({
    queryKey: ['/api/admin/stats/threats'],
    retry: false,
    refetchInterval: 30000,
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['/api/admin/stats/users'],
    retry: false,
    refetchInterval: 30000,
  });

  // Format data for charts
  const resultChartData = resultStats ? resultStats.map((stat: any) => ({
    name: stat.result.charAt(0).toUpperCase() + stat.result.slice(1),
    value: stat.count,
  })) : [];

  const threatChartData = threatStats ? threatStats.map((stat: any) => ({
    name: stat.threatType,
    value: stat.count,
  })) : [];

  // Chart colors
  const COLORS = {
    safe: '#10b981',
    malicious: '#ef4444',
    suspicious: '#f59e0b',
    default: '#6366f1'
  };

  const getResultColor = (result: string) => {
    const resultLower = result.toLowerCase();
    return COLORS[resultLower as keyof typeof COLORS] || COLORS.default;
  };

  // Loading state
  const isLoading = resultStatsLoading || threatStatsLoading || userStatsLoading;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Live monitoring and threat management
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader2 className="h-8 w-8 animate-spin text-border" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Overview Cards */}
              {userStats && <StatsCards stats={userStats} />}

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scan Results Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Scan Results Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={resultChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {resultChartData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getResultColor(entry.name)}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`${value} scans`, 'Count']}
                          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Threat Types Chart */}
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Threat Types Breakdown</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={threatChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [`${value} occurrences`, 'Count']} />
                        <Legend />
                        <Bar dataKey="value" fill="#ef4444" name="Occurrences" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="threats">
          <ThreatTable />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;