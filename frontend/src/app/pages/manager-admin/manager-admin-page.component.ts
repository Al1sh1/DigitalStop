import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Brand, Order } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-manager-admin-page',
  imports: [FormsModule],
  templateUrl: './manager-admin-page.component.html',
  styleUrl: './manager-admin-page.component.css',
})
export class ManagerAdminPageComponent implements OnInit {
  readonly statusOptions: Array<Order['status']> = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  brands: Brand[] = [];
  orders: Order[] = [];
  draftStatusByOrderId: Record<number, Order['status']> = {};

  name = '';
  description = '';
  price = '';
  imageUrl = '';
  brandId: number | null = null;
  specsJson = '';

  loadingBrands = false;
  loadingOrders = false;
  creatingProduct = false;
  updatingOrderId: number | null = null;
  canManage = true;

  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadBrands(): void {
    this.loadingBrands = true;
    this.errorMessage = '';

    this.api.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        if (this.brandId === null && this.brands.length > 0) {
          this.brandId = this.brands[0].id;
        }
        this.loadingBrands = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loadingBrands = false;
        this.errorMessage = this.api.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  loadOrders(): void {
    if (!this.canManage) {
      return;
    }

    this.loadingOrders = true;
    this.errorMessage = '';

    this.api.managerGetOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.draftStatusByOrderId = {};
        for (const order of orders) {
          this.draftStatusByOrderId[order.id] = order.status;
        }
        this.loadBrands();
        this.loadingOrders = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loadingOrders = false;
        if (!this.handlePermissionError(error)) {
          this.errorMessage = this.api.getErrorMessage(error);
        }
        this.cdr.markForCheck();
      },
    });
  }

  createProduct(): void {
    if (this.brandId === null) {
      this.errorMessage = 'Select a brand first.';
      return;
    }

    this.creatingProduct = true;
    this.errorMessage = '';
    this.successMessage = '';

    let specs: Record<string, string> | undefined;
    if (this.specsJson.trim()) {
      try {
        specs = JSON.parse(this.specsJson) as Record<string, string>;
      } catch {
        this.creatingProduct = false;
        this.errorMessage = 'Specs must be valid JSON object.';
        return;
      }
    }

    this.api
      .managerAddProduct({
        name: this.name.trim(),
        description: this.description.trim(),
        price: this.price.trim(),
        image_url: this.imageUrl.trim(),
        specs,
        brand_id: this.brandId,
      })
      .subscribe({
        next: (product) => {
          this.creatingProduct = false;
          this.successMessage = `Product ${product.name} created.`;
          this.name = '';
          this.description = '';
          this.price = '';
          this.imageUrl = '';
          this.specsJson = '';
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.creatingProduct = false;
          if (!this.handlePermissionError(error)) {
            this.errorMessage = this.api.getErrorMessage(error);
          }
          this.cdr.markForCheck();
        },
      });
  }

  updateOrderStatus(order: Order): void {
    const nextStatus = this.draftStatusByOrderId[order.id] ?? order.status;

    this.updatingOrderId = order.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.managerUpdateOrderStatus(order.id, nextStatus).subscribe({
      next: (updated) => {
        const target = this.orders.find((item) => item.id === updated.id);
        if (target) {
          target.status = updated.status;
        }
        this.draftStatusByOrderId[order.id] = updated.status;
        this.updatingOrderId = null;
        this.successMessage = `Order #${updated.id} status updated to ${updated.status}.`;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.updatingOrderId = null;
        if (!this.handlePermissionError(error)) {
          this.errorMessage = this.api.getErrorMessage(error);
        }
        this.cdr.markForCheck();
      },
    });
  }

  formatPrice(value: string): string {
    return `$${Number(value).toFixed(2)}`;
  }

  private handlePermissionError(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status !== 401 && error.status !== 403) {
      return false;
    }

    this.canManage = false;
    this.errorMessage = 'Manager access required. Login with manager/admin account.';
    return true;
  }
}
