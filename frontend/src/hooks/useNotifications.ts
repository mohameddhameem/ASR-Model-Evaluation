import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((
    message: string, 
    type: NotificationType = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substring(7);
    
    // Use sonner for display
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.info(message);
    }

    // Also track in state
    const notification: Notification = { id, message, type, duration };
    setNotifications(prev => [...prev, notification]);

    // Auto-remove after duration
    if (duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const success = useCallback((message: string) => notify(message, 'success'), [notify]);
  const error = useCallback((message: string) => notify(message, 'error'), [notify]);
  const warning = useCallback((message: string) => notify(message, 'warning'), [notify]);
  const info = useCallback((message: string) => notify(message, 'info'), [notify]);

  const remove = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    remove,
  };
}
