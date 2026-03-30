/**
 * Bottom Navbar - AUREX Civic Issue Reporting System
 * 
 * Floating bottom navigation for mobile devices.
 * Inspired by Slice app design.
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Home,
  Users,
  PlusCircle,
  TrendingUp,
  BookOpen,
  LayoutDashboard,
  FileText,
  MessageSquare
} from 'lucide-react';

export default function BottomNavbar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // User navigation items
  const userNavItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/community', icon: Users, label: t('nav.community') },
    { path: '/report', icon: PlusCircle, label: t('nav.report'), isCenter: true },
    { path: '/track', icon: TrendingUp, label: t('nav.track') },
    { path: '/laws', icon: BookOpen, label: t('nav.laws') },
  ];

  // Admin navigation items
  const adminNavItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/report', icon: PlusCircle, label: 'Report', isCenter: true },
    { path: '/admin/community', icon: Users, label: 'Community' },
    { path: '/admin/laws', icon: BookOpen, label: 'Laws' },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe px-4 pb-4">
      <div className="mx-auto w-full max-w-md">
        <div
          className="
            rounded-t-3xl rounded-b-2xl border border-white/25 bg-background/65 px-2 py-2
            shadow-[0_16px_40px_-18px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset]
            backdrop-blur-xl supports-[backdrop-filter]:bg-background/55
            dark:border-white/15 dark:shadow-[0_20px_45px_-20px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset]
          "
        >
          <div className="flex items-end justify-around gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex min-w-[64px] flex-col items-center justify-center rounded-2xl px-3 py-2 transition-all duration-300 ease-in-out active:scale-95 ${
                    item.isCenter
                      ? `-mt-7 rounded-2xl bg-gradient-to-b from-primary to-primary/85 px-4 py-3 text-primary-foreground shadow-[0_10px_28px_-10px_hsl(var(--primary)/0.8),0_0_0_1px_hsl(var(--primary-foreground)/0.12)_inset] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-10px_hsl(var(--primary)/0.9),0_0_24px_hsl(var(--primary)/0.35)] ${
                          isActive ? 'scale-[1.03]' : ''
                        }`
                      : isActive
                      ? '-translate-y-1 text-primary'
                      : 'text-muted-foreground hover:-translate-y-0.5 hover:text-foreground'
                  }`
                }
              >
                {!item.isCenter && (
                  <span
                    className={`absolute inset-x-1 top-1/2 -z-10 h-9 -translate-y-1/2 rounded-2xl transition-all duration-300 ease-in-out ${
                      location.pathname === item.path
                        ? 'bg-primary/18 dark:bg-primary/24'
                        : 'bg-transparent group-hover:bg-muted/65 dark:group-hover:bg-muted/35'
                    }`}
                  />
                )}
                <item.icon
                  className={`h-5 w-5 transition-all duration-300 ease-in-out ${item.isCenter ? 'h-6 w-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]' : ''}`}
                  strokeWidth={location.pathname === item.path ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    item.isCenter ? 'text-primary-foreground/95' : ''
                  }`}
                >
                  {item.label}
                </span>
                {location.pathname === item.path && !item.isCenter && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary/90" />
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
