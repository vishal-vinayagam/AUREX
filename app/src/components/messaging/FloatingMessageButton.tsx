/**
 * Floating Message Button - AUREX Civic Issue Reporting System
 * 
 * Quick access button for messaging with admins.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  X,
  Users,
  ChevronRight
} from 'lucide-react';

interface FloatingMessageButtonProps {
  unreadCount?: number;
}

export default function FloatingMessageButton({ unreadCount = 0 }: FloatingMessageButtonProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Mock admins list
  const admins = [
    { id: 'support', name: 'Support Team', role: 'admin', isOnline: true, path: '/messages' },
    { id: 'emergency', name: 'Emergency Response', role: 'admin', isOnline: true, path: '/emergency' },
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 text-white rotate-90'
            : 'bg-primary text-primary-foreground hover:scale-110'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="fixed bottom-40 right-4 z-40 w-72 bg-card border border-border rounded-2xl shadow-2xl animate-slideUp">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Message Admin</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  onClick={() => {
                    navigate(admin.path);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    {admin.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {admin.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            <div className="mt-2" />
          </div>
        </div>
      )}
    </>
  );
}
