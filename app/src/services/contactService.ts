/**
 * Contact Service - AUREX Civic Issue Reporting System
 * 
 * Emergency contact-related API calls.
 */

import api from './api';

export interface CreateContactData {
  name: string;
  category: string;
  role?: string;
  subcategory?: string;
  description?: string;
  phoneNumbers: Array<{
    number: string;
    label?: string;
    isTollFree?: boolean;
    isAvailable24x7?: boolean;
  }>;
  emails?: Array<{
    email: string;
    label?: string;
  }>;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  location?: {
    coordinates: [number, number];
  };
  website?: string;
  isEmergency?: boolean;
  priority?: number;
  jurisdiction?: string;
  applicableLocations?: Array<{
    city?: string;
    state?: string;
    pincode?: string;
  }>;
  operatingHours?: {
    is24x7?: boolean;
    schedule?: Array<{
      day: string;
      open: string;
      close: string;
    }>;
  };
  services?: string[];
  languages?: string[];
  icon?: string;
}

export const contactService = {
  /**
   * Create a new contact (admin only)
   */
  createContact: async (data: CreateContactData) => {
    const response = await api.post('/contacts', data);
    return response.data.data.contact;
  },

  /**
   * Get all contacts
   */
  getContacts: async (filters: {
    page?: number;
    limit?: number;
    category?: string;
    isEmergency?: boolean;
    search?: string;
    city?: string;
    state?: string;
  } = {}) => {
    const response = await api.get('/contacts', { params: filters });
    return response.data.data;
  },

  /**
   * Get single contact
   */
  getContact: async (id: string) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data.data.contact;
  },

  /**
   * Update contact (admin only)
   */
  updateContact: async (id: string, data: Partial<CreateContactData>) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data.data.contact;
  },

  /**
   * Delete contact (admin only)
   */
  deleteContact: async (id: string) => {
    await api.delete(`/contacts/${id}`);
  },

  /**
   * Get emergency contacts
   */
  getEmergencyContacts: async (limit = 10) => {
    const response = await api.get('/contacts/emergency', { params: { limit } });
    return response.data.data.contacts;
  },

  /**
   * Get contacts by category
   */
  getByCategory: async (category: string, page = 1, limit = 20) => {
    const response = await api.get(`/contacts/category/${category}`, {
      params: { page, limit }
    });
    return response.data.data.contacts;
  },

  /**
   * Search contacts
   */
  searchContacts: async (query: string, category?: string) => {
    const response = await api.get('/contacts/search', {
      params: { q: query, category }
    });
    return response.data.data.contacts;
  },

  /**
   * Get nearby contacts
   */
  getNearby: async (lat: number, lng: number, radius = 10000, category?: string) => {
    const response = await api.get('/contacts/nearby', {
      params: { lat, lng, radius, category }
    });
    return response.data.data.contacts;
  },

  /**
   * Get contact categories
   */
  getCategories: async () => {
    const response = await api.get('/contacts/categories');
    return response.data.data.categories;
  },

  /**
   * Record contact call
   */
  recordCall: async (id: string) => {
    await api.post(`/contacts/${id}/call`);
  }
};