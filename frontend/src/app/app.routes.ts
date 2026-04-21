import { Routes } from '@angular/router';
import { customerGuard } from './core/guards/customer.guard';
import { managerGuard } from './core/guards/manager.guard';
import { nonManagerGuard } from './core/guards/non-manager.guard';
import { CartPageComponent } from './pages/cart/cart-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { ManagerAdminPageComponent } from './pages/manager-admin/manager-admin-page.component';
import { OrdersPageComponent } from './pages/orders/orders-page.component';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail-page.component';
import { ShopPageComponent } from './pages/shop/shop-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePageComponent },
  { path: 'manager', component: ManagerAdminPageComponent, canActivate: [managerGuard] },
  { path: 'cart', component: CartPageComponent, canActivate: [nonManagerGuard] },
  { path: 'shop/:id', component: ProductDetailPageComponent },
  { path: 'shop', component: ShopPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'orders', component: OrdersPageComponent, canActivate: [customerGuard] },
  { path: '**', redirectTo: 'home' },
];
