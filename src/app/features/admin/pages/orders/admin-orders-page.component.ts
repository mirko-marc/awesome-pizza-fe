import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, OrderStatus } from '@shared/data-access/model/order.model';
import { AlertComponent } from '@shared/ui/alert/alert.component';
import { LoadingIndicatorComponent } from '@shared/ui/loading-indicator/loading-indicator.component';
import { AdminOrderFilters, EMPTY_ADMIN_ORDER_FILTERS } from '../../models/admin-order.model';
import { AdminStore } from '../../store/admin.store';

@Component({
  selector: 'app-admin-orders-page',
  imports: [
    AlertComponent,
    DatePipe,
    LoadingIndicatorComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './admin-orders-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrdersPageComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly statuses = ORDER_STATUSES;
  readonly statusLabels = ORDER_STATUS_LABELS;
  readonly filtersForm = new FormGroup({
    orderCode: new FormControl('', { nonNullable: true }),
    day: new FormControl('', { nonNullable: true }),
    status: new FormControl<OrderStatus | ''>('', { nonNullable: true }),
  });
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly pageNumbers = computed(() => {
    const totalPages = this.store.totalPages();
    const currentPage = this.store.page();
    const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
    const length = Math.min(5, totalPages);
    return Array.from({ length }, (_, index) => firstPage + index);
  });

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    const hasPersistedSearch = ['orderCode', 'day', 'status', 'page', 'size']
      .some((parameter) => queryParams.has(parameter));
    const statusParameter = queryParams.get('status');
    const persistedStatus = ORDER_STATUSES.find((status) => status === statusParameter) ?? '';
    const filters: AdminOrderFilters = hasPersistedSearch
      ? {
          orderCode: queryParams.get('orderCode') ?? '',
          day: queryParams.get('day') ?? '',
          status: persistedStatus,
        }
      : this.store.filters();
    const page = hasPersistedSearch
      ? this.nonNegativeNumber(queryParams.get('page'), 0)
      : this.store.page();
    const requestedSize = this.nonNegativeNumber(queryParams.get('size'), this.store.size());
    const size = [10, 20, 50].includes(requestedSize) ? requestedSize : 20;

    this.filtersForm.setValue(filters);
    void this.store.loadOrders(filters, page, size);
  }

  async search(): Promise<void> {
    await this.loadOrders(this.currentFilters(), 0, this.store.size());
  }

  async reset(): Promise<void> {
    this.filtersForm.setValue(EMPTY_ADMIN_ORDER_FILTERS);
    await this.loadOrders(EMPTY_ADMIN_ORDER_FILTERS, 0, this.store.size());
  }

  async goToPage(page: number): Promise<void> {
    if (page < 0 || page >= this.store.totalPages() || page === this.store.page()) return;
    await this.loadOrders(this.store.filters(), page, this.store.size());
  }

  async changePageSize(event: Event): Promise<void> {
    const size = Number((event.target as HTMLSelectElement).value);
    await this.loadOrders(this.store.filters(), 0, size);
  }

  private currentFilters(): AdminOrderFilters {
    const filters = this.filtersForm.getRawValue();
    return {
      orderCode: filters.orderCode.trim(),
      day: filters.day,
      status: filters.status,
    };
  }

  private async loadOrders(filters: AdminOrderFilters, page: number, size: number): Promise<void> {
    await this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        orderCode: filters.orderCode || null,
        day: filters.day || null,
        status: filters.status || null,
        page: page > 0 ? page : null,
        size: size !== 20 ? size : null,
      },
    });
    await this.store.loadOrders(filters, page, size);
  }

  private nonNegativeNumber(value: string | null, fallback: number): number {
    if (value === null) return fallback;
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
  }
}
