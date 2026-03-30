/**
 * Admin Reports Page - AUREX Civic Issue Reporting System
 * 
 * Manage and review all submitted reports.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  X,
  MoreHorizontal,
  Eye,
  UserCheck
} from 'lucide-react';

interface Report {
  _id: string;
  reportId?: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  status?: string;
  isEmergency?: boolean;
  reportedBy?: {
    name: string;
  };
  assignedTo?: {
    _id?: string;
    name: string;
  };
  createdAt?: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-pink-100 text-pink-800',
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

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showAssignedToMe, setShowAssignedToMe] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await reportService.getReports({ limit: 50 });
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    const matchesSearch = [
      report.title,
      report.reportId,
      report.category,
      report.description,
    ].some((field) => (field?.toLowerCase?.() ?? '').includes(normalizedQuery));
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    const matchesAssigned =
      !showAssignedToMe ||
      report.assignedTo?._id === user?._id ||
      report.assignedTo?.name === user?.name;
    return matchesSearch && matchesStatus && matchesPriority && matchesAssigned;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Reports</h1>
          <p className="text-muted-foreground">Review and manage all submitted reports</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            {filteredReports.length} reports
          </Badge>
          <Button
            variant={showAssignedToMe ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowAssignedToMe((prev) => !prev)}
          >
            Assigned to me
          </Button>
        </div>
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
            <SelectValue placeholder="Status" />
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
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="divide-y">
              {filteredReports.map((report) => (
                <Link
                  key={report._id}
                  to={`/admin/reports/${report._id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted transition-colors"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {categoryIcons[report.category ?? 'other']}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{report.reportId ?? 'N/A'}
                      </span>
                      {report.isEmergency && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium truncate">{report.title ?? 'Untitled report'}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      by {report.reportedBy?.name ?? 'Anonymous'}
                    </p>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <Badge className={statusColors[report.status ?? 'pending']}>
                        {(report.status ?? 'pending').replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {report.assignedTo?.name ? (
                      <div className="text-right">
                        <Badge variant="default" className="text-xs">
                          <UserCheck className="w-3 h-3 mr-1" />
                          {report.assignedTo.name}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Unassigned</Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No reports found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
