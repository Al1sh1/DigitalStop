import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'ds_cart_items';
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.readItems());

  readonly items$ = this.itemsSubject.asObservable();

  getItems(): CartItem[] {
    return this.itemsSubject.value;
  }

  getItemsCount(): number {
    return this.itemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  addProduct(product: Product, quantity: number): void {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const items = [...this.itemsSubject.value];
    const existing = items.find((item) => item.product.id === product.id);

    if (existing) {
      existing.quantity += safeQuantity;
    } else {
      items.push({ product, quantity: safeQuantity });
    }

    this.setItems(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const items = this.itemsSubject.value.map((item) => {
      if (item.product.id !== productId) {
        return item;
      }

      return { ...item, quantity: safeQuantity };
    });

    this.setItems(items);
  }

  removeProduct(productId: number): void {
    const items = this.itemsSubject.value.filter((item) => item.product.id !== productId);
    this.setItems(items);
  }

  clear(): void {
    this.setItems([]);
  }

  private setItems(items: CartItem[]): void {
    this.itemsSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private readItems(): CartItem[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item && typeof item.quantity === 'number' && item.product && typeof item.product.id === 'number')
        .map((item) => ({
          product: item.product,
          quantity: Math.max(1, Math.floor(item.quantity)),
        }));
    } catch {
      return [];
    }
  }
}
