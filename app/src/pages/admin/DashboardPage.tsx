/**
 * Admin Dashboard - AUREX Civic Issue Reporting System
 * 
 * Overview statistics and quick actions for administrators.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MapPin,
  Calendar
} from 'lucide-react';

interface DashboardStats {
  overview: {
    total: number;
    pending: number;
    underReview: number;
    inProgress: number;
    resolved: number;
    rejected: number;
    emergency: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await reportService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Reports',
      value: stats?.overview.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
      link: '/admin/reports'
    },
    {
      title: 'Pending',
      value: stats?.overview.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: '+5%',
      trendUp: true,
      link: '/admin/reports?status=pending'
    },
    {
      title: 'Resolved',
      value: stats?.overview.resolved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      trend: '+18%',
      trendUp: true,
      link: '/admin/reports?status=resolved'
    },
    {
      title: 'Emergency',
      value: stats?.overview.emergency || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: '-3%',
      trendUp: false,
      link: '/admin/reports?isEmergency=true'
    }
  ];

  const recentReports = [
    { id: 'AUR2403150001', title: 'Pothole on Main Street', status: 'pending', priority: 'high', time: '2 hours ago' },
    { id: 'AUR2403150002', title: 'Street light not working', status: 'in_progress', priority: 'medium', time: '4 hours ago' },
    { id: 'AUR2403150003', title: 'Garbage collection issue', status: 'resolved', priority: 'low', time: '1 day ago' },
    { id: 'AUR2403150004', title: 'Water supply disruption', status: 'under_review', priority: 'emergency', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of civic issue reports and system status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          statCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${
                        stat.trendUp ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trendUp ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {stat.trend} from last week
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Reports</CardTitle>
              <Link to="/admin/reports">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link key={report.id} to={`/admin/reports/${report.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          report.priority === 'emergency' ? 'bg-red-500' :
                          report.priority === 'high' ? 'bg-orange-500' :
                          report.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{report.title}</p>
                          <p className="text-xs text-muted-foreground">{report.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          report.status === 'resolved' ? 'default' :
                          report.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {report.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{report.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Manage Reports
                </Button>
              </Link>
              <Link to="/admin/community">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="w-4 h-4 mr-2" />
                  Moderate Community
                </Button>
              </Link>
              <Link to="/admin/laws">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Update Laws
                </Button>
              </Link>
              <Link to="/admin/contacts">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Manage Contacts
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant="default" className="bg-green-500">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default" className="bg-green-500">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <Badge variant="default" className="bg-green-500">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}