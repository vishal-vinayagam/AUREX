/**
 * Home Page - AUREX Civic Issue Reporting System
 * 
 * Main dashboard for users showing statistics, quick actions, and announcements.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { reportService } from '../../services/reportService';
import { communityService } from '../../services/communityService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Megaphone,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';

interface Statistics {
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

interface Announcement {
  _id: string;
  content: string;
  author: {
    name: string;
    role: string;
  };
  createdAt: string;
  isPinned: boolean;
}

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, announcementsData] = await Promise.all([
          reportService.getStatistics(),
          communityService.getAnnouncements(3)
        ]);
        setStats(statsData);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickStats = [
    {
      label: 'Total Reports',
      value: stats?.overview.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/track'
    },
    {
      label: 'Pending',
      value: stats?.overview.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/track'
    },
    {
      label: 'Resolved',
      value: stats?.overview.resolved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/track'
    },
    {
      label: 'Emergency',
      value: stats?.overview.emergency || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/emergency'
    }
  ];

  const categories = [
    { id: 'roads', name: 'Roads', icon: '🛣️', color: 'bg-stone-100' },
    { id: 'water_supply', name: 'Water', icon: '💧', color: 'bg-blue-100' },
    { id: 'electricity', name: 'Power', icon: '⚡', color: 'bg-yellow-100' },
    { id: 'sanitation', name: 'Sanitation', icon: '🧹', color: 'bg-green-100' },
    { id: 'garbage', name: 'Garbage', icon: '🗑️', color: 'bg-lime-100' },
    { id: 'streetlights', name: 'Lights', icon: '💡', color: 'bg-amber-100' },
    { id: 'public_transport', name: 'Transport', icon: '🚌', color: 'bg-indigo-100' },
    { id: 'safety', name: 'Safety', icon: '🛡️', color: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {t('home.welcome')}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your community today.
          </p>
        </div>
        <Link to="/report">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('home.reportIssue')}</span>
            <span className="sm:hidden">Report</span>
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : (
          quickStats.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
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
        {/* Left Column - Categories & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Link to="/report">
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Report Issue</h3>
                    <p className="text-sm text-muted-foreground">Submit a new civic issue</p>
                  </div>
                </div>
              </Link>
              <Link to="/track">
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Track Reports</h3>
                    <p className="text-sm text-muted-foreground">View your report status</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Report by Category</CardTitle>
              <Link to="/report" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/report?category=${cat.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {cat.icon}
                    </div>
                    <span className="text-xs text-center font-medium">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('home.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Report #AUR2403150001 resolved</p>
                    <p className="text-sm text-muted-foreground">Your road repair issue has been resolved</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Report #AUR2403140089 in progress</p>
                    <p className="text-sm text-muted-foreground">Water supply issue is being addressed</p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Announcements & Info */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                {t('home.announcements')}
              </CardTitle>
              <Link to="/community" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="p-3 rounded-lg bg-muted/50">
                      {announcement.isPinned && (
                        <Badge variant="secondary" className="mb-2">Pinned</Badge>
                      )}
                      <p className="text-sm line-clamp-3">{announcement.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{announcement.author.name}</span>
                        <span>•</span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No announcements yet</p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Card */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Emergency?</h3>
                  <p className="text-sm text-red-700 mt-1">
                    For immediate assistance, use our emergency feature.
                  </p>
                  <Link to="/emergency">
                    <Button variant="destructive" size="sm" className="mt-3">
                      Get Help
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/laws" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Laws & Acts</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link to="/contacts" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">Emergency Contacts</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
                <Link to="/messages" className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-sm font-medium">Contact Admin</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}