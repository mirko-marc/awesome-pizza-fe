import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ORDER_STATUS_LABELS } from '@shared/model/order.model';
import { AlertComponent } from '@shared/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator/loading-indicator.component';
import { AdminStore } from '../../store/admin.store';

@Component({
  selector: 'app-admin-order-detail-page',
  imports: [AlertComponent, CurrencyPipe, DatePipe, LoadingIndicatorComponent, RouterLink],
  templateUrl: './admin-order-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrderDetailPageComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly orderCode = inject(ActivatedRoute).snapshot.paramMap.get('orderCode') ?? '';
  readonly hasInvalidOrderCode = !/^[0-9a-fA-F-]{36}$/.test(this.orderCode);

  ngOnInit(): void {
    if (!this.hasInvalidOrderCode) {
      void this.store.loadOrder(this.orderCode);
    }
  }

  startOrder(): void {
    void this.store.startOrder(this.orderCode);
  }

  completeOrder(): void {
    void this.store.completeOrder(this.orderCode);
  }
}
