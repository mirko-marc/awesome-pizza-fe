import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderResponseDto } from '@shared/dto/order.dto';
import { mapOrder } from '@shared/mapper/order.mapper';
import { Order } from '@shared/model/order.model';
import { AdminOrderFilters, AdminOrderPage } from '../../models/admin-order.model';
import { AdminOrderPageResponseDto } from '../dto/admin-api.dto';
import { mapAdminOrderPage } from '../mapper/admin-order.mapper';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly adminUrl = '/api/v1/admin';

  getOrders(filters: AdminOrderFilters, page: number, size: number): Observable<AdminOrderPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt,desc');

    if (filters.orderCode) params = params.set('orderCode', filters.orderCode);
    if (filters.day) params = params.set('day', filters.day);
    if (filters.status) params = params.set('status', filters.status);

    return this.http
      .get<AdminOrderPageResponseDto>(`${this.adminUrl}/orders`, { params })
      .pipe(map(mapAdminOrderPage));
  }

  getOrder(orderCode: string): Observable<Order> {
    return this.http
      .get<OrderResponseDto>(`${this.adminUrl}/orders/${encodeURIComponent(orderCode)}`)
      .pipe(map(mapOrder));
  }

  startOrder(orderCode: string): Observable<Order> {
    return this.http
      .patch<OrderResponseDto>(`${this.adminUrl}/orders/${encodeURIComponent(orderCode)}/start`, {})
      .pipe(map(mapOrder));
  }

  completeOrder(orderCode: string): Observable<Order> {
    return this.http
      .patch<OrderResponseDto>(`${this.adminUrl}/orders/${encodeURIComponent(orderCode)}/complete`, {})
      .pipe(map(mapOrder));
  }
}
