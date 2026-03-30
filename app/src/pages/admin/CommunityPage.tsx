/**
 * Admin Community Page - AUREX Civic Issue Reporting System
 * 
 * Moderate community posts and announcements.
 */

import React, { useEffect, useState } from 'react';
import { communityService } from '../../services/communityService';
import { useNotification } from '../../context/NotificationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  MessageSquare,
  Megaphone,
  Flag,
  Trash2,
  Pin,
  Eye,
  MoreHorizontal,
  CheckCircle,
  X,
  Pencil
} from 'lucide-react';

interface Post {
  _id: string;
  content: string;
  title?: string;
  category?: string;
  description?: string;
  locationName?: string;
  eventDate?: string;
  priority?: string;
  allowComments?: boolean;
  attachments?: Array<{ url: string; name?: string }>;
  media?: Array<{ url: string; type: string }>;
  author: {
    name: string;
    role: string;
  };
  isAnnouncement: boolean;
  isPinned: boolean;
  status: string;
  reportCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export default function AdminCommunityPage() {
  const { success: showSuccess, error: showError } = useNotification();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [formState, setFormState] = useState({
    title: '',
    category: 'notice',
    description: '',
    locationName: '',
    eventDate: '',
    priority: 'normal',
    allowComments: true
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await communityService.getFeed(1, 50);
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await communityService.deletePost(id);
      showSuccess('Post deleted');
      fetchPosts();
    } catch (error) {
      showError('Failed to delete post');
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await communityService.pinPost(id, !isPinned);
      showSuccess(isPinned ? 'Post unpinned' : 'Post pinned');
      fetchPosts();
    } catch (error) {
      showError('Failed to pin post');
    }
  };

  const handleOpenCreate = () => {
    setEditingPostId(null);
    setFormState({
      title: '',
      category: 'notice',
      description: '',
      locationName: '',
      eventDate: '',
      priority: 'normal',
      allowComments: true
    });
    setImageFile(null);
    setAttachmentFiles([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPostId(post._id);
    setFormState({
      title: post.title || '',
      category: post.category || 'notice',
      description: post.description || post.content || '',
      locationName: post.locationName || '',
      eventDate: post.eventDate ? post.eventDate.split('T')[0] : '',
      priority: post.priority || 'normal',
      allowComments: post.allowComments !== false
    });
    setImageFile(null);
    setAttachmentFiles([]);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formState.title.trim() || !formState.category || !formState.description.trim()) {
      showError('Please fill title, category, and description');
      return;
    }
    setIsSubmitting(true);
    try {
      const media = imageFile ? [await communityService.uploadPostImage(imageFile)] : [];
      const attachments = attachmentFiles.length
        ? await communityService.uploadPostAttachments(attachmentFiles)
        : [];

      const payload = {
        title: formState.title.trim(),
        category: formState.category as 'announcement' | 'event' | 'emergency' | 'notice',
        description: formState.description.trim(),
        locationName: formState.locationName.trim() || undefined,
        eventDate: formState.eventDate ? new Date(formState.eventDate).toISOString() : undefined,
        priority: formState.priority as 'high' | 'medium' | 'normal',
        allowComments: formState.allowComments,
        content: formState.description.trim(),
        media: media.length ? media : undefined,
        attachments: attachments.length ? attachments : undefined,
        isAnnouncement: formState.category === 'announcement'
      };

      if (editingPostId) {
        await communityService.updatePost(editingPostId, payload);
        showSuccess('Post updated');
      } else {
        await communityService.createPost(payload);
        showSuccess('Post created');
      }
      setIsDialogOpen(false);
      fetchPosts();
    } catch (error) {
      showError('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'announcements') return post.isAnnouncement;
    if (activeTab === 'flagged') return post.reportCount > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community Moderation</h1>
          <p className="text-muted-foreground">Manage posts and announcements</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Megaphone className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged
            {posts.some(p => p.reportCount > 0) && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {posts.filter(p => p.reportCount > 0).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.isAnnouncement && (
                            <Badge variant="default">
                              <Megaphone className="w-3 h-3 mr-1" />
                              Announcement
                            </Badge>
                          )}
                          {post.isPinned && (
                            <Badge variant="secondary">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {post.reportCount > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {post.reportCount} reports
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            by {post.author.name}
                          </span>
                        </div>
                        <p className="mt-2 font-semibold">{post.title || 'Untitled Post'}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {post.description || post.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{post.likeCount} likes</span>
                          <span>{post.commentCount} comments</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(post)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePin(post._id, post.isPinned)}
                        >
                          <Pin className={`w-4 h-4 ${post.isPinned ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(post._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No posts found</h3>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPostId ? 'Edit Post' : 'Create Post'}</DialogTitle>
            <DialogDescription>
              Provide details for the community post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Post heading"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formState.priority}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Full details"
                rows={4}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location (optional)</label>
                <Input
                  value={formState.locationName}
                  onChange={(event) => setFormState((prev) => ({ ...prev, locationName: event.target.value }))}
                  placeholder="Area name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formState.eventDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, eventDate: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments (PDF/docs)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formState.allowComments}
                onCheckedChange={(checked) =>
                  setFormState((prev) => ({ ...prev, allowComments: Boolean(checked) }))
                }
              />
              <span className="text-sm">Allow Comments</span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
