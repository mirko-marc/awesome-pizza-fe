export interface AdminOrderSummaryDto {
  readonly id?: number;
  readonly orderCode?: string;
  readonly status?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly preparationStarted?: string | null;
  readonly completedAt?: string | null;
}

export interface AdminOrderPageResponseDto {
  readonly content?: readonly AdminOrderSummaryDto[];
  readonly page?: number;
  readonly size?: number;
  readonly totalElements?: number;
  readonly totalPages?: number;
  readonly first?: boolean;
  readonly last?: boolean;
}
