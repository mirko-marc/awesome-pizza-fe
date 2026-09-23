export const ORDER_STATUSES = ['RECEIVED', 'IN_PREPARATION', 'COMPLETED'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Readonly<Record<OrderStatus, string>> = {
  RECEIVED: 'Ricevuto',
  IN_PREPARATION: 'In lavorazione',
  COMPLETED: 'Completato',
};

export interface OrderItem {
  readonly pizzaId: number;
  readonly pizzaName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly lineTotal: number;
}

export interface Order {
  readonly id: number | null;
  readonly orderCode: string;
  readonly status: OrderStatus;
  readonly items: readonly OrderItem[];
  readonly total: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly preparationStarted: Date | null;
  readonly completedAt: Date | null;
}
