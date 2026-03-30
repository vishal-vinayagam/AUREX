/**
 * Auth Layout - AUREX Civic Issue Reporting System
 * 
 * Layout for authentication pages (login, register, forgot password).
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from '../components/navigation/BrandLogo';

export default function AuthLayout() {
  const { resolvedTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <BrandLogo showText={false} imageClassName="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">{t('app.name')}</h1>
              <p className="text-xs text-muted-foreground">{t('app.tagline')}</p>
            </div>
          </div>

          {/* Content */}
          <Outlet />
        </div>
      </div>

      {/* Right side - Image/Pattern (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              Empowering Communities
            </h2>
            <p className="text-muted-foreground mb-8">
              Report civic issues, track progress, and stay informed about your community. 
              Together, we can make our cities better.
            </p>
            
            {/* Feature list */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Easy issue reporting with photos & location</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Real-time status tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Direct communication with officials</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Community engagement & awareness</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
