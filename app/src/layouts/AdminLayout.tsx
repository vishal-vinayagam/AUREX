/**
 * Admin Layout - AUREX Civic Issue Reporting System
 * 
 * Layout for admin pages with sidebar navigation.
 */

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { messageService } from '../services/messageService';

// Components
import BottomNavbar from '../components/navigation/BottomNavbar';
import BrandLogo from '../components/navigation/BrandLogo';

// Icons
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  BookOpen,
  Phone,
  Settings,
  ChevronLeft
} from 'lucide-react';import { useNavigate } from 'react-router-dom';
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await messageService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/community', icon: MessageSquare, label: 'Community' },
    { path: '/admin/laws', icon: BookOpen, label: 'Laws' },
    { path: '/admin/contacts', icon: Phone, label: 'Contacts' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo
              showText={isSidebarOpen}
              text={t('app.name')}
              imageClassName="w-8 h-8"
              textClassName="font-bold text-lg leading-tight text-foreground truncate"
            />
            {isSidebarOpen && (
              <div>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-muted rounded"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${!isSidebarOpen && 'rotate-180'}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="font-medium">{user?.name?.charAt(0)}</span>
              )}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <BrandLogo
                showText
                text="AUREX"
                imageClassName="w-8 h-8"
                textClassName="font-bold text-base tracking-[0.06em] text-foreground"
              />
            </div>
            <h2 className="text-lg font-semibold hidden md:block">
              {navItems.find(item => location.pathname.startsWith(item.path))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Messages */}
            <NavLink
              to="/messages"
              className="relative p-2 hover:bg-muted rounded-lg"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>

            {/* Settings */}
            <NavLink
              to="/settings"
              className="p-2 hover:bg-muted rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">{user?.name?.charAt(0)}</span>
                )}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>
        {/* floating button to contacts (visible on admin pages except when already there) */}
        {location.pathname.startsWith('/admin') && location.pathname !== '/admin/contacts' && (
          <button
            onClick={() => navigate('/admin/contacts')}
            className="fixed bottom-24 lg:bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition z-50"
            title="Manage contacts"
          >
            <Phone className="w-5 h-5" />
          </button>
        )}

        {/* Bottom Navigation (Mobile) */}
        <div className="lg:hidden">
          <BottomNavbar />
        </div>
      </div>
    </div>
  );
}
