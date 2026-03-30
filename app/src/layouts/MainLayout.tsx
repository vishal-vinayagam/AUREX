/**
 * Main Layout - AUREX Civic Issue Reporting System
 * 
 * Layout for authenticated user pages with top navbar and bottom navigation.
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { messageService } from '../services/messageService';

// Components
import TopNavbar from '../components/navigation/TopNavbar';
import BottomNavbar from '../components/navigation/BottomNavbar';
import FloatingMessageButton from '../components/messaging/FloatingMessageButton';

export default function MainLayout() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if current page is messages (hide floating button)
  const isMessagesPage = location.pathname.startsWith('/messages');

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
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <TopNavbar unreadCount={unreadCount} />

      {/* Main Content */}
      <main className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavbar />

      {/* Floating Message Button */}
      {!isMessagesPage && user?.role === 'user' && (
        <FloatingMessageButton unreadCount={unreadCount} />
      )}
    </div>
  );
}