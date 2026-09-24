import { OrderStatus } from '@shared/data-access/model/order.model';
import { AdminOrderNotificationEventType } from '../data-access/dto/admin-notification.dto';

export type NotificationConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface AdminNotification {
  readonly id: string;
  readonly orderCode: string;
  readonly status: OrderStatus;
  readonly eventType: AdminOrderNotificationEventType;
  readonly title: string;
  readonly message: string;
  readonly occurredAt: Date;
  readonly read: boolean;
}
