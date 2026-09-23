export interface PizzaResponseDto {
  readonly id?: number;
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
}

export interface CreateOrderItemRequestDto {
  readonly pizzaId: number;
  readonly quantity: number;
}

export interface CreateOrderRequestDto {
  readonly items: readonly CreateOrderItemRequestDto[];
}
