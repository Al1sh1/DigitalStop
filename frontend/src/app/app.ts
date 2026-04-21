import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly cartItemsCount$: Observable<number>;

  constructor(
    public readonly authService: AuthService,
    private readonly cartService: CartService,
    private readonly router: Router,
  ) {
    this.cartItemsCount$ = this.cartService.items$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
