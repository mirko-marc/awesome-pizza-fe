import { mapOrderStatus } from '@shared/data-access/mapper/order.mapper';
import { OrderStatus } from '@shared/data-access/model/order.model';
import { AdminNotification } from '../../models/admin-notification.model';
import {
  AdminOrderNotificationDto,
  AdminOrderNotificationEventType,
} from '../dto/admin-notification.dto';

const COPY: Readonly<Record<OrderStatus, { title: string; message: string }>> = {
  RECEIVED: {
    title: 'Nuovo ordine ricevuto',
    message: 'Un nuovo ordine è entrato nella coda della cucina.',
  },
  IN_PREPARATION: {
    title: 'Ordine in lavorazione',
    message: 'La preparazione dell’ordine è iniziata.',
  },
  COMPLETED: {
    title: 'Ordine completato',
    message: 'L’ordine è stato completato ed è pronto per il ritiro.',
  },
};

export function mapAdminNotification(dto: AdminOrderNotificationDto): AdminNotification {
  const orderCode = required(dto.orderCode, 'notification.orderCode');
  const status = mapOrderStatus(dto.status);
  const eventType = mapEventType(dto.eventType);
  const occurredAt = new Date(required(dto.occurredAt, 'notification.occurredAt'));
  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error('Invalid API field: notification.occurredAt');
  }

  return {
    id: `${orderCode}-${eventType}-${occurredAt.toISOString()}`,
    orderCode,
    status,
    eventType,
    title: COPY[status].title,
    message: COPY[status].message,
    occurredAt,
    read: false,
  };
}

function mapEventType(value: unknown): AdminOrderNotificationEventType {
  if (value === 'ORDER_CREATED' || value === 'ORDER_STATUS_CHANGED') return value;
  throw new Error(`Invalid API field: notification.eventType (${String(value)})`);
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined) throw new Error(`Missing API field: ${field}`);
  return value;
}
