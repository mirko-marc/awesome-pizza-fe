import { DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { AuthStore } from '@app/core/auth/auth.store';
import { mapAdminNotification } from '../data-access/mapper/admin-notification.mapper';
import { AdminNotificationSocketService } from '../data-access/service/admin-notification-socket.service';
import {
  AdminNotification,
  NotificationConnectionStatus,
} from '../models/admin-notification.model';
import { AdminStore } from './admin.store';

interface AdminNotificationState {
  readonly notifications: readonly AdminNotification[];
  readonly connectionStatus: NotificationConnectionStatus;
}

const initialState: AdminNotificationState = {
  notifications: [],
  connectionStatus: 'disconnected',
};

export const AdminNotificationStore = signalStore(
  withState(initialState),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() => notifications().filter((notification) => !notification.read).length),
  })),
  withMethods(
    (
      store,
      socket = inject(AdminNotificationSocketService),
      authStore = inject(AuthStore),
      adminStore = inject(AdminStore),
      destroyRef = inject(DestroyRef),
    ) => {
      socket.connectionStatus$
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((connectionStatus) => patchState(store, { connectionStatus }));

      socket.notifications$
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((dto) => {
          try {
            const notification = mapAdminNotification(dto);
            if (store.notifications().some((item) => item.id === notification.id)) return;

            patchState(store, {
              notifications: [notification, ...store.notifications()].slice(0, 20),
            });
            void adminStore.loadOrders();
            if (adminStore.selectedOrder()?.orderCode === notification.orderCode) {
              void adminStore.loadOrder(notification.orderCode);
            }
          } catch {
            patchState(store, { connectionStatus: 'error' });
          }
        });

      return {
        connect(): void {
          const accessToken = authStore.accessToken();
          if (!accessToken) {
            patchState(store, { connectionStatus: 'disconnected' });
            return;
          }
          socket.connect(authStore.tokenType(), accessToken);
        },

        disconnect(): void {
          void socket.disconnect();
        },

        markAllAsRead(): void {
          patchState(store, {
            notifications: store.notifications().map((notification) => ({
              ...notification,
              read: true,
            })),
          });
        },

        markAsRead(id: string): void {
          patchState(store, {
            notifications: store.notifications().map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification,
            ),
          });
        },

        clear(): void {
          patchState(store, { notifications: [] });
        },
      };
    },
  ),
  withHooks({
    onInit(store) {
      store.connect();
    },
    onDestroy(store) {
      store.disconnect();
    },
  }),
);
