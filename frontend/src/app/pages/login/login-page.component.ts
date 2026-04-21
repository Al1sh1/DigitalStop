import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  get currentUsername(): string {
    return this.authService.getUsername() ?? '';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  login(): void {
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.router.navigateByUrl('/orders');
      },
      error: (error) => {
        this.errorMessage = this.apiService.getErrorMessage(error);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
