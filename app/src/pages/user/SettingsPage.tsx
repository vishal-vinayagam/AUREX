/**
 * Settings Page - AUREX Civic Issue Reporting System
 * 
 * User settings including theme, language, and notifications.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import BrandLogo from '../../components/navigation/BrandLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  Moon,
  Sun,
  Globe,
  Bell,
  Mail,
  MessageSquare,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone
} from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { success: showSuccess } = useNotification();
  const [activeLegal, setActiveLegal] = useState<'help' | 'privacy' | 'terms' | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    showSuccess('Logged out successfully');
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
  ];

  const legalContent = {
    help: {
      title: 'Help & Support',
      description: 'Get quick guidance on using AUREX and how to reach support.',
      sections: [
        {
          title: 'About AUREX',
          body:
            'AUREX is a civic issue reporting platform where citizens can report local issues, follow updates, and access emergency contacts and civic information.'
        },
        {
          title: 'How to Report',
          body:
            'Create a report with title, category, description, location, and optional image. You can also choose to share the report in the community.'
        },
        {
          title: 'Track Your Report',
          body:
            'Use the Track page to see status updates and official responses. You can reply in the Official Response section.'
        },
        {
          title: 'Community & Stories',
          body:
            'Community posts help residents stay informed about announcements, events, emergencies, and notices. Stories are short-lived updates with views.'
        },
        {
          title: 'Support',
          body:
            'If you face any issue with login, posting, or reports, contact the support team from the messaging screen.'
        }
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      description: 'How AUREX collects, uses, and protects your data.',
      sections: [
        {
          title: 'Data We Collect',
          body:
            'We collect your name, email, phone, profile picture (if uploaded), reports, community posts, and interactions within the app.'
        },
        {
          title: 'Location Information',
          body:
            'Location is used only to help authorities and users understand the place of the issue. You control what you share in a report.'
        },
        {
          title: 'How We Use Data',
          body:
            'Data is used to create reports, show status updates, enable community posts, and improve safety communication.'
        },
        {
          title: 'Data Sharing',
          body:
            'We do not sell personal data. Report details may be visible to authorized admins and relevant community viewers.'
        },
        {
          title: 'Security',
          body:
            'Passwords are stored securely. Access is role-based for users and admins.'
        }
      ]
    },
    terms: {
      title: 'Terms & Conditions',
      description: 'Rules for using AUREX responsibly and safely.',
      sections: [
        {
          title: 'User Responsibility',
          body:
            'Provide accurate information when submitting reports. Do not post false, misleading, or harmful content.'
        },
        {
          title: 'Community Guidelines',
          body:
            'Respect other users. Content that is abusive, hateful, or illegal may be removed.'
        },
        {
          title: 'Content Ownership',
          body:
            'You own the content you submit. You grant AUREX permission to display it within the app for civic awareness.'
        },
        {
          title: 'Service Availability',
          body:
            'AUREX is provided as-is. Features may be updated or changed to improve service.'
        },
        {
          title: 'Account Access',
          body:
            'Accounts violating these terms may be suspended or removed by administrators.'
        }
      ]
    }
  } as const;

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sun className="w-5 h-5" />
            {t('settings.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resolvedTheme === 'dark' ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">{t('settings.darkMode')}</p>
                <p className="text-sm text-muted-foreground">
                  {resolvedTheme === 'dark' ? 'Dark theme is on' : 'Light theme is on'}
                </p>
              </div>
            </div>
            <Switch
              checked={resolvedTheme === 'dark'}
              onCheckedChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('settings.language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code as 'en' | 'ta' | 'hi')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  language === lang.code
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
                {language === lang.code && (
                  <span className="text-primary-foreground">✓</span>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('settings.notifications')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('settings.pushNotifications')}</p>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('settings.emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Support & Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Support & Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setActiveLegal('help')}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <span>{t('settings.help')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setActiveLegal('privacy')}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span>{t('settings.privacy')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setActiveLegal('terms')}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span>{t('settings.terms')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <BrandLogo showText={false} imageClassName="w-16 h-16" />
          </div>
          <h3 className="font-semibold">{t('app.name')}</h3>
          <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2026 AUREX. All rights reserved.
          </p>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        {t('nav.logout')}
      </Button>

      {/* Support & Legal Dialog */}
      <Dialog open={!!activeLegal} onOpenChange={(open) => setActiveLegal(open ? activeLegal : null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeLegal ? legalContent[activeLegal].title : ''}</DialogTitle>
            <DialogDescription>
              {activeLegal ? legalContent[activeLegal].description : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {activeLegal &&
              legalContent[activeLegal].sections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="font-semibold">{section.title}</p>
                  <p className="text-sm text-muted-foreground">{section.body}</p>
                </div>
              ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setActiveLegal(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
