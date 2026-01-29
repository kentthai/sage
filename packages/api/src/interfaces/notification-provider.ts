import type { Notification, NotificationType } from '@sage/shared';

/**
 * Notification provider interface.
 * Implementations: Email, push notifications, in-app, etc.
 */
export interface INotificationProvider {
  /**
   * Send a notification to a user
   */
  send(notification: SendNotificationDTO): Promise<Notification>;

  /**
   * Send notifications to multiple users
   */
  sendBatch(
    notifications: SendNotificationDTO[]
  ): Promise<Notification[]>;

  /**
   * Schedule a notification for later
   */
  schedule(
    notification: SendNotificationDTO,
    sendAt: Date
  ): Promise<ScheduledNotification>;

  /**
   * Cancel a scheduled notification
   */
  cancelScheduled(notificationId: string): Promise<void>;

  /**
   * Get user's notifications
   */
  getForUser(
    userId: string,
    options?: NotificationQueryOptions
  ): Promise<Notification[]>;

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Promise<void>;

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Promise<void>;

  /**
   * Delete a notification
   */
  delete(notificationId: string): Promise<void>;

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string): Promise<number>;

  /**
   * Subscribe user to notification channel
   */
  subscribe(
    userId: string,
    channel: NotificationChannel,
    endpoint: string
  ): Promise<void>;

  /**
   * Unsubscribe user from notification channel
   */
  unsubscribe(
    userId: string,
    channel: NotificationChannel
  ): Promise<void>;

  /**
   * Get user's notification preferences
   */
  getPreferences(
    userId: string
  ): Promise<NotificationPreferences>;

  /**
   * Update user's notification preferences
   */
  updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences>;
}

export interface SendNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  channels?: NotificationChannel[];
  data?: Record<string, unknown>;
}

export interface ScheduledNotification {
  id: string;
  notification: SendNotificationDTO;
  sendAt: Date;
  status: 'scheduled' | 'sent' | 'cancelled';
}

export interface NotificationQueryOptions {
  unreadOnly?: boolean;
  types?: NotificationType[];
  limit?: number;
  offset?: number;
}

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export interface NotificationPreferences {
  channels: {
    [key in NotificationChannel]?: boolean;
  };
  types: {
    [key in NotificationType]?: {
      enabled: boolean;
      channels: NotificationChannel[];
    };
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
}
