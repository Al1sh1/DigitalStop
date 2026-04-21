export interface JwtTokenPair {
  access: string;
  refresh: string;
}

export interface Brand {
  id: number;
  name: string;
  description: string;
  country: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  specs?: Record<string, string>;
  brand: Brand;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductListResponse {
  products: Product[];
}

export interface BrandListResponse {
  brands: Brand[];
}

export interface OrderProductInfo {
  id: number;
  name: string;
  price: string;
}

export interface OrderUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
}

export interface Order {
  id: number;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  quantity: number;
  total_price: string;
  user: OrderUserInfo;
  product: OrderProductInfo;
}

export interface OrderListResponse {
  orders: Order[];
}

export interface CreateOrderPayload {
  product_id: number;
  quantity: number;
}

export interface ManagerCreateProductPayload {
  name: string;
  description: string;
  price: string;
  image_url: string;
  specs?: Record<string, string>;
  brand_id: number;
}

export interface ManagerUpdateProductPayload {
  name?: string;
  description?: string;
  price?: string;
  image_url?: string;
  specs?: Record<string, string>;
  brand_id?: number;
}
