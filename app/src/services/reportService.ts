/**
 * Report Service - AUREX Civic Issue Reporting System
 * 
 * Report-related API calls.
 */

import api from './api';

export interface CreateReportData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  categoryDetails?: Record<string, string>;
  incidentAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'emergency';
  isEmergency?: boolean;
  location: {
    coordinates: [number, number];
    address?: string;
    landmark?: string;
    pincode?: string;
  };
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    publicId: string;
  }>;
  isAnonymous?: boolean;
  isPublic?: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface UploadedMedia {
  url: string;
  type: 'image' | 'video';
  publicId: string;
  thumbnail?: string;
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  priority?: string;
  isEmergency?: boolean;
  search?: string;
  myReports?: boolean;
}

export const reportService = {
  /**
   * Upload multiple report files using multipart/form-data
   */
  uploadReportFiles: async (files: File[]): Promise<UploadedMedia[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post('/reports/upload/multiple', formData);

    return response.data.data.media;
  },

  /**
   * Create a new report
   */
  createReport: async (data: CreateReportData) => {
    const response = await api.post('/reports', data);
    return response.data.data.report;
  },

  /**
   * Get all reports
   */
  getReports: async (filters: ReportFilters = {}) => {
    const response = await api.get('/reports', { params: filters });
    return response.data.data;
  },

  /**
   * Get single report
   */
  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data.data.report;
  },

  /**
   * Update report
   */
  updateReport: async (id: string, data: Partial<CreateReportData>) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data.data.report;
  },

  /**
   * Delete report
   */
  deleteReport: async (id: string) => {
    await api.delete(`/reports/${id}`);
  },

  /**
   * Update report status (admin only)
   */
  updateStatus: async (id: string, status: string, note?: string) => {
    const response = await api.put(`/reports/${id}/status`, { status, note });
    return response.data.data.report;
  },

  /**
   * Assign report (admin only)
   */
  assignReport: async (id: string, adminId?: string) => {
    const response = await api.put(`/reports/${id}/assign`, { adminId });
    return response.data.data.report;
  },

  /**
   * Add admin response
   */
  addResponse: async (id: string, message: string, isInternal = false) => {
    const response = await api.post(`/reports/${id}/response`, { message, isInternal });
    return response.data.data.report;
  },

  /**
   * Submit user feedback
   */
  submitFeedback: async (id: string, rating: number, comment?: string) => {
    const response = await api.post(`/reports/${id}/feedback`, { rating, comment });
    return response.data.data.feedback;
  },

  /**
   * Upvote/unvote report
   */
  upvoteReport: async (id: string) => {
    const response = await api.post(`/reports/${id}/upvote`);
    return response.data.data;
  },

  /**
   * Get report statistics
   */
  getStatistics: async () => {
    const response = await api.get('/reports/stats/overview');
    return response.data.data;
  },

  /**
   * Get nearby reports
   */
  getNearbyReports: async (lat: number, lng: number, radius = 5000) => {
    const response = await api.get('/reports/nearby', {
      params: { lat, lng, radius }
    });
    return response.data.data.reports;
  },

  /**
   * Get my reports
   */
  getMyReports: async (filters: Omit<ReportFilters, 'myReports'> = {}) => {
    const response = await api.get('/reports/my-reports', { params: filters });
    return response.data.data;
  }
};
