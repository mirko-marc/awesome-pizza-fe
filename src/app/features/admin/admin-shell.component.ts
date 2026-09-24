import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '@app/core/auth/auth.store';
import { ThemeService } from '@app/core/theme/theme.service';
import { AdminNotificationBellComponent } from './components/notification-bell/admin-notification-bell.component';
import { AdminNotificationSocketService } from './data-access/service/admin-notification-socket.service';
import { AdminNotificationStore } from './store/admin-notification.store';
import { AdminStore } from './store/admin.store';

@Component({
  selector: 'app-admin-shell',
  imports: [AdminNotificationBellComponent, RouterLink, RouterOutlet],
  providers: [AdminStore, AdminNotificationSocketService, AdminNotificationStore],
  templateUrl: './admin-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminShellComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.themeService.initialize();
  }

  async logout(): Promise<void> {
    this.authStore.logout();
    await this.router.navigate(['/admin/login']);
  }
}
