/**
 * Community Page - AUREX Civic Issue Reporting System
 * 
 * Instagram-style feed with posts, announcements, and stories.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { communityService } from '../../services/communityService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';

interface Comment {
  _id: string;
  user: {
    _id?: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

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
  author: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  media: Array<{ url: string; type: string }>;
  isAnonymous: boolean;
  isAnnouncement: boolean;
  likes: string[];
  likeCount: number;
  comments: Comment[];
  commentCount: number;
  createdAt: string;
}

interface Story {
  _id: string;
  title?: string;
  content: string;
  author: {
    _id?: string;
    name: string;
    avatar?: string;
  };
  media: Array<{ url: string }>;
  viewCount?: number;
  views?: Array<{ user?: { name: string; avatar?: string } }>;
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'announcements'>('feed');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postAttachmentFiles, setPostAttachmentFiles] = useState<File[]>([]);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyTagline, setStoryTagline] = useState('');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const [postForm, setPostForm] = useState({
    title: '',
    category: 'notice',
    description: '',
    locationName: '',
    eventDate: '',
    priority: 'normal',
    allowComments: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsData, storiesData] = await Promise.all([
        communityService.getFeed(1, 20),
        communityService.getStories()
      ]);
      setPosts(postsData.posts);
      setStories(storiesData);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.title.trim() || !postForm.description.trim()) return;

    setIsSubmitting(true);
    try {
      const media = postImageFile ? [await communityService.uploadPostImage(postImageFile)] : [];
      const attachments = postAttachmentFiles.length
        ? await communityService.uploadPostAttachments(postAttachmentFiles)
        : [];

      await communityService.createPost({
        title: postForm.title,
        category: postForm.category as 'announcement' | 'event' | 'emergency' | 'notice',
        description: postForm.description,
        locationName: postForm.locationName || undefined,
        eventDate: postForm.eventDate ? new Date(postForm.eventDate).toISOString() : undefined,
        priority: postForm.priority as 'high' | 'medium' | 'normal',
        allowComments: postForm.allowComments,
        content: postForm.description,
        media: media.length ? media : undefined,
        attachments: attachments.length ? attachments : undefined,
        isAnnouncement: postForm.category === 'announcement'
      });
      setPostForm({
        title: '',
        category: 'notice',
        description: '',
        locationName: '',
        eventDate: '',
        priority: 'normal',
        allowComments: true
      });
      setPostImageFile(null);
      setPostAttachmentFiles([]);
      setIsPostDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateStory = async () => {
    if (!storyImageFile) return;

    setIsSubmitting(true);
    try {
      const media = [await communityService.uploadPostImage(storyImageFile)];
      await communityService.createPost({
        content: storyCaption || 'Story',
        media,
        isStory: true,
        allowComments: false
      });
      setStoryImageFile(null);
      setStoryCaption('');
      setStoryTagline('');
      setIsStoryDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await communityService.likePost(postId);
      fetchData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await communityService.deletePost(postId);
      fetchData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleOpenComments = async (postId: string) => {
    setIsCommentOpen(true);
    setIsCommentLoading(true);
    try {
      const post = await communityService.getPost(postId);
      setCommentPost(post);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentPost || !commentText.trim()) return;
    try {
      await communityService.addComment(commentPost._id, commentText.trim());
      const updatedPost = await communityService.getPost(commentPost._id);
      setCommentPost(updatedPost);
      setCommentText('');
      fetchData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleOpenStory = async (story: Story) => {
    try {
      const updated = await communityService.viewStory(story._id);
      setActiveStory(updated);
    } catch (error) {
      console.error('Error viewing story:', error);
      setActiveStory(story);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Delete this story?')) return;
    try {
      await communityService.deletePost(storyId);
      setActiveStory(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('community.title')}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsStoryDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Story
          </Button>
          <Button size="sm" onClick={() => setIsPostDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Post
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'feed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </Button>
        <Button
          variant={activeTab === 'announcements' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('announcements')}
        >
          Announcements
        </Button>
      </div>

      {/* Stories */}
      {activeTab === 'feed' && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <button
            className="flex-shrink-0 flex flex-col items-center gap-1"
            onClick={() => setIsStoryDialogOpen(true)}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary flex items-center justify-center bg-primary/5">
              <span className="text-2xl">+</span>
            </div>
            <span className="text-xs">Add Story</span>
          </button>

          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-full flex-shrink-0" />
            ))
          ) : (
            stories.map((story) => (
              <button
                key={story._id}
                className="flex-shrink-0 flex flex-col items-center gap-1"
                onClick={() => handleOpenStory(story)}
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={story.author.avatar} />
                    <AvatarFallback>{story.author.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs truncate max-w-[64px]">{story.author.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))
        ) : posts.length > 0 ? (
          posts
            .filter((post) => (activeTab === 'announcements' ? post.isAnnouncement : true))
            .map((post) => (
              <Card key={post._id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        {!post.isAnonymous && <AvatarImage src={post.author.avatar} />}
                        <AvatarFallback className={post.isAnonymous ? 'bg-muted' : ''}>
                          {post.isAnonymous ? '?' : post.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {post.isAnonymous ? 'Anonymous' : post.author.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                          {post.isAnnouncement && (
                            <span className="ml-2 text-primary font-medium">• Official</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:bg-muted rounded-full">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(user?.role === 'admin' || user?.role === 'superadmin' || user?._id === post.author._id) && (
                          <DropdownMenuItem onClick={() => handleDeletePost(post._id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Content */}
                  <div className="px-4 pb-3">
                    {post.title && (
                      <p className="text-base font-semibold">{post.title}</p>
                    )}
                    {post.category && (
                      <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {post.category}
                      </span>
                    )}
                    {post.description ? (
                      <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">{post.description}</p>
                    ) : (
                      <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>
                    )}
                    {(post.locationName || post.eventDate || post.priority) && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {post.locationName && <span>Location: {post.locationName}</span>}
                        {post.eventDate && <span>Date: {new Date(post.eventDate).toLocaleDateString()}</span>}
                        {post.priority && <span>Priority: {post.priority}</span>}
                      </div>
                    )}
                    {post.attachments && post.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {attachment.name || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    )}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs">
                        <span className="font-medium">
                          {post.comments[0].user?.name || 'User'}:
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {post.comments[0].content}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Media */}
                  {post.media.length > 0 && (
                    <div className="grid grid-cols-1 gap-1">
                      {post.media.map((media, idx) => (
                        <img
                          key={idx}
                          src={media.url}
                          alt={`Post media ${idx + 1}`}
                          className="w-full max-h-96 object-cover"
                        />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex items-center gap-1 text-sm ${
                            post.likes.includes(user?.id || '')
                              ? 'text-red-500'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              post.likes.includes(user?.id || '') && 'fill-current'
                            }`}
                          />
                          <span>{post.likeCount}</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenComments(post._id)}
                          disabled={post.allowComments === false}
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>{post.commentCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">Be the first to share something!</p>
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Fill in the details to publish a community post.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={postForm.title}
                onChange={(event) => setPostForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Post heading"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={postForm.category}
                  onValueChange={(value) => setPostForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="notice">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={postForm.priority}
                  onValueChange={(value) => setPostForm((prev) => ({ ...prev, priority: value }))}
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
                value={postForm.description}
                onChange={(event) => setPostForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Full details"
                rows={4}
              />
            </div>
            {(postForm.category === 'event' || postForm.category === 'emergency') && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location (optional)</label>
                  <Input
                    value={postForm.locationName}
                    onChange={(event) => setPostForm((prev) => ({ ...prev, locationName: event.target.value }))}
                    placeholder="Area name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={postForm.eventDate}
                    onChange={(event) => setPostForm((prev) => ({ ...prev, eventDate: event.target.value }))}
                  />
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setPostImageFile(event.target.files?.[0] || null)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments (PDF/docs)</label>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={(event) => setPostAttachmentFiles(Array.from(event.target.files || []))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={postForm.allowComments}
                onCheckedChange={(checked) =>
                  setPostForm((prev) => ({ ...prev, allowComments: Boolean(checked) }))
                }
              />
              <span className="text-sm">Allow Comments</span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Story Dialog */}
      <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
            <DialogDescription>
              Add a photo with a short tagline and caption.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => setStoryImageFile(event.target.files?.[0] || null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <Input
                value={storyTagline}
                onChange={(event) => setStoryTagline(event.target.value)}
                placeholder="Short tagline"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption</label>
              <Textarea
                value={storyCaption}
                onChange={(event) => setStoryCaption(event.target.value)}
                placeholder="Add something about this story"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsStoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStory} disabled={isSubmitting || !storyImageFile}>
              {isSubmitting ? 'Posting...' : 'Post Story'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      <Dialog open={!!activeStory} onOpenChange={() => setActiveStory(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Story</DialogTitle>
            <DialogDescription>
              Story details and view list.
            </DialogDescription>
          </DialogHeader>
          {activeStory && (
            <div className="space-y-4">
              {activeStory.media?.[0]?.url && (
                <img
                  src={activeStory.media[0].url}
                  alt="Story"
                  className="w-full rounded-lg object-cover"
                />
              )}
              {activeStory.title && (
                <p className="text-sm font-semibold">{activeStory.title}</p>
              )}
              <p className="text-sm text-muted-foreground">{activeStory.content}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>{activeStory.viewCount || 0} views</span>
              </div>
              {activeStory.views && activeStory.views.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Viewed by</p>
                  <div className="space-y-2">
                    {activeStory.views.map((view, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={view.user?.avatar} />
                          <AvatarFallback>{view.user?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{view.user?.name || 'User'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(user?.role === 'admin' ||
                user?.role === 'superadmin' ||
                user?._id === activeStory.author._id) && (
                <Button variant="destructive" onClick={() => handleDeleteStory(activeStory._id)}>
                  Delete Story
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
            <DialogDescription>
              View and add comments for this post.
            </DialogDescription>
          </DialogHeader>
          {isCommentLoading ? (
            <Skeleton className="h-32" />
          ) : commentPost ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {commentPost.comments?.length ? (
                  commentPost.comments.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user?.avatar} />
                        <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{comment.user?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No comments yet</p>
                )}
              </div>
              <div className="flex items-end gap-2">
                <Textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                />
                <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
