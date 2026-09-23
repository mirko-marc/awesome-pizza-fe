import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { Order } from '@shared/data-access/model/order.model';
import { AdminApiService } from '../data-access/service/admin-api.service';
import {
  AdminOrderSummary,
  AdminOrderFilters,
  EMPTY_ADMIN_ORDER_FILTERS,
} from '../models/admin-order.model';

interface AdminState {
  readonly orders: readonly AdminOrderSummary[];
  readonly selectedOrder: Order | null;
  readonly filters: AdminOrderFilters;
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
  readonly activeOrderCode: string | null;
  readonly isListLoading: boolean;
  readonly isDetailLoading: boolean;
  readonly isUpdating: boolean;
  readonly error: string | null;
  readonly detailError: string | null;
  readonly actionError: string | null;
}

const initialState: AdminState = {
  orders: [],
  selectedOrder: null,
  filters: EMPTY_ADMIN_ORDER_FILTERS,
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  activeOrderCode: null,
  isListLoading: false,
  isDetailLoading: false,
  isUpdating: false,
  error: null,
  detailError: null,
  actionError: null,
};

function adminErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Si è verificato un errore inatteso.';
  if (error.status === 0) return 'Il servizio amministrativo non è raggiungibile.';
  if (error.status === 403) return 'Non hai i permessi necessari per accedere a questa area.';
  if (error.status === 404) return 'L’ordine richiesto non esiste.';
  if (error.status === 409) return 'Hai già un ordine in lavorazione. Completalo prima di iniziarne un altro.';
  return 'Non è stato possibile completare l’operazione.';
}

function toSummary(order: Order): AdminOrderSummary {
  if (order.id === null) throw new Error('Missing API field: adminOrder.id');
  return {
    id: order.id,
    orderCode: order.orderCode,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    preparationStarted: order.preparationStarted,
    completedAt: order.completedAt,
  };
}

function replaceOrder(
  orders: readonly AdminOrderSummary[],
  updatedOrder: Order,
): readonly AdminOrderSummary[] {
  return orders.map((order) =>
    order.orderCode === updatedOrder.orderCode ? toSummary(updatedOrder) : order,
  );
}

export const AdminStore = signalStore(
  withState(initialState),
  withComputed(({ activeOrderCode, selectedOrder }) => ({
    hasActiveOrder: computed(() => activeOrderCode() !== null),
    canStartSelectedOrder: computed(() => {
      const order = selectedOrder();
      return order?.status === 'RECEIVED' && activeOrderCode() === null;
    }),
    canCompleteSelectedOrder: computed(() => selectedOrder()?.status === 'IN_PREPARATION'),
  })),
  withMethods((store, api = inject(AdminApiService)) => ({
    async loadOrders(
      filters: AdminOrderFilters = store.filters(),
      page: number = store.page(),
      size: number = store.size(),
    ): Promise<void> {
      if (store.isListLoading()) return;
      patchState(store, { isListLoading: true, error: null, filters, page, size });
      try {
        const result = await firstValueFrom(api.getOrders(filters, page, size));
        const activeOrder = result.orders.find((order) => order.status === 'IN_PREPARATION');
        patchState(store, {
          orders: result.orders,
          page: result.page,
          size: result.size,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
          activeOrderCode: activeOrder?.orderCode ?? store.activeOrderCode(),
          isListLoading: false,
        });
      } catch (error: unknown) {
        patchState(store, { isListLoading: false, error: adminErrorMessage(error) });
      }
    },

    async loadOrder(orderCode: string): Promise<void> {
      patchState(store, { selectedOrder: null, isDetailLoading: true, detailError: null, actionError: null });
      try {
        const selectedOrder = await firstValueFrom(api.getOrder(orderCode));
        patchState(store, {
          selectedOrder,
          activeOrderCode: selectedOrder.status === 'IN_PREPARATION'
            ? selectedOrder.orderCode
            : store.activeOrderCode(),
          isDetailLoading: false,
        });
      } catch (error: unknown) {
        patchState(store, { isDetailLoading: false, detailError: adminErrorMessage(error) });
      }
    },

    async startOrder(orderCode: string): Promise<boolean> {
      if (store.activeOrderCode() !== null && store.activeOrderCode() !== orderCode) {
        patchState(store, {
          actionError: 'Hai già un ordine in lavorazione. Completalo prima di iniziarne un altro.',
        });
        return false;
      }
      patchState(store, { isUpdating: true, actionError: null });
      try {
        const updatedOrder = await firstValueFrom(api.startOrder(orderCode));
        patchState(store, {
          selectedOrder: updatedOrder,
          orders: replaceOrder(store.orders(), updatedOrder),
          activeOrderCode: updatedOrder.orderCode,
          isUpdating: false,
        });
        return true;
      } catch (error: unknown) {
        patchState(store, { isUpdating: false, actionError: adminErrorMessage(error) });
        return false;
      }
    },

    async completeOrder(orderCode: string): Promise<boolean> {
      patchState(store, { isUpdating: true, actionError: null });
      try {
        const updatedOrder = await firstValueFrom(api.completeOrder(orderCode));
        patchState(store, {
          selectedOrder: updatedOrder,
          orders: replaceOrder(store.orders(), updatedOrder),
          activeOrderCode: null,
          isUpdating: false,
        });
        return true;
      } catch (error: unknown) {
        patchState(store, { isUpdating: false, actionError: adminErrorMessage(error) });
        return false;
      }
    },
  })),
);
