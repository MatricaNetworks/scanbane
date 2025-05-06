import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShieldCheck, Shield, CrownIcon } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    premiumUsers: number;
    enterpriseUsers: number;
    freeUsers: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeUsers} active ({Math.round((stats.activeUsers / stats.totalUsers) * 100)}%)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Free Users</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.freeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.freeUsers / stats.totalUsers) * 100)}% of total users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
          <CrownIcon className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.premiumUsers}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% of total users
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enterprise Users</CardTitle>
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.enterpriseUsers}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.enterpriseUsers / stats.totalUsers) * 100)}% of total users
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;