import { OrderStatus } from '@shared/model/order.model';

export interface AdminOrderSummary {
  readonly id: number;
  readonly orderCode: string;
  readonly status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly preparationStarted: Date | null;
  readonly completedAt: Date | null;
}

export interface AdminOrderFilters {
  readonly orderCode: string;
  readonly day: string;
  readonly status: OrderStatus | '';
}

export interface AdminOrderPage {
  readonly orders: readonly AdminOrderSummary[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export const EMPTY_ADMIN_ORDER_FILTERS: AdminOrderFilters = {
  orderCode: '',
  day: '',
  status: '',
};
