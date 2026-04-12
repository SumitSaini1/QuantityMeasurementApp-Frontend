import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  toast = { visible: false, message: '', type: 'success' };
  private toastTimer: any;
  usernameError = false;
  passwordError = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      this.authService.setToken(tokenFromUrl);
      window.history.replaceState({}, document.title, '/login');
      this.showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      return;
    }
    const saved = this.authService.getRememberedUser();
    if (saved) { this.username = saved; this.rememberMe = true; }
  }

  showToast(msg: string, type: 'success' | 'error'): void {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, message: msg, type };
    this.toastTimer = setTimeout(() => (this.toast.visible = false), 3500);
  }

  handleLogin(): void {
    this.usernameError = !this.username.trim();
    this.passwordError = !this.password;
    if (this.usernameError || this.passwordError) {
      this.showToast('Please fill in all fields.', 'error'); return;
    }
    this.isLoading = true;
    this.authService.login({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        if (this.rememberMe) this.authService.setRememberedUser(this.username.trim());
        else this.authService.clearRememberedUser();
        this.showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.showToast(err.error?.message || err.error?.error || `Login failed (${err.status})`, 'error');
      }
    });
  }

  handleGoogleLogin(): void { this.authService.initiateGoogleLogin(); }
  goHome(): void { this.router.navigate(['/']); }
  goToSignup(): void { this.router.navigate(['/signup']); }
}
