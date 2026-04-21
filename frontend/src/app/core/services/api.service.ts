import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timeout, TimeoutError } from 'rxjs';
import {
  Brand,
  BrandListResponse,
  CreateOrderPayload,
  JwtTokenPair,
  Order,
  OrderListResponse,
  Product,
  ProductListResponse,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiBaseUrl = '/api/v1';
  private readonly requestTimeoutMs = 7000;

  constructor(private readonly http: HttpClient) {}

  loginWithJwt(username: string, password: string): Observable<JwtTokenPair> {
    return this.http
      .post<JwtTokenPair>(`${this.apiBaseUrl}/token/`, { username, password })
      .pipe(timeout(this.requestTimeoutMs));
  }

  refreshJwtToken(refresh: string): Observable<{ access: string }> {
    return this.http
      .post<{ access: string }>(`${this.apiBaseUrl}/token/refresh/`, { refresh })
      .pipe(timeout(this.requestTimeoutMs));
  }

  getProducts(): Observable<Product[]> {
    return this.http
      .get<ProductListResponse>(`${this.apiBaseUrl}/products/`)
      .pipe(timeout(this.requestTimeoutMs), map((response) => response.products ?? []));
  }

  getBrands(): Observable<Brand[]> {
    return this.http
      .get<BrandListResponse>(`${this.apiBaseUrl}/brands/`)
      .pipe(timeout(this.requestTimeoutMs), map((response) => response.brands ?? []));
  }

  getOrders(): Observable<Order[]> {
    return this.http
      .get<OrderListResponse>(`${this.apiBaseUrl}/order/`)
      .pipe(timeout(this.requestTimeoutMs), map((response) => response.orders ?? []));
  }

  createOrder(payload: CreateOrderPayload): Observable<Order> {
    return this.http
      .post<Order>(`${this.apiBaseUrl}/order/`, payload)
      .pipe(timeout(this.requestTimeoutMs));
  }

  deleteOrder(orderId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiBaseUrl}/order/${orderId}`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  getErrorMessage(error: unknown): string {
    if (error instanceof TimeoutError) {
      return 'Backend did not respond in time. Start Django on port 8000.';
    }

    if (!(error instanceof HttpErrorResponse)) {
      return 'Unexpected error. Please try again.';
    }

    if (typeof error.error === 'string' && error.error.trim().length > 0) {
      return error.error;
    }

    const payload = error.error as Record<string, unknown> | null;
    if (payload && typeof payload['detail'] === 'string') {
      return payload['detail'];
    }

    if (payload && typeof payload['error'] === 'string') {
      return payload['error'];
    }

    if (payload && Array.isArray(payload['non_field_errors']) && payload['non_field_errors'][0]) {
      return String(payload['non_field_errors'][0]);
    }

    if (error.status === 0) {
      return 'Cannot connect to backend. Run Django server on port 8000.';
    }

    return `Request failed (${error.status}).`;
  }
}
