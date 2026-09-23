import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertComponent } from '@shared/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator/loading-indicator.component';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { PizzaCardComponent } from '../../components/pizza-card/pizza-card.component';
import { CustomerStore } from '../../store/customer.store';

@Component({
  selector: 'app-menu-page',
  imports: [AlertComponent, LoadingIndicatorComponent, OrderSummaryComponent, PizzaCardComponent],
  templateUrl: './menu-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuPageComponent implements OnInit {
  readonly store = inject(CustomerStore);
  private readonly router = inject(Router);
  readonly benefits = [
    { icon: 'outdoor_grill', title: 'Cotta su pietra', description: 'Alta temperatura per una base croccante e un cornicione soffice.' },
    { icon: 'eco', title: 'Ingredienti freschi', description: 'Abbinamenti semplici, scelti per esaltare ogni sapore.' },
    { icon: 'near_me', title: 'Ordine sempre sotto controllo', description: 'Sai sempre quando il tuo ordine è pronto.' },
  ] as const;

  ngOnInit(): void {
    if (this.store.pizzas().length === 0) void this.store.loadPizzas();
  }

  async placeOrder(): Promise<void> {
    const order = await this.store.createOrder();
    if (order) await this.router.navigate(['/confirmation', order.orderCode]);
  }
}
