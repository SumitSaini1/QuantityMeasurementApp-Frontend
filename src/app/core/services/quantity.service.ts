import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ConvertRequest {
  value: number;
  fromUnit: string;
  toUnit: string;
}

export interface OperationRequest {
  value1: number;
  value2: number;
  unit1: string;
  unit2: string;
}

export interface QuantityResponse {
  resultValue: number | string;
  resultUnit?: string;
  message?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class QuantityService {
  // All requests go to API Gateway :8080 which routes /api/quantity/** → Quantity Service :8082
  private readonly BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken() ?? '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // POST /api/quantity/convert — Bearer token required (Quantity Service validates JWT)
  convert(payload: ConvertRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.BASE_URL}/api/quantity/convert`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // POST /api/quantity/add
  add(payload: OperationRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.BASE_URL}/api/quantity/add`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // POST /api/quantity/subtract
  subtract(payload: OperationRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.BASE_URL}/api/quantity/subtract`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // POST /api/quantity/compare
  compare(payload: OperationRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.BASE_URL}/api/quantity/compare`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }

  // POST /api/quantity/divide
  divide(payload: OperationRequest): Observable<QuantityResponse> {
    return this.http.post<QuantityResponse>(
      `${this.BASE_URL}/api/quantity/divide`,
      payload,
      { headers: this.getAuthHeaders() }
    );
  }
}
