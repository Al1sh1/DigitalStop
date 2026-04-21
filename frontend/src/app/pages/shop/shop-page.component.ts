import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Brand, Product } from '../../core/models/api.models';

@Component({
  selector: 'app-shop-page',
  imports: [FormsModule],
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.css',
})
export class ShopPageComponent implements OnInit {
  products: Product[] = [];
  brands: Brand[] = [];
  selectedBrandId = 'all';
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'name-asc' = 'default';
  searchText = '';
  loadingProducts = false;
  loadingBrands = false;
  errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadBrands();
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

  loadBrands(): void {
    this.loadingBrands = true;
    this.errorMessage = '';
    this.api.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.loadingBrands = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.errorMessage = this.api.getErrorMessage(error);
        this.loadingBrands = false;
        this.cdr.markForCheck();
      },
    });
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

  private priceValue(value: string): number {
    return Number(value);
  }
}
