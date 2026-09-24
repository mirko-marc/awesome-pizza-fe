export type AdminOrderNotificationEventType = 'ORDER_CREATED' | 'ORDER_STATUS_CHANGED';

export interface AdminOrderNotificationDto {
  readonly orderCode: string;
  readonly status: string;
  readonly eventType: AdminOrderNotificationEventType;
  readonly occurredAt: string;
}
