/**
 * Admin Report Detail Page - AUREX Civic Issue Reporting System
 * 
 * Detailed view and management of a specific report.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  UserCheck,
  Phone
} from 'lucide-react';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'escalated', label: 'Escalated' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-pink-100 text-pink-800',
};

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useNotification();
  const { user } = useAuth();
  
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const getSafeMediaUrl = (url?: string) =>
    typeof url === 'string' && url.trim() && !url.includes('placeholder.com') ? url : '';

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const data = await reportService.getReport(id!);
      setReport(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === report.status) return;
    
    setIsUpdating(true);
    try {
      await reportService.updateStatus(id!, newStatus, statusNote);
      showSuccess('Status updated successfully');
      fetchReport();
      setStatusNote('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } } | undefined;
      showError(err?.response?.data?.message ?? 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddResponse = async () => {
    if (!responseMessage.trim()) return;

    try {
      await reportService.addResponse(id!, responseMessage);
      showSuccess('Response added');
      setResponseMessage('');
      fetchReport();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } } | undefined;
      showError(err?.response?.data?.message ?? 'Failed to add response');
    }
  };

  const handleAssignToMe = async () => {
    if (!user?._id) return;
    
    setIsAssigning(true);
    try {
      const adminId = report.assignedTo?._id === user._id ? null : user._id;
      await reportService.assignReport(id!, adminId ?? undefined);
      showSuccess(adminId ? 'Report assigned to you' : 'Assignment removed');
      fetchReport();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } } | undefined;
      showError(err?.response?.data?.message ?? 'Failed to update assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Report not found</h2>
        <Button onClick={() => navigate('/admin/reports')} className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-mono">#{report.reportId}</p>
          <h1 className="text-xl font-bold">{report.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Report Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">
                  {report.category?.replace(/_/g, ' ') || 'Uncategorized'}
                </Badge>
                <Badge className={statusColors[report.status]}>
                  {report.status.replace('_', ' ')}
                </Badge>
                <Badge variant={report.priority === 'emergency' ? 'destructive' : 'secondary'}>
                  {report.priority}
                </Badge>
                {report.isEmergency && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Emergency
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
              </div>

              {/* Category Details Section */}
              {report.categoryDetails && Object.keys(report.categoryDetails).length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Category Specific Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(report.categoryDetails).map(([key, value]) => (
                      <div key={String(key)} className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize mb-1">
                          {String(key).replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-medium text-sm">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.location?.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{report.location.address}</p>
                    {report.location.coordinates && (
                      <a
                        className="text-xs text-primary hover:underline"
                        href={`https://www.google.com/maps?q=${report.location.coordinates[1]},${report.location.coordinates[0]}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on map
                      </a>
                    )}
                  </div>
                </div>
              )}

              {report.incidentAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Incident Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(report.incidentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {(report.contactName || report.contactPhone) && (
                <div className="flex items-start gap-2">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Contact</p>
                    {report.contactName && (
                      <p className="text-sm text-muted-foreground">{report.contactName}</p>
                    )}
                    {report.contactPhone && (
                      <p className="text-sm text-muted-foreground">{report.contactPhone}</p>
                    )}
                  </div>
                </div>
              )}

              {report.media?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Evidence</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {report.media.map((item: { url?: string; type?: string }, idx: number) => (
                      <div key={String(idx)} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        {getSafeMediaUrl(item?.url) ? (
                          <img
                            src={getSafeMediaUrl(item?.url)}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground px-2 text-center">
                            Image unavailable
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.statusHistory.map((history: { status?: string; changedAt?: string; note?: string; changedBy?: { name?: string } }, idx: number) => (
                  <div key={String(idx)} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        idx === 0 ? 'bg-primary' : 'bg-muted-foreground'
                      }`} />
                      {idx < report.statusHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">{(history.status ?? '').replace('_', ' ')}</p>
                        <span className="text-xs text-muted-foreground">
                          {history.changedAt ? new Date(history.changedAt).toLocaleString() : 'Unknown date'}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        by {history.changedBy?.name ?? 'Unknown user'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Responses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Official Responses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.adminResponses.map((response: { message?: string; respondedBy?: { name?: string }; respondedAt?: string }, idx: number) => (
                <div key={String(idx)} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{response.respondedBy?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {response.respondedAt ? new Date(response.respondedAt).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm">{response.message}</p>
                </div>
              ))}

              {/* Add Response */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add an official response..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
                <Button 
                  onClick={handleAddResponse}
                  disabled={!responseMessage.trim()}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Add Response
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">{report.reportedBy.name}</p>
                  <p className="text-sm text-muted-foreground">{report.reportedBy.email}</p>
                </div>
              </div>
              {report.isAnonymous && (
                <Badge variant="secondary">Anonymous Report</Badge>
              )}
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Note (optional)</label>
                <Textarea
                  placeholder="Add a note about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
              <Button
                onClick={handleStatusUpdate}
                disabled={newStatus === report.status || isUpdating}
                className="w-full"
              >
                {isUpdating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.assignedTo ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{report.assignedTo.name}</p>
                      <p className="text-sm text-muted-foreground">Assigned</p>
                    </div>
                  </div>
                  {report.assignedTo._id === user?._id && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAssignToMe}
                      disabled={isAssigning}
                      className="w-full"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Remove from me
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">Not assigned</p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleAssignToMe}
                    disabled={isAssigning}
                    className="w-full"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign to me
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Contact Reporter
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="w-4 h-4 mr-2" />
                View on Map
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
