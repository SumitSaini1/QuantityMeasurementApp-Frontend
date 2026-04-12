export const environment = {
  production: false,
  // API Gateway - single entry point for all requests (routes to Auth :8081 and Quantity :8082)
  apiBaseUrl: 'http://localhost:8080',
  // Google OAuth2 goes directly to Auth Service (Spring Security handles redirect)
  authServiceUrl: 'http://localhost:8081'
};
