import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = environment.apiBaseUrl;
  private readonly AUTH_SERVICE_URL = environment.authServiceUrl;
  private readonly TOKEN_KEY = 'qma_token';
  private readonly REMEMBER_KEY = 'qma_remembered_user';

  constructor(private http: HttpClient) {}

  // POST http://localhost:8080/auth/login → routed by Gateway to Auth Service :8081
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, payload).pipe(
      tap((res) => {
        const token = res.token ?? res.accessToken ?? res.jwt ?? null;
        if (token) {
          this.setToken(token);
        }
      })
    );
  }

  // POST http://localhost:8080/auth/signup → routed by Gateway to Auth Service :8081
  signup(payload: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/auth/signup`, payload);
  }

  // Google OAuth2 — goes directly to Auth Service which has Spring Security OAuth2 config
  initiateGoogleLogin(): void {
    window.location.href = `${this.AUTH_SERVICE_URL}/oauth2/authorization/google`;
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setRememberedUser(username: string): void {
    localStorage.setItem(this.REMEMBER_KEY, username);
  }

  getRememberedUser(): string | null {
    return localStorage.getItem(this.REMEMBER_KEY);
  }

  clearRememberedUser(): void {
    localStorage.removeItem(this.REMEMBER_KEY);
  }

  /**
   * Decode the JWT payload to extract username.
   * JWT structure: header.payload.signature (all base64)
   * Quantity Service uses same secret key to validate — no network call needed.
   */
  getUsernameFromToken(): string {
    const token = this.getToken();
    if (!token) return 'User';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || payload.sub || payload.email || 'User';
    } catch {
      return 'User';
    }
  }

  logout(): void {
    this.clearToken();
  }
}
