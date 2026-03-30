/**
 * Socket Context - AUREX Civic Issue Reporting System
 * 
 * Provides real-time communication via Socket.io.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, message: Record<string, unknown>) => void;
  onNewMessage: (callback: (message: Record<string, unknown>) => void) => void;
  onUserTyping: (callback: (data: Record<string, unknown>) => void) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Authenticate with user ID
      if (user) {
        newSocket.emit('authenticate', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user]);

  const joinConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  }, [socket]);

  const sendMessage = useCallback((conversationId: string, message: Record<string, unknown>) => {
    if (socket) {
      socket.emit('send_message', { conversationId, ...message });
    }
  }, [socket]);

  const onNewMessage = useCallback((callback: (message: Record<string, unknown>) => void) => {
    if (socket) {
      socket.on('new_message', callback);
      return () => {
        socket.off('new_message', callback);
      };
    }
    return () => {};
  }, [socket]);

  const onUserTyping = useCallback((callback: (data: Record<string, unknown>) => void) => {
    if (socket) {
      socket.on('user_typing', callback);
      return () => {
        socket.off('user_typing', callback);
      };
    }
    return () => {};
  }, [socket]);

  const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socket && user) {
      socket.emit('typing', { conversationId, userId: user.id, isTyping });
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        onNewMessage,
        onUserTyping,
        emitTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}