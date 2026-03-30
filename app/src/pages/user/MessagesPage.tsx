/**
 * Messages Page - AUREX Civic Issue Reporting System
 *
 * User-Admin messaging interface with real-time chat.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { messageService } from '../../services/messageService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  MoreVertical,
  Image as ImageIcon,
  Loader2,
  Search,
  Send,
  Smile,
  X
} from 'lucide-react';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface Message {
  _id: string;
  tempId?: string;
  content?: string;
  sender?: {
    _id: string;
    name?: string;
    avatar?: string;
    role?: string;
  };
  recipient?: {
    _id: string;
    name?: string;
    avatar?: string;
    role?: string;
  };
  createdAt?: string;
  sentAt?: string;
  status?: MessageStatus;
  isEdited?: boolean;
  messageType?: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'system';
  media?: {
    url: string;
    publicId?: string;
    thumbnail?: string;
  };
  replyTo?: {
    _id: string;
    content?: string;
    sender?: {
      _id: string;
      name?: string;
    };
  };
}

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  lastMessage?: Message;
  unreadCount?: number;
}

interface TypingState {
  userId: string;
  name?: string;
  isTyping: boolean;
}

const MESSAGE_PAGE_SIZE = 25;

const getConversationId = (userA?: string, userB?: string) => {
  if (!userA || !userB) return '';
  return [userA, userB].sort().join('_');
};

const getMessageTime = (message: Message) => {
  const date = message.createdAt ?? message.sentAt;
  if (!date) return Date.now();
  return new Date(date).getTime();
};

const formatTime = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const messagePreview = (message: Message | undefined, t: (key: string) => string) => {
  if (!message) return t('messages.noMessages');
  if (message.messageType === 'image') return t('messages.photo');
  if (message.messageType === 'document') return t('messages.document');
  return message.content || t('messages.message');
};

const mergeMessages = (existing: Message[], incoming: Message[]) => {
  const map = new Map<string, Message>();
  existing.forEach((message) => {
    const key = message._id || message.tempId || `${getMessageTime(message)}-${message.content}`;
    map.set(key, message);
  });
  incoming.forEach((message) => {
    const key = message._id || message.tempId || `${getMessageTime(message)}-${message.content}`;
    if (map.has(key)) {
      map.set(key, { ...map.get(key), ...message });
    } else {
      map.set(key, message);
    }
  });
  return Array.from(map.values()).sort((a, b) => getMessageTime(a) - getMessageTime(b));
};

const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
);

interface ConversationListProps {
  conversations: Conversation[];
  activeUserId: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelect: (userId: string) => void;
  t: (key: string) => string;
}

const ConversationList = React.memo(
  ({
    conversations,
    activeUserId,
    isLoading,
    isAdmin,
    searchValue,
    onSearchChange,
    onSelect,
    t
  }: ConversationListProps) => {
    return (
      <aside className="flex h-full flex-col border-r border-border bg-card/60 backdrop-blur">
        <div className="sticky top-0 z-10 border-b border-border bg-card/90 px-4 py-3">
          <h2 className="text-lg font-semibold">{t('messages.title')}</h2>
          {isAdmin && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={t('messages.search')}
                className="h-7 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <ConversationSkeleton key={`conversation-skeleton-${index}`} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              {t('messages.noConversations')}
            </div>
          ) : (
            conversations.map((conversation) => {
              const isActive = conversation.otherUser?._id === activeUserId;
              return (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => {
                    const id = conversation.otherUser?._id;
                    if (id) onSelect(id);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={conversation.otherUser?.avatar} />
                      <AvatarFallback>
                        {conversation.otherUser?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">
                        {conversation.otherUser?.name || t('messages.user')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage?.createdAt || conversation.lastMessage?.sentAt)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-muted-foreground">
                        {messagePreview(conversation.lastMessage, t)}
                      </span>
                      {(conversation.unreadCount || 0) > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    );
  }
);

ConversationList.displayName = 'ConversationList';

interface ChatHeaderProps {
  userName: string;
  avatar?: string;
  isOnline: boolean;
  showBack: boolean;
  onBack: () => void;
  t: (key: string) => string;
}

const ChatHeader = React.memo(
  ({ userName, avatar, isOnline, showBack, onBack, t }: ChatHeaderProps) => {
    return (
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back" className="md:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatar} />
          <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold leading-tight">{userName || t('messages.user')}</p>
          <p className={`text-xs ${isOnline ? 'text-emerald-500' : 'text-muted-foreground'}`}>
            {isOnline ? t('messages.online') : t('messages.offline')}
          </p>
        </div>
      </div>
    );
  }
);

ChatHeader.displayName = 'ChatHeader';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  typingState?: TypingState;
  onLoadMore: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  currentUserId?: string;
  onReply: (message: Message) => void;
  onDelete: (message: Message) => void;
  t: (key: string) => string;
}

const ChatMessages = React.memo(
  ({
    messages,
    isLoading,
    hasMore,
    typingState,
    onLoadMore,
    scrollRef,
    onScroll,
    currentUserId,
    onReply,
    onDelete,
    t
  }: ChatMessagesProps) => {
    const swipeRef = useRef<{ id?: string; x: number; y: number } | null>(null);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, messageId?: string) => {
      swipeRef.current = {
        id: messageId,
        x: event.clientX,
        y: event.clientY
      };
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>, message: Message) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || start.id !== (message._id || message.tempId)) return;
      const deltaX = event.clientX - start.x;
      const deltaY = Math.abs(event.clientY - start.y);
      if (deltaX > 60 && deltaY < 40) {
        onReply(message);
      }
    };

    const renderReplyPreview = (message: Message) => {
      if (!message.replyTo) return null;
      const replyName = message.replyTo.sender?.name || t('messages.someone');
      const replyText = message.replyTo.content || t('messages.attachment');
      return (
        <div className="mb-2 rounded-lg border-l-4 border-primary/70 bg-background/50 px-2 py-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{replyName}</span>
          <span className="ml-1">{replyText}</span>
        </div>
      );
    };

    return (
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
            {hasMore && (
              <div className="mb-3 flex justify-center">
                <Button variant="ghost" size="sm" onClick={onLoadMore}>
                  {t('messages.loadOlder')}
                </Button>
              </div>
            )}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`message-skeleton-${index}`} className="h-14 w-3/4" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t('messages.emptyPrompt')}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isOwn = message.sender?._id === currentUserId;
              const bubbleClasses = isOwn
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted text-foreground rounded-bl-md';
              return (
                <div
                  key={message._id || message.tempId}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  onPointerDown={(event) => handlePointerDown(event, message._id || message.tempId)}
                  onPointerUp={(event) => handlePointerUp(event, message)}
                  onPointerCancel={() => {
                    swipeRef.current = null;
                  }}
                >
                  <div className={`relative max-w-[75%] rounded-2xl px-4 py-2 ${bubbleClasses}`}>
                    {renderReplyPreview(message)}
                    {message.messageType === 'image' && message.media?.url ? (
                      <img
                        src={message.media.url}
                        alt="Message attachment"
                        className="mb-2 max-h-60 w-full rounded-xl object-cover"
                      />
                    ) : null}
                    {message.content && <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
                    <div className={`mt-1 flex items-center justify-end gap-1 text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      <span>{formatTime(message.createdAt || message.sentAt)}</span>
                      {isOwn && (
                        message.status === 'read' ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : message.status === 'sending' ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )
                      )}
                    </div>
                    <div className={`absolute -top-3 ${isOwn ? 'left-0' : 'right-0'}`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition hover:text-foreground"
                            aria-label="Message actions"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side={isOwn ? 'left' : 'right'} align="start">
                          <DropdownMenuItem onClick={() => onReply(message)}>
                            {t('messages.reply')}
                          </DropdownMenuItem>
                          {isOwn && (
                            <DropdownMenuItem
                              onClick={() => onDelete(message)}
                              variant="destructive"
                            >
                              {t('messages.delete')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
            {typingState?.isTyping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {typingState.name
                    ? `${typingState.name} ${t('messages.isTyping')}`
                    : t('messages.someoneTyping')}
                </span>
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileChange: (file: File | null) => void;
  previewUrl?: string;
  onRemoveImage: () => void;
  onEmojiSelect: (emoji: string) => void;
  replyTo?: Message | null;
  onCancelReply: () => void;
  t: (key: string) => string;
  language: 'en' | 'ta' | 'hi';
}

const ChatInput = React.memo(
  ({
    value,
    onChange,
    onSend,
    onFileChange,
    previewUrl,
    onRemoveImage,
    onEmojiSelect,
    replyTo,
    onCancelReply,
    t,
    language
  }: ChatInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const emojiList = [
      '😀', '😄', '😊', '😍', '😘', '😎', '🥳', '😇',
      '😢', '😡', '😴', '🤔', '👍', '👎', '👏', '🙏',
      '🔥', '🎉', '❤️', '💡', '✅', '❌', '🚀', '✨'
    ];

    const handleFilePick = () => {
      fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      onFileChange(file);
    };

    return (
      <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        {replyTo && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <div className="flex-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {t('messages.replyingTo')} {replyTo.sender?.name || t('messages.someone')}
              </span>
              <div className="truncate">
                {replyTo.content ||
                  (replyTo.messageType === 'image' ? t('messages.photo') : t('messages.message'))}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancelReply} className="h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {previewUrl && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border border-border bg-background p-2">
            <img src={previewUrl} alt="Preview" className="h-14 w-14 rounded-lg object-cover" />
            <span className="text-sm text-muted-foreground">{t('messages.imageReady')}</span>
            <Button variant="ghost" size="icon" onClick={onRemoveImage} className="ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          <Button variant="ghost" size="icon" onClick={handleFilePick} aria-label="Upload image">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Emoji picker">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="grid grid-cols-8 gap-1">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition hover:bg-muted"
                    onClick={() => {
                      onEmojiSelect(emoji);
                      setIsEmojiOpen(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex-1 rounded-2xl border border-border bg-background px-3 py-2">
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={t('messages.typeMessage')}
              lang={language}
              className="border-0 p-0 text-sm focus-visible:ring-0"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  onSend();
                }
              }}
            />
          </div>
          <Button onClick={onSend} className="h-10 w-10 rounded-full p-0" aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default function MessagesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage, emitTyping } = useSocket();

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(userId || null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [loadingByConversation, setLoadingByConversation] = useState<Record<string, boolean>>({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<Record<string, boolean>>({});
  const [pageByConversation, setPageByConversation] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [typingByConversation, setTypingByConversation] = useState<Record<string, TypingState>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = useState<{ file: File; preview: string } | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveUserId(userId || null);
  }, [userId]);

  const filteredConversations = useMemo(() => {
    if (!searchValue.trim()) return conversations;
    const query = searchValue.toLowerCase();
    return conversations.filter((conversation) =>
      (conversation.otherUser?.name?.toLowerCase() || '').includes(query)
    );
  }, [conversations, searchValue]);

  const selectConversation = useCallback(
    (targetUserId: string) => {
      if (!targetUserId) return;
      navigate(`/messages/${targetUserId}`);
    },
    [navigate]
  );

  const updateConversationPreview = useCallback((message: Message, otherUserId?: string) => {
    if (!otherUserId) return;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.otherUser?._id === otherUserId
          ? { ...conversation, lastMessage: message }
          : conversation
      )
    );
  }, []);

  const incrementUnread = useCallback((otherUserId?: string) => {
    if (!otherUserId) return;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.otherUser?._id === otherUserId
          ? { ...conversation, unreadCount: (conversation.unreadCount || 0) + 1 }
          : conversation
      )
    );
  }, []);

  const resetUnread = useCallback((otherUserId?: string) => {
    if (!otherUserId) return;
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.otherUser?._id === otherUserId ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isAdmin) {
        const data = await messageService.getConversations();
        setConversations(data || []);
      } else {
        const admins = await messageService.getAdmins();
        const adminUser = admins?.[0];
        if (adminUser) {
          setConversations([
            {
              _id: getConversationId(user._id, adminUser._id),
              otherUser: adminUser,
              lastMessage: undefined,
              unreadCount: 0
            }
          ]);
          if (!userId) {
            navigate(`/messages/${adminUser._id}`, { replace: true });
          }
        } else {
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, navigate, user, userId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const fetchMessages = useCallback(
    async (conversationId: string, otherUserId: string, page = 1) => {
      if (!conversationId || !otherUserId) return;
      setLoadingByConversation((prev) => ({ ...prev, [conversationId]: true }));
      try {
        const data = await messageService.getConversation(otherUserId, page, MESSAGE_PAGE_SIZE);
        const sorted = [...data].reverse();
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: mergeMessages(page === 1 ? [] : prev[conversationId] || [], sorted)
        }));
        setHasMoreByConversation((prev) => ({ ...prev, [conversationId]: data.length >= MESSAGE_PAGE_SIZE }));
        setPageByConversation((prev) => ({ ...prev, [conversationId]: page }));
        resetUnread(otherUserId);
        messageService.markConversationAsRead(otherUserId).catch(() => undefined);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoadingByConversation((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [resetUnread]
  );

  useEffect(() => {
    if (!user || !activeUserId) return;
    const conversationId = getConversationId(user._id, activeUserId ?? undefined);
    setActiveConversationId(conversationId);
    setReplyToMessage(null);
    fetchMessages(conversationId, activeUserId, 1);

    joinConversation(conversationId);
    socket?.emit('join_room', conversationId);

    return () => {
      leaveConversation(conversationId);
      socket?.emit('leave_room', conversationId);
    };
  }, [activeUserId, fetchMessages, joinConversation, leaveConversation, socket, user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleIncomingMessage = (message: Message) => {
      const senderId = message?.sender?._id;
      const recipientId = message?.recipient?._id;
      const otherUserId = senderId === user._id ? recipientId : senderId;
      if (!otherUserId) return;
      const conversationId = getConversationId(user._id, otherUserId);

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: mergeMessages(prev[conversationId] || [], [message])
      }));
      updateConversationPreview(message, otherUserId);

      if (conversationId !== activeConversationId) {
        incrementUnread(otherUserId);
      } else {
        messageService.markConversationAsRead(otherUserId).catch(() => undefined);
      }
    };

    const handlePreviousMessages = (payload: { messages: Message[]; userId?: string }) => {
      const otherId = payload?.userId;
      if (!otherId) return;
      const conversationId = getConversationId(user._id, otherId);
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]: mergeMessages(prev[conversationId] || [], payload.messages || [])
      }));
    };

    const handleTyping = (payload: { userId?: string; isTyping?: boolean; name?: string; conversationId?: string }) => {
      const conversationId = payload?.conversationId || (payload?.userId ? getConversationId(user._id, payload.userId) : '');
      if (!conversationId || payload?.userId === user._id) return;
      setTypingByConversation((prev) => ({
        ...prev,
        [conversationId]: {
          userId: payload.userId || '',
          name: payload.name,
          isTyping: !!payload.isTyping
        }
      }));
    };

    const handleOnline = (payload: { userId?: string }) => {
      if (!payload?.userId) return;
      const userId = payload.userId;
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    };

    const handleOffline = (payload: { userId?: string }) => {
      if (!payload?.userId) return;
      const userId = payload.userId as string;
      setOnlineUsers((prev) => ({ ...prev, [userId]: false }));
    };

    const handleSeen = (payload: { messageId?: string; conversationId?: string }) => {
      if (!payload?.messageId || !payload.conversationId) return;
      const conversationId = payload.conversationId;
      const messageId = payload.messageId;
      setMessagesByConversation((prev) => {
        const existing = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: existing.map((message: Message) =>
            message._id === messageId ? { ...message, status: 'read' } : message
          )
        };
      });
    };

    const handleReconnect = () => {
      if (activeConversationId) {
        joinConversation(activeConversationId);
        socket.emit('join_room', activeConversationId);
      }
    };

    socket.on('receive_message', handleIncomingMessage);
    socket.on('new_message', handleIncomingMessage);
    socket.on('previous_messages', handlePreviousMessages);
    socket.on('typing_indicator', handleTyping);
    socket.on('user_typing', handleTyping);
    socket.on('user_online', handleOnline);
    socket.on('user_offline', handleOffline);
    socket.on('message_seen', handleSeen);
    socket.on('connect', handleReconnect);

    return () => {
      socket.off('receive_message', handleIncomingMessage);
      socket.off('new_message', handleIncomingMessage);
      socket.off('previous_messages', handlePreviousMessages);
      socket.off('typing_indicator', handleTyping);
      socket.off('user_typing', handleTyping);
      socket.off('user_online', handleOnline);
      socket.off('user_offline', handleOffline);
      socket.off('message_seen', handleSeen);
      socket.off('connect', handleReconnect);
    };
  }, [activeConversationId, incrementUnread, joinConversation, socket, updateConversationPreview, user]);

  const handleLoadMore = useCallback(() => {
    if (!user || !activeConversationId || !activeUserId) return;
    if (loadingByConversation[activeConversationId]) return;
    if (!hasMoreByConversation[activeConversationId]) return;
    const nextPage = (pageByConversation[activeConversationId] || 1) + 1;
    fetchMessages(activeConversationId, activeUserId, nextPage);
  }, [
    activeConversationId,
    activeUserId,
    fetchMessages,
    hasMoreByConversation,
    loadingByConversation,
    pageByConversation,
    user
  ]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    autoScrollRef.current = nearBottom;
    if (container.scrollTop < 40) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  useEffect(() => {
    if (autoScrollRef.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messagesByConversation, activeConversationId]);

  const handleTypingStart = useCallback(() => {
    if (!user || !activeConversationId) return;
    emitTyping(activeConversationId, true);
    socket?.emit('typing_start', { conversationId: activeConversationId, userId: user._id, name: user.name });
  }, [activeConversationId, emitTyping, socket, user]);

  const handleTypingStop = useCallback(() => {
    if (!user || !activeConversationId) return;
    emitTyping(activeConversationId, false);
    socket?.emit('typing_stop', { conversationId: activeConversationId, userId: user._id, name: user.name });
  }, [activeConversationId, emitTyping, socket, user]);

  const handleMessageChange = useCallback(
    (value: string) => {
      setNewMessage(value);
      if (!typingTimeoutRef.current) {
        handleTypingStart();
      } else {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
        typingTimeoutRef.current = null;
      }, 800);
    },
    [handleTypingStart, handleTypingStop]
  );

  const handleImageSelect = useCallback(
    (file: File | null) => {
      if (imagePreview?.preview) {
        URL.revokeObjectURL(imagePreview.preview);
      }
      if (!file) {
        setImagePreview(null);
        return;
      }
      const preview = URL.createObjectURL(file);
      setImagePreview({ file, preview });
    },
    [imagePreview]
  );

  const handleRemoveImage = useCallback(() => {
    if (imagePreview?.preview) {
      URL.revokeObjectURL(imagePreview.preview);
    }
    setImagePreview(null);
  }, [imagePreview]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage((prev) => `${prev}${emoji}`);
  }, []);

  const handleReply = useCallback((message: Message) => {
    setReplyToMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleDeleteMessage = useCallback(
    async (message: Message) => {
      if (!activeConversationId || !activeUserId) return;
      if (!message._id) {
        setMessagesByConversation((prev) => ({
          ...prev,
          [activeConversationId]: (prev[activeConversationId] || []).filter(
            (m) => m.tempId !== message.tempId
          )
        }));
        return;
      }
      if (!confirm('Delete this message?')) return;
      try {
        await messageService.deleteMessage(message._id);
        setMessagesByConversation((prev) => {
          const updated = (prev[activeConversationId] || []).filter((m) => m._id !== message._id);
          setConversations((prevConversations) =>
            prevConversations.map((conversation) => {
              if (conversation.otherUser?._id !== activeUserId) return conversation;
              const lastMessage = updated[updated.length - 1];
              return { ...conversation, lastMessage };
            })
          );
          return { ...prev, [activeConversationId]: updated };
        });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    },
    [activeConversationId, activeUserId, messagesByConversation]
  );

  const handleSendMessage = useCallback(async () => {
    if (!user || !activeConversationId || !activeUserId) return;
    const convId = activeConversationId;
    const recipientId = activeUserId;

    const hasContent = newMessage.trim().length > 0;
    const hasImage = !!imagePreview?.file;
    if (!hasContent && !hasImage) return;

    const tempId = `temp-${Date.now()}`;
    const previewUrl = imagePreview?.preview;
    const optimisticMessage: Message = {
      _id: tempId,
      tempId,
      content: hasContent ? newMessage.trim() : undefined,
      sender: { _id: user._id, name: user.name, avatar: user.avatar, role: user.role },
      recipient: { _id: recipientId },
      createdAt: new Date().toISOString(),
      status: 'sending',
      messageType: hasImage ? 'image' : 'text',
      media: hasImage ? { url: previewUrl || '' } : undefined,
      replyTo: replyToMessage
        ? {
            _id: replyToMessage._id,
            content: replyToMessage.content,
            sender: replyToMessage.sender
          }
        : undefined
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [convId]: mergeMessages(prev[convId] || [], [optimisticMessage])
    }));
    updateConversationPreview(optimisticMessage, recipientId);
    setNewMessage('');
    if (hasImage) {
      setImagePreview(null);
    }
    if (replyToMessage) {
      setReplyToMessage(null);
    }

    try {
      let uploadedMedia: Message['media'] | undefined;
      if (hasImage && imagePreview?.file) {
        uploadedMedia = await messageService.uploadMessageImage(imagePreview.file);
      }

      const messagePayload = await messageService.sendMessage({
        recipientId,
        content: hasContent ? newMessage.trim() : 'Image',
        messageType: hasImage ? 'image' : 'text',
        ...(uploadedMedia?.publicId ? { media: { url: uploadedMedia.url, publicId: uploadedMedia.publicId, thumbnail: uploadedMedia.thumbnail } } : {}),
        ...(replyToMessage?._id ? { replyTo: replyToMessage._id } : {})
      });

      sendMessage(convId, messagePayload);

      setMessagesByConversation((prev) => ({
        ...prev,
        [convId]: mergeMessages(
          (prev[convId] || []).filter((message) => message.tempId !== tempId),
          [messagePayload]
        )
      }));
      updateConversationPreview(messagePayload, recipientId);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessagesByConversation((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((message) =>
          message.tempId === tempId ? { ...message, status: 'failed' } : message
        )
      }));
    } finally {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  }, [
    activeConversationId,
    activeUserId,
    imagePreview,
    newMessage,
    replyToMessage,
    sendMessage,
    updateConversationPreview,
    user
  ]);

  const activeMessages = activeConversationId ? messagesByConversation[activeConversationId] || [] : [];
  const typingState = activeConversationId ? typingByConversation[activeConversationId] : undefined;
  const activeConversation = conversations.find((conversation) => conversation.otherUser?._id === activeUserId);
  const isOnline = activeUserId ? onlineUsers[activeUserId] : false;

  const handleBack = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  const chatPanel = (
    <div className="flex h-full flex-col bg-background">
      {activeConversation ? (
        <ChatHeader
          userName={activeConversation.otherUser?.name || t('messages.user')}
          avatar={activeConversation.otherUser?.avatar}
          isOnline={!!isOnline}
          showBack={isAdmin}
          onBack={handleBack}
          t={t}
        />
      ) : (
        <div className="border-b border-border px-4 py-4 text-sm text-muted-foreground">
          {t('messages.selectConversation')}
        </div>
      )}

      {activeConversation ? (
        <>
          <ChatMessages
            messages={activeMessages}
            isLoading={!!loadingByConversation[activeConversationId || '']}
            hasMore={!!hasMoreByConversation[activeConversationId || '']}
            typingState={typingState}
            onLoadMore={handleLoadMore}
            scrollRef={scrollRef}
            onScroll={handleScroll}
            currentUserId={user?._id}
            onReply={handleReply}
            onDelete={handleDeleteMessage}
            t={t}
          />
          <ChatInput
            value={newMessage}
            onChange={handleMessageChange}
            onSend={handleSendMessage}
            onFileChange={handleImageSelect}
            previewUrl={imagePreview?.preview}
            onRemoveImage={handleRemoveImage}
            onEmojiSelect={handleEmojiSelect}
            replyTo={replyToMessage}
            onCancelReply={handleCancelReply}
            t={t}
            language={language}
          />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          {isAdmin ? t('messages.pickConversation') : t('messages.noAdmin')}
        </div>
      )}
    </div>
  );

  const showMobileChat = !!activeUserId;

  return (
    <div className="h-[calc(100vh-5rem)] w-full rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative flex h-full overflow-hidden">
        {isAdmin && (
          <div
            className={`absolute inset-0 z-10 w-full transition-transform duration-300 md:static md:z-auto md:w-80 lg:w-96 ${
              showMobileChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
            }`}
          >
            <ConversationList
              conversations={filteredConversations}
              activeUserId={activeUserId}
              isLoading={isLoading}
              isAdmin={isAdmin}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onSelect={selectConversation}
              t={t}
            />
          </div>
        )}

        <div
          className={`absolute inset-0 flex-1 transition-transform duration-300 md:static md:translate-x-0 ${
            isAdmin && !showMobileChat ? 'translate-x-full md:translate-x-0' : 'translate-x-0'
          }`}
        >
          {chatPanel}
        </div>
      </div>
      {!isConnected && (
        <div className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          {t('messages.reconnecting')}
        </div>
      )}
    </div>
  );
}
