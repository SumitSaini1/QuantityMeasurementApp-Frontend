export const environment = {
  production: false,
  // apiBaseUrl: 'https://api-gateway-production-4492.up.railway.app',
  // authServiceUrl: 'https://auth-service-production-2f6f.up.railway.app'

  // apiBaseUrl: 'http://localhost:8080',
  // // Google OAuth2 goes directly to Auth Service (Spring Security handles redirect)
  // authServiceUrl: 'http://localhost:8081'

   // All API calls go through gateway
   apiBaseUrl: 'https://api-gateway-5gjs.onrender.com',

   // OAuth handled directly by auth service
   authServiceUrl: 'https://auth-service-pmsq.onrender.com'

};
