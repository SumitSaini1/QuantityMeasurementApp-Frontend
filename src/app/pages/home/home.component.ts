import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      this.authService.setToken(token);
      window.history.replaceState({}, document.title, '/');
      this.router.navigate(['/dashboard']);
    }
  }

  goToDashboard(): void { this.router.navigate(['/dashboard']); }
  goToLogin(): void     { this.router.navigate(['/login']); }
  goToSignup(): void    { this.router.navigate(['/signup']); }
}
