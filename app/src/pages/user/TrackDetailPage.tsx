/**
 * Track Detail Page - AUREX Civic Issue Reporting System
 * 
 * Detailed view of a report with status timeline and updates.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { reportService } from '../../services/reportService';
import { messageService } from '../../services/messageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  MessageSquare,
  ThumbsUp,
  Share2,
  Image as ImageIcon,
  FileText,
  Star
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
  isAnonymous: boolean;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  contactName?: string;
  contactPhone?: string;
  media: Array<{ url: string; type: string }>;
  statusHistory: Array<{
    status: string;
    changedAt: string;
    note?: string;
    changedBy: {
      name: string;
      role: string;
    };
  }>;
  adminResponses: Array<{
    message: string;
    respondedAt: string;
    respondedBy: {
      _id?: string;
      name: string;
      role: string;
    };
  }>;
  assignedTo?: {
    _id?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
  upvoteCount: number;
  viewCount: number;
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

export default function TrackDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { success: showSuccess } = useNotification();
  
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
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
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      await reportService.upvoteReport(id!);
      showSuccess('Report upvoted');
      fetchReport();
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await reportService.submitFeedback(id!, feedbackRating, feedbackComment);
      showSuccess('Feedback submitted');
      setShowFeedback(false);
      fetchReport();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !report) return;
    const targetAdminId =
      report.adminResponses?.[report.adminResponses.length - 1]?.respondedBy?._id ||
      report.assignedTo?._id;
    if (!targetAdminId) {
      showSuccess('No admin assigned yet');
      return;
    }
    setIsSendingReply(true);
    try {
      await messageService.sendMessage({
        recipientId: targetAdminId,
        content: replyMessage.trim(),
        messageType: 'text'
      });
      setReplyMessage('');
      showSuccess('Message sent to admin');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = report ? `${report.title} - ${report.reportId}` : 'Report';
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => showSuccess('Link copied'));
      return;
    }
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} ${url}`)}`
    };
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Report not found</h2>
        <Button onClick={() => navigate('/track')} className="mt-4">
          Back to Reports
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-mono">#{report.reportId}</p>
          <h1 className="text-xl font-bold line-clamp-1">{report.title}</h1>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`p-4 rounded-lg ${statusColors[report.status]}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(report.status)}
          <div>
            <p className="font-semibold capitalize">{report.status.replace('_', ' ')}</p>
            <p className="text-sm opacity-80">
              Last updated {new Date(report.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Category & Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{categoryIcons[report.category]}</span>
              <span className="capitalize">{report.category.replace('_', ' ')}</span>
            </Badge>
            <Badge className={report.priority === 'emergency' ? 'bg-red-500' : ''}>
              {report.isEmergency && <AlertTriangle className="w-3 h-3 mr-1" />}
              {report.priority}
            </Badge>
            {report.isAnonymous && (
              <Badge variant="secondary">Anonymous</Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          {/* Location */}
          {(report.location?.address || report.location?.coordinates) && (
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Location</p>
                {report.location.address && (
                  <p className="text-sm text-muted-foreground">{report.location.address}</p>
                )}
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

          {/* Contact Details */}
          {(report.contactName || report.contactPhone) && (
            <div className="flex items-start gap-2">
              <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
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

          {/* Media */}
          {report.media?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Evidence</h3>
              <div className="grid grid-cols-3 gap-2">
                {report.media.map((item, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
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

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleUpvote}>
              <ThumbsUp className="w-4 h-4 mr-2" />
              Support ({report.upvoteCount})
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setIsShareOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.statusHistory.map((history, idx) => (
              <div key={idx} className="flex gap-4">
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
                    <p className="font-medium capitalize">{history.status.replace('_', ' ')}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(history.changedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {history.note && (
                    <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    by {history.changedBy.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Responses */}
      {report.adminResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Official Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.adminResponses.map((response, idx) => (
              <div key={idx} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{response.respondedBy.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {response.respondedBy.role}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(response.respondedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{response.message}</p>
              </div>
            ))}
            <div className="space-y-2">
              <Textarea
                placeholder="Reply to admin..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <Button onClick={handleSendReply} disabled={!replyMessage.trim() || isSendingReply}>
                {isSendingReply ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback (if resolved) */}
      {report.status === 'resolved' && !showFeedback && (
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold mb-2">How was your experience?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your feedback helps us improve our services
            </p>
            <Button onClick={() => setShowFeedback(true)}>Leave Feedback</Button>
          </CardContent>
        </Card>
      )}

      {showFeedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate this resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  className={`text-3xl ${
                    star <= feedbackRating ? 'text-yellow-400' : 'text-muted'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience (optional)"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowFeedback(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmitFeedback} disabled={feedbackRating === 0}>
                Submit Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Share this report to social apps.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Button variant="outline" onClick={() => handleShare('whatsapp')}>
            WhatsApp
          </Button>
          <Button variant="outline" onClick={() => handleShare('facebook')}>
            Facebook
          </Button>
          <Button variant="outline" onClick={() => handleShare('twitter')}>
            Twitter
          </Button>
          <Button variant="outline" onClick={() => handleShare('copy')}>
            Copy link
          </Button>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
