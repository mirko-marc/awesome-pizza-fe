export interface OrderItemResponseDto {
  readonly pizzaId?: number;
  readonly pizzaName?: string;
  readonly quantity?: number;
  readonly unitPrice?: number;
  readonly lineTotal?: number;
}

export interface OrderResponseDto {
  readonly id?: number;
  readonly orderCode?: string;
  readonly status?: string;
  readonly items?: readonly OrderItemResponseDto[];
  readonly total?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly preparationStarted?: string | null;
  readonly completedAt?: string | null;
}
