import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Brand, Order, Product } from '../../core/models/api.models';
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
  products: Product[] = [];
  orders: Order[] = [];
  draftStatusByOrderId: Record<number, Order['status']> = {};

  name = '';
  description = '';
  price = '';
  imageUrl = '';
  brandId: number | null = null;
  specsJson = '';

  editingProductId: number | null = null;
  editName = '';
  editDescription = '';
  editPrice = '';
  editImageUrl = '';
  editBrandId: number | null = null;
  editSpecsJson = '';

  loadingBrands = false;
  loadingProducts = false;
  loadingOrders = false;
  creatingProduct = false;
  savingProductId: number | null = null;
  deletingProductId: number | null = null;
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

  loadProducts(): void {
    if (!this.canManage) {
      return;
    }

    this.loadingProducts = true;
    this.errorMessage = '';

    this.api.managerGetProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loadingProducts = false;
        if (!this.handlePermissionError(error)) {
          this.errorMessage = this.api.getErrorMessage(error);
        }
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
        this.loadProducts();
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
          this.loadProducts();
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

  startEditProduct(product: Product): void {
    this.editingProductId = product.id;
    this.editName = product.name;
    this.editDescription = product.description;
    this.editPrice = product.price;
    this.editImageUrl = product.image_url;
    this.editBrandId = product.brand.id;
    this.editSpecsJson = product.specs ? JSON.stringify(product.specs, null, 2) : '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditProduct(): void {
    this.editingProductId = null;
    this.editName = '';
    this.editDescription = '';
    this.editPrice = '';
    this.editImageUrl = '';
    this.editBrandId = null;
    this.editSpecsJson = '';
  }

  saveProductChanges(productId: number): void {
    if (this.editBrandId === null) {
      this.errorMessage = 'Select a brand for product update.';
      return;
    }

    this.savingProductId = productId;
    this.errorMessage = '';
    this.successMessage = '';

    let specs: Record<string, string> | undefined;
    if (this.editSpecsJson.trim()) {
      try {
        specs = JSON.parse(this.editSpecsJson) as Record<string, string>;
      } catch {
        this.savingProductId = null;
        this.errorMessage = 'Specs must be valid JSON object.';
        return;
      }
    }

    this.api
      .managerUpdateProduct(productId, {
        name: this.editName.trim(),
        description: this.editDescription.trim(),
        price: this.editPrice.trim(),
        image_url: this.editImageUrl.trim(),
        brand_id: this.editBrandId,
        specs,
      })
      .subscribe({
        next: (updated) => {
          const index = this.products.findIndex((item) => item.id === productId);
          if (index >= 0) {
            this.products[index] = updated;
          }
          this.savingProductId = null;
          this.editingProductId = null;
          this.successMessage = `Product ${updated.name} updated.`;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.savingProductId = null;
          if (!this.handlePermissionError(error)) {
            this.errorMessage = this.api.getErrorMessage(error);
          }
          this.cdr.markForCheck();
        },
      });
  }

  deleteProduct(productId: number): void {
    this.deletingProductId = productId;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.managerDeleteProduct(productId).subscribe({
      next: () => {
        this.products = this.products.filter((item) => item.id !== productId);
        if (this.editingProductId === productId) {
          this.cancelEditProduct();
        }
        this.deletingProductId = null;
        this.successMessage = `Product #${productId} deleted.`;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.deletingProductId = null;
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
