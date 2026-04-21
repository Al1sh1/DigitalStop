import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Brand, Product } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-shop-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.css',
})
export class ShopPageComponent implements OnInit {
  products: Product[] = [];
  selectedBrandId = 'all';
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'name-asc' = 'default';
  searchText = '';
  loadingProducts = false;
  errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.errorMessage = '';
    this.api.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingProducts = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loadingProducts = false;
        this.cdr.markForCheck();
      },
    });
  }

  get brands(): Brand[] {
    const uniqueBrands = new Map<number, Brand>();
    for (const product of this.products) {
      if (!uniqueBrands.has(product.brand.id)) {
        uniqueBrands.set(product.brand.id, product.brand);
      }
    }

    return [...uniqueBrands.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  get visibleProducts(): Product[] {
    const selectedId = Number(this.selectedBrandId);
    const query = this.searchText.trim().toLowerCase();

    const filtered = this.products.filter((product) => {
      const byBrand = this.selectedBrandId === 'all' || product.brand.id === selectedId;
      const byQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.name.toLowerCase().includes(query);
      return byBrand && byQuery;
    });

    const sorted = [...filtered];
    if (this.sortBy === 'price-asc') {
      sorted.sort((a, b) => this.priceValue(a.price) - this.priceValue(b.price));
    } else if (this.sortBy === 'price-desc') {
      sorted.sort((a, b) => this.priceValue(b.price) - this.priceValue(a.price));
    } else if (this.sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }

  formatPrice(value: string): string {
    return `$${Number(value).toFixed(2)}`;
  }

  productImageUrl(product: Product): string {
    return product.image_url || 'https://placehold.co/600x420?text=Phone';
  }

  private priceValue(value: string): number {
    return Number(value);
  }
}
