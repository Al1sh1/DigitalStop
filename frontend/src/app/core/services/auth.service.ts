import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'ds_access_token';
  private readonly refreshTokenKey = 'ds_refresh_token';
  private readonly usernameKey = 'ds_username';
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasAccessToken());

  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  login(username: string, password: string): Observable<void> {
    return this.api.loginWithJwt(username, password).pipe(
      tap((tokens) => {
        localStorage.setItem(this.accessTokenKey, tokens.access);
        localStorage.setItem(this.refreshTokenKey, tokens.refresh);
        localStorage.setItem(this.usernameKey, username);
        this.isAuthenticatedSubject.next(true);
      }),
      map(() => void 0),
    );
  }

  logout(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.usernameKey);
    this.isAuthenticatedSubject.next(false);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  isAuthenticated(): boolean {
    return this.hasAccessToken();
  }

  private hasAccessToken(): boolean {
    return !!localStorage.getItem(this.accessTokenKey);
  }
}
