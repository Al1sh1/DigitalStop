import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import { ApiService } from './core/services/api.service';
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
  readonly canAccessManager$: Observable<boolean>;
  readonly canAccessCustomerOrders$: Observable<boolean>;

  constructor(
    public readonly authService: AuthService,
    private readonly api: ApiService,
    private readonly cartService: CartService,
    private readonly router: Router,
  ) {
    this.cartItemsCount$ = this.cartService.items$.pipe(
      map((items) => items.reduce((sum, item) => sum + item.quantity, 0)),
    );

    this.canAccessManager$ = this.authService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return of(false);
        }

        return this.api.managerGetOrders().pipe(
          map(() => true),
          catchError(() => of(false)),
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.canAccessCustomerOrders$ = this.authService.isAuthenticated$.pipe(
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          return of(false);
        }

        return this.api.getOrders().pipe(
          map(() => true),
          catchError(() => of(false)),
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
