import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  username = '';
  password = '';
  confirmPassword = '';
  termsAccepted = false;
  isLoading = false;
  toast = { visible: false, message: '', type: 'success' };
  private toastTimer: any;
  usernameError = false;
  passwordError = false;
  confirmError = false;

  constructor(private authService: AuthService, private router: Router) {}

  showToast(msg: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message: msg, type };
    this.toastTimer = setTimeout(() => (this.toast.visible = false), 3500);
  }

  handleSignup(): void {
    let valid = true;
    this.usernameError = !this.username.trim();
    if (this.usernameError) valid = false;
    this.passwordError = !this.password || this.password.length < 6;
    if (this.passwordError) { this.showToast('Password must be at least 6 characters', 'error'); valid = false; }
    this.confirmError = this.password !== this.confirmPassword;
    if (this.confirmError) { this.showToast('Passwords do not match', 'error'); valid = false; }
    if (!this.termsAccepted) { this.showToast('Accept Terms & Conditions', 'error'); valid = false; }
    if (!valid) return;

    this.isLoading = true;
    this.authService.signup({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.showToast('Account created! Redirecting to login...', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        let msg = 'Signup failed';
        if (err.error?.message) msg = err.error.message;
        else if (err.error?.error) msg = err.error.error;
        else if (Array.isArray(err.error?.errors)) msg = err.error.errors.join(', ');
        this.showToast(msg, 'error');
      },
      complete: () => { this.isLoading = false; }
    });
  }

  handleGoogleSignup(): void { this.authService.initiateGoogleLogin(); }
  goHome(): void { this.router.navigate(['/']); }
  goToLogin(): void { this.router.navigate(['/login']); }
}
