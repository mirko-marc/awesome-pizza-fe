import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerStore } from '../../store/customer.store';

@Component({
  selector: 'app-confirmation-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './confirmation-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(CustomerStore);
  readonly orderCode = this.route.snapshot.paramMap.get('orderCode') ?? '';
  readonly order = computed(() => {
    const currentOrder = this.store.currentOrder();
    return currentOrder?.orderCode === this.orderCode ? currentOrder : null;
  });
}
