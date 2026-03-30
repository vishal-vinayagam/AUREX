/**
 * Community Service - AUREX Civic Issue Reporting System
 * 
 * Community post-related API calls.
 */

import api from './api';

export interface CreatePostData {
  title?: string;
  category?: 'announcement' | 'event' | 'emergency' | 'notice';
  description?: string;
  locationName?: string;
  eventDate?: string;
  priority?: 'high' | 'medium' | 'normal';
  allowComments?: boolean;
  content: string;
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    publicId: string;
  }>;
  attachments?: Array<{
    url: string;
    type: 'document';
    publicId: string;
    name?: string;
  }>;
  isAnonymous?: boolean;
  isAnnouncement?: boolean;
  isStory?: boolean;
  relatedReportId?: string;
}

export const communityService = {
  /**
   * Upload a single community image
   */
  uploadPostImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/community/upload/single', formData);
    return response.data.data.media;
  },

  /**
   * Upload community attachments (PDF/docs)
   */
  uploadPostAttachments: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('attachments', file));
    const response = await api.post('/community/upload/attachments', formData);
    return response.data.data.attachments;
  },
  /**
   * Create a new post
   */
  createPost: async (data: CreatePostData) => {
    const response = await api.post('/community/posts', data);
    return response.data.data.post;
  },

  /**
   * Get community feed
   */
  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get('/community/feed', {
      params: { page, limit }
    });
    return response.data.data;
  },

  /**
   * Get stories
   */
  getStories: async () => {
    const response = await api.get('/community/stories');
    return response.data.data.stories;
  },

  /**
   * Add story view
   */
  viewStory: async (id: string) => {
    const response = await api.post(`/community/stories/${id}/view`);
    return response.data.data.story;
  },

  /**
   * Get announcements
   */
  getAnnouncements: async (limit = 10) => {
    const response = await api.get('/community/announcements', {
      params: { limit }
    });
    return response.data.data.announcements;
  },

  /**
   * Get single post
   */
  getPost: async (id: string) => {
    const response = await api.get(`/community/posts/${id}`);
    return response.data.data.post;
  },

  /**
   * Update post
   */
  updatePost: async (id: string, data: Partial<CreatePostData>) => {
    const response = await api.put(`/community/posts/${id}`, data);
    return response.data.data.post;
  },

  /**
   * Delete post
   */
  deletePost: async (id: string) => {
    await api.delete(`/community/posts/${id}`);
  },

  /**
   * Like/unlike post
   */
  likePost: async (id: string) => {
    const response = await api.post(`/community/posts/${id}/like`);
    return response.data.data;
  },

  /**
   * Add comment
   */
  addComment: async (postId: string, content: string, isAnonymous = false) => {
    const response = await api.post(`/community/posts/${postId}/comments`, {
      content,
      isAnonymous
    });
    return response.data.data.comments;
  },

  /**
   * Delete comment
   */
  deleteComment: async (postId: string, commentId: string) => {
    await api.delete(`/community/posts/${postId}/comments/${commentId}`);
  },

  /**
   * Report post
   */
  reportPost: async (id: string, reason: string) => {
    await api.post(`/community/posts/${id}/report`, { reason });
  },

  /**
   * Pin/unpin post (admin)
   */
  pinPost: async (id: string, isPinned: boolean) => {
    const response = await api.put(`/community/posts/${id}/pin`, { isPinned });
    return response.data.data;
  },

  /**
   * Share post
   */
  sharePost: async (id: string) => {
    const response = await api.post(`/community/posts/${id}/share`);
    return response.data.data;
  }
};
