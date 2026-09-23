import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ORDER_STATUSES, Order, OrderStatus } from '@shared/model/order.model';

const STATUS_COPY: Record<OrderStatus, { title: string; description: string; icon: string }> = {
  RECEIVED: { title: 'Ordine ricevuto', description: 'La cucina ha ricevuto il tuo ordine.', icon: 'receipt_long' },
  IN_PREPARATION: { title: 'In preparazione', description: 'La tua pizza è in forno.', icon: 'local_fire_department' },
  COMPLETED: { title: 'Pronto per il ritiro', description: 'Il tuo ordine è pronto. Buon appetito!', icon: 'check_circle' },
};

@Component({
  selector: 'app-order-status',
  imports: [DatePipe],
  templateUrl: './order-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderStatusComponent {
  readonly order = input.required<Order>();
  readonly statuses = ORDER_STATUSES;
  readonly statusCopy = STATUS_COPY;
  readonly activeIndex = computed(() => this.statuses.indexOf(this.order().status));
  readonly activeCopy = computed(() => this.statusCopy[this.order().status]);
}
