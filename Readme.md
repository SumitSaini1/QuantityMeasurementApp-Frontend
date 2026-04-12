# QMA Angular Frontend

Angular 17 frontend for the QmaMicroservice project.
Pixel-perfect conversion of the original HTML/CSS/JS frontend.

## Microservices Architecture
```
Browser (Angular) → API Gateway :8080
  ├── /auth/**        → Auth Service :8081  (public - no JWT needed)
  ├── /api/quantity/** → Quantity Service :8082  (JWT required)
  └── All discovered via Eureka :8761
```

## Startup Order (from Architecture Guide)
1. **Eureka Server** `:8761` — start first
2. **Auth Service** `:8081` — registers with Eureka
3. **Quantity Service** `:8082` — registers with Eureka
4. **API Gateway** `:8080` — fetches registry, starts routing
5. **This Angular app** — `ng serve` (runs on `:4200`)

## Setup

### Prerequisites
```bash
node --version   # 18+
npm --version    # 9+
```

### Install & Run
```bash
npm install
ng serve
# Open: http://localhost:4200
```

### Environment Configuration
Edit `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080',      // API Gateway
  authServiceUrl: 'http://localhost:8081'   // For Google OAuth2 redirect
};
```

## CORS Configuration
Your Spring services need to allow `http://localhost:4200`.

Add to **Auth Service** and **Quantity Service** SecurityConfig:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

Add to **API Gateway** `application.yml`:
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://localhost:4200"
            allowedMethods: "*"
            allowedHeaders: "*"
            allowCredentials: true
```

## Google OAuth2
After Google login, Spring redirects to:
`http://localhost:4200/?token=<JWT>`

The `HomeComponent.ngOnInit()` reads `?token=` from the URL,
saves it to `localStorage` as `qma_token`, and navigates to `/dashboard`.

## API Reference

### Auth (via Gateway → Auth Service, public)
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/auth/signup` | `{ username, password }` |
| POST | `/auth/login` | `{ username, password }` → returns `{ token }` |

### Quantity (via Gateway → Quantity Service, JWT required)
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/api/quantity/convert` | `{ value, fromUnit, toUnit }` |
| POST | `/api/quantity/add` | `{ value1, value2, unit1, unit2 }` |
| POST | `/api/quantity/subtract` | `{ value1, value2, unit1, unit2 }` |
| POST | `/api/quantity/compare` | `{ value1, value2, unit1, unit2 }` |
| POST | `/api/quantity/divide` | `{ value1, value2, unit1, unit2 }` |

## Project Structure
```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Login, signup, token, JWT decode
│   │   │   └── quantity.service.ts   # All 5 calculation endpoints
│   │   ├── guards/
│   │   │   └── auth.guard.ts         # Protects /dashboard
│   │   └── interceptors/
│   │       └── auth.interceptor.ts   # Auto Bearer token + 401 redirect
│   ├── pages/
│   │   ├── home/                     # Landing page (index.html)
│   │   ├── login/                    # Login page
│   │   ├── signup/                   # Signup page
│   │   └── dashboard/                # Main converter dashboard
│   ├── app.routes.ts                 # Lazy-loaded routing
│   ├── app.config.ts                 # provideHttpClient + interceptor
│   └── app.component.ts              # Root <router-outlet>
└── environments/
    └── environment.ts                # API URLs
```
