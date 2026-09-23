export interface Pizza {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly price: number;
}

export interface CartItem {
  readonly pizza: Pizza;
  readonly quantity: number;
  readonly lineTotal: number;
}
