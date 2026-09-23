import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CartItem } from '../../models/pizza.model';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe],
  templateUrl: './order-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryComponent {
  readonly items = input.required<readonly CartItem[]>();
  readonly total = input.required<number>();
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly checkout = output<void>();
}
