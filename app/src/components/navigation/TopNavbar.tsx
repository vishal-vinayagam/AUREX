/**
 * Top Navbar - AUREX Civic Issue Reporting System
 * 
 * Top navigation bar with logo, notifications, and profile menu.
 */

import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import BrandLogo from './BrandLogo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Globe,
  ChevronDown,
  MessageSquare,
  X
} from 'lucide-react';

interface TopNavbarProps {
  unreadCount?: number;
}

export default function TopNavbar({ unreadCount = 0 }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your report has been resolved', time: '2h ago', read: false, link: '/track' },
    { id: 2, message: 'New announcement from admin', time: '5h ago', read: true, link: '/community' },
  ]);
  const swipeRef = useRef<{ id?: number; x: number; y: number } | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: number, link?: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (link) {
      navigate(link);
    }
  };

  const handleRemoveNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPointerDown = (event: React.PointerEvent<HTMLDivElement>, id: number) => {
    swipeRef.current = { id, x: event.clientX, y: event.clientY };
  };

  const handleNotificationPointerUp = (event: React.PointerEvent<HTMLDivElement>, id: number) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || start.id !== id) return;
    const deltaX = event.clientX - start.x;
    const deltaY = Math.abs(event.clientY - start.y);
    if (deltaX < -60 && deltaY < 40) {
      handleRemoveNotification(id);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo />
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                🇬🇧 English {language === 'en' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ta')}>
                🇮🇳 தமிழ் {language === 'ta' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('hi')}>
                🇮🇳 हिंदी {language === 'hi' && '✓'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <Link to="/messages">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="relative flex items-start gap-3 py-2 pr-10"
                    onPointerDown={(event) => handleNotificationPointerDown(event, notification.id)}
                    onPointerUp={(event) => handleNotificationPointerUp(event, notification.id)}
                    onPointerCancel={() => {
                      swipeRef.current = null;
                    }}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${
                        notification.read ? 'bg-muted' : 'bg-primary'
                      }`}
                    />
                    <div className="flex-1">
                      <span className={`block text-sm ${!notification.read ? 'font-medium' : ''}`}>
                        {notification.message}
                      </span>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveNotification(notification.id);
                      }}
                      aria-label="Remove notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
