import { mapOrderStatus } from '@shared/data-access/mapper/order.mapper';
import { AdminOrderPage, AdminOrderSummary } from '../../models/admin-order.model';
import { AdminOrderPageResponseDto, AdminOrderSummaryDto } from '../dto/admin-api.dto';

export function mapAdminOrderPage(dto: AdminOrderPageResponseDto): AdminOrderPage {
  return {
    orders: (dto.content ?? []).map(mapAdminOrderSummary),
    page: dto.page ?? 0,
    size: dto.size ?? 20,
    totalElements: dto.totalElements ?? 0,
    totalPages: dto.totalPages ?? 0,
  };
}

function mapAdminOrderSummary(dto: AdminOrderSummaryDto): AdminOrderSummary {
  return {
    id: required(dto.id, 'adminOrder.id'),
    orderCode: required(dto.orderCode, 'adminOrder.orderCode'),
    status: mapOrderStatus(dto.status),
    createdAt: new Date(required(dto.createdAt, 'adminOrder.createdAt')),
    updatedAt: new Date(required(dto.updatedAt, 'adminOrder.updatedAt')),
    preparationStarted: dto.preparationStarted ? new Date(dto.preparationStarted) : null,
    completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
  };
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined) throw new Error(`Missing API field: ${field}`);
  return value;
}
