import { defineMiddleware } from 'astro:middleware';

const publicPaths = [
  '/login',
  '/api/auth/login',  // Allow access to login API
  '/api/auth/logout'  // Allow access to logout API
];

// Assets and public resources that should always be accessible
const publicPatterns = [
  /^\/(_astro|assets|favicon\.ico)/  // Add more patterns if needed
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url } = context;
  const currentPath = url.pathname;
  
  console.log('Middleware: Checking path:', currentPath);

  // Check if the path matches any public patterns (for assets)
  if (publicPatterns.some(pattern => pattern.test(currentPath))) {
    console.log('Middleware: Public asset accessed:', currentPath);
    return next();
  }
  
  // Check if the path is in public paths
  if (publicPaths.includes(currentPath)) {
    console.log('Middleware: Public route accessed:', currentPath);
    return next();
  }

  const authToken = cookies.get('auth-token');
  console.log('Middleware: Auth token present:', !!authToken?.value);
  
  if (!authToken?.value) {
    console.log('Middleware: Redirecting to login');
    return Response.redirect(`${url.origin}/login?redirect=${currentPath}`, 302);
  }

  try {
    console.log('Middleware: Authentication successful');
    return next();
  } catch (error) {
    console.log('Middleware: Authentication failed:', error);
    return Response.redirect(`${url.origin}/login?redirect=${currentPath}`, 302);
  }
}); 