import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { Order } from '@shared/model/order.model';
import { CreateOrderRequestDto } from '../data-access/dto/customer-api.dto';
import { CustomerApiService } from '../data-access/service/customer-api.service';
import { Pizza } from '../models/pizza.model';

interface CustomerState {
  readonly pizzas: readonly Pizza[];
  readonly quantities: Readonly<Partial<Record<number, number>>>;
  readonly currentOrder: Order | null;
  readonly trackedOrder: Order | null;
  readonly isMenuLoading: boolean;
  readonly isCreatingOrder: boolean;
  readonly isTrackingOrder: boolean;
  readonly menuError: string | null;
  readonly orderError: string | null;
  readonly trackingError: string | null;
}

const initialState: CustomerState = {
  pizzas: [],
  quantities: {},
  currentOrder: null,
  trackedOrder: null,
  isMenuLoading: false,
  isCreatingOrder: false,
  isTrackingOrder: false,
  menuError: null,
  orderError: null,
  trackingError: null,
};

function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0) return 'La pizzeria non è raggiungibile. Verifica che il backend sia avviato.';
  return fallback;
}

export const CustomerStore = signalStore(
  withState(initialState),
  withComputed(({ pizzas, quantities }) => ({
    cartItems: computed(() =>
      pizzas()
        .filter((pizza) => (quantities()[pizza.id] ?? 0) > 0)
        .map((pizza) => {
          const quantity = quantities()[pizza.id] ?? 0;
          return { pizza, quantity, lineTotal: pizza.price * quantity };
        }),
    ),
    cartCount: computed(() =>
      Object.values(quantities()).reduce<number>(
        (total, quantity) => total + (quantity ?? 0),
        0,
      ),
    ),
    cartTotal: computed(() =>
      pizzas().reduce(
        (total, pizza) => total + pizza.price * (quantities()[pizza.id] ?? 0),
        0,
      ),
    ),
  })),
  withMethods((store, api = inject(CustomerApiService)) => ({
    async loadPizzas(): Promise<void> {
      if (store.isMenuLoading()) return;
      patchState(store, { isMenuLoading: true, menuError: null });
      try {
        const pizzas = await firstValueFrom(api.getPizzas());
        patchState(store, { pizzas, isMenuLoading: false });
      } catch (error: unknown) {
        patchState(store, {
          isMenuLoading: false,
          menuError: errorMessage(error, 'Non è stato possibile caricare il menu.'),
        });
      }
    },

    setQuantity(pizzaId: number, quantity: number): void {
      const nextQuantity = Math.max(0, Math.min(20, quantity));
      const quantities = { ...store.quantities() };
      if (nextQuantity === 0) delete quantities[pizzaId];
      else quantities[pizzaId] = nextQuantity;
      patchState(store, { quantities, orderError: null });
    },

    async createOrder(): Promise<Order | null> {
      const items = Object.entries(store.quantities())
        .map(([pizzaId, quantity]) => ({ pizzaId: Number(pizzaId), quantity: quantity ?? 0 }))
        .filter((item) => item.quantity > 0);
      if (items.length === 0) {
        patchState(store, { orderError: 'Seleziona almeno una pizza prima di confermare l’ordine.' });
        return null;
      }

      patchState(store, { isCreatingOrder: true, orderError: null });
      try {
        const request: CreateOrderRequestDto = { items };
        const currentOrder = await firstValueFrom(api.createOrder(request));
        patchState(store, { currentOrder, quantities: {}, isCreatingOrder: false });
        return currentOrder;
      } catch (error: unknown) {
        patchState(store, {
          isCreatingOrder: false,
          orderError: errorMessage(error, 'Non è stato possibile creare l’ordine.'),
        });
        return null;
      }
    },

    async trackOrder(orderCode: string): Promise<Order | null> {
      patchState(store, { isTrackingOrder: true, trackingError: null, trackedOrder: null });
      try {
        const trackedOrder = await firstValueFrom(api.getOrder(orderCode.trim()));
        patchState(store, { trackedOrder, isTrackingOrder: false });
        return trackedOrder;
      } catch (error: unknown) {
        const notFound = error instanceof HttpErrorResponse && error.status === 404;
        patchState(store, {
          isTrackingOrder: false,
          trackingError: notFound
            ? 'Nessun ordine corrisponde a questo codice. Controllalo e riprova.'
            : errorMessage(error, 'Non è stato possibile recuperare l’ordine.'),
        });
        return null;
      }
    },

    clearTracking(): void {
      patchState(store, { trackedOrder: null, trackingError: null });
    },
  })),
);
