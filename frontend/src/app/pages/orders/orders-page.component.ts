import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CreateOrderPayload, Order, Product } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css',
})
export class OrdersPageComponent implements OnInit {
  products: Product[] = [];
  orders: Order[] = [];
  selectedProductId: number | null = null;
  quantity = 1;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.loadProducts();
      this.loadOrders();
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        if (!this.selectedProductId && this.products.length > 0) {
          this.selectedProductId = this.products[0].id;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.api.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  createOrder(): void {
    if (this.selectedProductId === null) {
      this.errorMessage = 'Select a product first.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateOrderPayload = {
      product_id: this.selectedProductId,
      quantity: this.quantity,
    };

    this.api.createOrder(payload).subscribe({
      next: () => {
        this.successMessage = 'Order created successfully.';
        this.loading = false;
        this.loadOrders();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  deleteOrder(orderId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.api.deleteOrder(orderId).subscribe({
      next: () => {
        this.successMessage = 'Order deleted.';
        this.loading = false;
        this.loadOrders();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  formatPrice(value: string): string {
    return `$${Number(value).toFixed(2)}`;
  }
}
