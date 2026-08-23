export type NotificationChannel = 'in_app' | 'email' | 'push';

export type NotificationType = 'answer.created' | 'mention' | 'moderation' | 'job.failed' | 'social.failed';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  channel: NotificationChannel;
  readAt?: string;
}

export { createNotification, listNotifications, markNotificationRead } from './store';

