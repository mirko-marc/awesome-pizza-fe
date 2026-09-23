import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pizza } from '../../models/pizza.model';

@Component({
  selector: 'app-pizza-card',
  imports: [CurrencyPipe],
  templateUrl: './pizza-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PizzaCardComponent {
  readonly pizza = input.required<Pizza>();
  readonly quantity = input(0);
  readonly quantityChange = output<number>();
}
