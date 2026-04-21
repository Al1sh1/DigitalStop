import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { LoginPageComponent } from './pages/login/login-page.component';
import { OrdersPageComponent } from './pages/orders/orders-page.component';
import { ShopPageComponent } from './pages/shop/shop-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePageComponent },
  { path: 'shop', component: ShopPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'orders', component: OrdersPageComponent },
  { path: '**', redirectTo: 'home' },
];
