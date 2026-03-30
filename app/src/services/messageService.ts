/**
 * Message Service - AUREX Civic Issue Reporting System
 * 
 * Message-related API calls.
 */

import api from './api';

export interface SendMessageData {
  recipientId: string;
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'document';
  media?: {
    url: string;
    publicId: string;
    thumbnail?: string;
  };
  relatedReportId?: string;
  replyTo?: string;
}

export const messageService = {
  /**
   * Upload a single message image
   */
  uploadMessageImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/messages/upload/single', formData);
    return response.data.data.media;
  },

  /**
   * Send a message
   */
  sendMessage: async (data: SendMessageData) => {
    const response = await api.post('/messages', data);
    return response.data.data.message;
  },

  /**
   * Get conversation with a user
   */
  getConversation: async (userId: string, page = 1, limit = 50) => {
    const response = await api.get(`/messages/conversation/${userId}`, {
      params: { page, limit }
    });
    return response.data.data.messages;
  },

  /**
   * Get all conversations
   */
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data.data.conversations;
  },

  /**
   * Mark conversation as read
   */
  markConversationAsRead: async (userId: string) => {
    await api.put(`/messages/conversation/${userId}/read-all`);
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async () => {
    const response = await api.get('/messages/unread-count');
    return response.data.data.unreadCount;
  },

  /**
   * Get available admins for messaging
   */
  getAdmins: async () => {
    const response = await api.get('/messages/admins');
    return response.data.data.admins;
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string) => {
    await api.put(`/messages/${messageId}/read`);
  },

  /**
   * Edit message
   */
  editMessage: async (messageId: string, content: string) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data.data.message;
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: string) => {
    await api.delete(`/messages/${messageId}`);
  },

  /**
   * Add reaction to message
   */
  addReaction: async (messageId: string, emoji: string) => {
    const response = await api.post(`/messages/${messageId}/reaction`, { emoji });
    return response.data.data.reactions;
  },

  /**
   * Remove reaction from message
   */
  removeReaction: async (messageId: string) => {
    const response = await api.delete(`/messages/${messageId}/reaction`);
    return response.data.data.reactions;
  }
};
