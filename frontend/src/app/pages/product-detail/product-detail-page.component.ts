import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.css',
})
export class ProductDetailPageComponent implements OnInit {
  product: Product | null = null;
  specEntries: Array<{ key: string; value: string }> = [];
  quantity = 1;
  canBuy = true;
  loading = false;
  errorMessage = '';
  actionMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.resolvePurchaseAccess();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid product id.';
      return;
    }

    this.loadProduct(id);
  }

  formatPrice(value: string): string {
    return `$${Number(value).toFixed(2)}`;
  }

  productImageUrl(): string {
    return this.product?.image_url || 'https://placehold.co/1000x700?text=Phone';
  }

  addToCart(): void {
    if (!this.canBuy) {
      this.actionMessage = 'Manager account cannot purchase products.';
      return;
    }

    if (!this.product) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(this.quantity));
    this.cartService.addProduct(this.product, safeQuantity);
    const fullName = `${this.product.brand.name} ${this.product.name}`;
    const unitPrice = Number(this.product.price);
    const totalPrice = unitPrice * safeQuantity;
    this.actionMessage = `${fullName} added to cart: ${safeQuantity} x ${this.formatPrice(this.product.price)} = ${this.formatPrice(String(totalPrice))}`;
    this.quantity = 1;
  }

  private loadProduct(productId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.getProduct(productId).subscribe({
      next: (product) => {
        this.product = product;
        this.specEntries = this.buildSpecEntries(product);
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

  private buildSpecEntries(product: Product): Array<{ key: string; value: string }> {
    if (!product.specs) {
      return [];
    }

    return Object.entries(product.specs)
      .filter((entry): entry is [string, string] => {
        const value = entry[1];
        return typeof value === 'string' && value.trim().length > 0;
      })
      .map(([key, value]) => ({ key, value }));
  }

  private resolvePurchaseAccess(): void {
    if (!this.authService.isAuthenticated()) {
      this.canBuy = true;
      return;
    }

    this.api.managerGetOrders().subscribe({
      next: () => {
        this.canBuy = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          this.canBuy = true;
          this.cdr.markForCheck();
          return;
        }

        this.canBuy = true;
        this.cdr.markForCheck();
      },
    });
  }
}
