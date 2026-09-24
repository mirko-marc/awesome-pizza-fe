import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminNotification } from '../../models/admin-notification.model';
import { AdminNotificationStore } from '../../store/admin-notification.store';

@Component({
  selector: 'app-admin-notification-bell',
  imports: [DatePipe],
  templateUrl: './admin-notification-bell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotificationBellComponent {
  readonly store = inject(AdminNotificationStore);
  private readonly router = inject(Router);

  onToggle(event: Event): void {
    if ((event.currentTarget as HTMLDetailsElement).open) {
      this.store.markAllAsRead();
    }
  }

  async openNotification(notification: AdminNotification): Promise<void> {
    this.store.markAsRead(notification.id);
    await this.router.navigate(['/admin/orders', notification.orderCode]);
  }
}
