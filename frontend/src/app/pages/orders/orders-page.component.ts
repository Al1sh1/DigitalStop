import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-orders-page',
  imports: [RouterLink],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css',
})
export class OrdersPageComponent implements OnInit {
  orders: Order[] = [];
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
      this.loadOrders();
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
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
