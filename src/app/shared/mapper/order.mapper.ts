import { ORDER_STATUSES, Order, OrderStatus } from '../model/order.model';
import { OrderResponseDto } from '../dto/order.dto';

export function mapOrder(dto: OrderResponseDto): Order {
  return {
    id: dto.id ?? null,
    orderCode: required(dto.orderCode, 'order.orderCode'),
    status: mapOrderStatus(dto.status),
    items: required(dto.items, 'order.items').map((item) => ({
      pizzaId: required(item.pizzaId, 'orderItem.pizzaId'),
      pizzaName: required(item.pizzaName, 'orderItem.pizzaName'),
      quantity: required(item.quantity, 'orderItem.quantity'),
      unitPrice: Number(required(item.unitPrice, 'orderItem.unitPrice')),
      lineTotal: Number(required(item.lineTotal, 'orderItem.lineTotal')),
    })),
    total: Number(required(dto.total, 'order.total')),
    createdAt: new Date(required(dto.createdAt, 'order.createdAt')),
    updatedAt: new Date(required(dto.updatedAt, 'order.updatedAt')),
    preparationStarted: dto.preparationStarted ? new Date(dto.preparationStarted) : null,
    completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
  };
}

function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined) throw new Error(`Missing API field: ${field}`);
  return value;
}

export function mapOrderStatus(status: string | undefined): OrderStatus {
  if (status && ORDER_STATUSES.some((candidate) => candidate === status)) {
    return status as OrderStatus;
  }
  throw new Error('Invalid API field: order.status');
}
