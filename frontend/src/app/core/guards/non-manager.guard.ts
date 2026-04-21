import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

export const nonManagerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const api = inject(ApiService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return api.managerGetOrders().pipe(
    map(() => router.createUrlTree(['/manager'])),
    catchError(() => of(true)),
  );
};
