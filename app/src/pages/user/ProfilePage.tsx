/**
 * Profile Page - AUREX Civic Issue Reporting System
 * 
 * User profile management and information display.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Camera,
  User,
  Mail,
  Phone,
  Settings,
  Edit2,
  Check,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { success: showSuccess, error: showError } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      showSuccess('Profile updated successfully');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } } | undefined;
      showError(err?.response?.data?.message ?? 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await authService.uploadAvatar(file);
      if (!updatedUser) {
        throw new Error('Server did not return user data');
      }
      updateUser(updatedUser);
      showSuccess('Profile picture updated successfully');
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      console.error('Avatar upload error:', error);
      let errorMessage = 'Failed to upload avatar';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const err = error as { response?: { data?: { message?: string } } };
        errorMessage = err?.response?.data?.message ?? 'Failed to upload avatar';
      }
      
      showError(errorMessage);
      // Clear the input on error too
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{t('nav.profile')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4" />
          </Button>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-3xl">{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-opacity hover:opacity-80">
                {isUploadingAvatar ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>
            <h2 className="text-xl font-bold mt-4">{user?.name}</h2>
            <Badge variant="secondary" className="mt-2 capitalize">
              {user?.role}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {new Date(user?.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user?.phone}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <GlobeIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Language</p>
              <p className="font-medium capitalize">{user?.preferences?.language || 'English'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
