import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrderResponseDto } from '@shared/dto/order.dto';
import { mapOrder } from '@shared/mapper/order.mapper';
import { Order } from '@shared/model/order.model';
import { Pizza } from '../../models/pizza.model';
import { CreateOrderRequestDto, PizzaResponseDto } from '../dto/customer-api.dto';
import { mapPizza } from '../mapper/customer.mapper';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1';

  getPizzas(): Observable<readonly Pizza[]> {
    return this.http
      .get<readonly PizzaResponseDto[]>(`${this.apiUrl}/pizzas`)
      .pipe(map((response) => response.map(mapPizza)));
  }

  createOrder(request: CreateOrderRequestDto): Observable<Order> {
    return this.http
      .post<OrderResponseDto>(`${this.apiUrl}/orders`, request)
      .pipe(map(mapOrder));
  }

  getOrder(orderCode: string): Observable<Order> {
    return this.http
      .get<OrderResponseDto>(`${this.apiUrl}/orders/${encodeURIComponent(orderCode)}`)
      .pipe(map(mapOrder));
  }
}
