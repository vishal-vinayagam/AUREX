/**
 * Track Page - AUREX Civic Issue Reporting System
 * 
 * Shows user's submitted reports with status and timeline.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { reportService } from '../../services/reportService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  ChevronRight,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  CheckCircle,
  X
} from 'lucide-react';

interface Report {
  _id: string;
  reportId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  isEmergency: boolean;
  location: {
    address?: string;
  };
  media: Array<{ url: string; type: string }>;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-pink-100 text-pink-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

const categoryIcons: Record<string, string> = {
  roads: '🛣️',
  water_supply: '💧',
  electricity: '⚡',
  sanitation: '🧹',
  garbage: '🗑️',
  streetlights: '💡',
  public_transport: '🚌',
  parks: '🌳',
  noise_pollution: '🔊',
  air_pollution: '🌫️',
  illegal_construction: '🚧',
  traffic: '🚦',
  safety: '🛡️',
  healthcare: '🏥',
  education: '📚',
  other: '📋',
};

export default function TrackPage() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportService.getMyReports({ limit: 50 });
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('track.title')}</h1>
        <p className="text-muted-foreground">Track the status of your reported issues</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: reports.length, color: 'bg-primary' },
          { label: 'Pending', value: reports.filter(r => r.status === 'pending').length, color: 'bg-yellow-500' },
          { label: 'In Progress', value: reports.filter(r => ['under_review', 'in_progress'].includes(r.status)).length, color: 'bg-blue-500' },
          { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: 'bg-green-500' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Link key={report._id} to={`/track/${report._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Category Icon */}
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {categoryIcons[report.category] || '📋'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-mono">
                              #{report.reportId}
                            </span>
                            {report.isEmergency && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Emergency
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold mt-1 line-clamp-1 group-hover:text-primary transition-colors">
                            {report.title}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {report.description}
                      </p>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <Badge className={statusColors[report.status]}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                        </Badge>
                        <Badge className={priorityColors[report.priority]}>
                          {report.priority}
                        </Badge>
                        {report.location?.address && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.location.address}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>Submitted {new Date(report.createdAt).toLocaleDateString()}</span>
                        <span>Updated {new Date(report.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">{t('track.noReports')}</h3>
            <p className="text-muted-foreground mb-4">Start by reporting an issue in your area</p>
            <Link to="/report">
              <Button>Report an Issue</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}