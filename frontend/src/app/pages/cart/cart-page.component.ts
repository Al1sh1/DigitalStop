import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { CartItem } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent implements OnInit, OnDestroy {
  items: CartItem[] = [];
  checkoutLoading = false;
  errorMessage = '';
  successMessage = '';

  private itemsSubscription?: Subscription;

  constructor(
    private readonly cartService: CartService,
    private readonly api: ApiService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.itemsSubscription = this.cartService.items$.subscribe((items) => {
      this.items = items;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.itemsSubscription?.unsubscribe();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get totalPrice(): number {
    return this.items.reduce((sum, item) => sum + this.priceValue(item.product.price) * item.quantity, 0);
  }

  updateQuantity(productId: number, value: number): void {
    const safeValue = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
    this.cartService.updateQuantity(productId, safeValue);
    this.successMessage = '';
    this.errorMessage = '';
  }

  remove(productId: number): void {
    this.cartService.removeProduct(productId);
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearCart(): void {
    this.cartService.clear();
    this.successMessage = '';
    this.errorMessage = '';
  }

  checkout(): void {
    if (!this.isAuthenticated) {
      this.errorMessage = 'Login is required to checkout.';
      this.successMessage = '';
      return;
    }

    if (!this.items.length) {
      this.errorMessage = 'Your cart is empty.';
      this.successMessage = '';
      return;
    }

    this.checkoutLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const requests = this.items.map((item) =>
      this.api.createOrder({
        product_id: item.product.id,
        quantity: item.quantity,
      }),
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.cartService.clear();
        this.checkoutLoading = false;
        this.successMessage = 'Checkout complete. Orders were created.';
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.checkoutLoading = false;
        this.errorMessage = this.api.getErrorMessage(error);
        this.cdr.markForCheck();
      },
    });
  }

  formatPrice(value: string | number): string {
    return `$${Number(value).toFixed(2)}`;
  }

  itemTotal(item: CartItem): string {
    return this.formatPrice(this.priceValue(item.product.price) * item.quantity);
  }

  private priceValue(value: string): number {
    return Number(value);
  }
}
