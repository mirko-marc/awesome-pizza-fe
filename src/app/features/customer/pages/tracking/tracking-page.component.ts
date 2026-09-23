import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '@shared/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator/loading-indicator.component';
import { OrderStatusComponent } from '../../components/order-status/order-status.component';
import { CustomerStore } from '../../store/customer.store';

@Component({
  selector: 'app-tracking-page',
  imports: [AlertComponent, CurrencyPipe, LoadingIndicatorComponent, OrderStatusComponent, ReactiveFormsModule],
  templateUrl: './tracking-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingPageComponent implements OnInit {
  readonly store = inject(CustomerStore);
  private readonly route = inject(ActivatedRoute);
  readonly orderCode = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[0-9a-fA-F-]{36}$/)],
  });
  readonly trackingForm = new FormGroup({ orderCode: this.orderCode });

  ngOnInit(): void {
    const routeCode = this.route.snapshot.paramMap.get('orderCode');
    if (routeCode) {
      this.orderCode.setValue(routeCode);
      void this.store.trackOrder(routeCode);
    } else {
      this.store.clearTracking();
    }
  }

  search(): void {
    this.orderCode.markAsTouched();
    if (this.orderCode.invalid) return;
    void this.store.trackOrder(this.orderCode.value);
  }

  refresh(orderCode: string): void {
    void this.store.trackOrder(orderCode);
  }
}
