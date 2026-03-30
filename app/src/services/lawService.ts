/**
 * Law Service - AUREX Civic Issue Reporting System
 * 
 * Law-related API calls.
 */

import api from './api';

export interface CreateLawData {
  title: string;
  description: string;
  content: string;
  category: string;
  subcategory?: string;
  summary?: string;
  keyPoints?: string[];
  actNumber?: string;
  year?: number;
  jurisdiction?: string;
  applicableStates?: string[];
  penalties?: Array<{
    offense: string;
    penalty: string;
    fineAmount?: {
      min: number;
      max: number;
    };
  }>;
  relatedLaws?: string[];
  references?: Array<{
    title: string;
    url?: string;
    type?: string;
  }>;
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  status?: 'active' | 'amended' | 'repealed' | 'pending';
  priority?: number;
}

export const lawService = {
  /**
   * Create a new law (admin only)
   */
  createLaw: async (data: CreateLawData) => {
    const response = await api.post('/laws', data);
    return response.data.data.law;
  },

  /**
   * Get all laws
   */
  getLaws: async (filters: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isFeatured?: boolean;
  } = {}) => {
    const response = await api.get('/laws', { params: filters });
    return response.data.data;
  },

  /**
   * Get single law
   */
  getLaw: async (id: string, lang = 'en') => {
    const response = await api.get(`/laws/${id}`, { params: { lang } });
    return response.data.data.law;
  },

  /**
   * Update law (admin only)
   */
  updateLaw: async (id: string, data: Partial<CreateLawData>) => {
    const response = await api.put(`/laws/${id}`, data);
    return response.data.data.law;
  },

  /**
   * Delete law (admin only)
   */
  deleteLaw: async (id: string) => {
    await api.delete(`/laws/${id}`);
  },

  /**
   * Search laws
   */
  searchLaws: async (query: string, category?: string) => {
    const response = await api.get('/laws/search', {
      params: { q: query, category }
    });
    return response.data.data.laws;
  },

  /**
   * Get laws by category
   */
  getByCategory: async (category: string, page = 1, limit = 20) => {
    const response = await api.get(`/laws/category/${category}`, {
      params: { page, limit }
    });
    return response.data.data.laws;
  },

  /**
   * Get featured laws
   */
  getFeatured: async (limit = 10) => {
    const response = await api.get('/laws/featured', { params: { limit } });
    return response.data.data.laws;
  },

  /**
   * Get law categories
   */
  getCategories: async () => {
    const response = await api.get('/laws/categories');
    return response.data.data.categories;
  }
};
