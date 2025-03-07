import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Remove the auth cookie
  cookies.delete('auth-token', {
    path: '/'
  });

  return new Response(
    JSON.stringify({ success: true }), 
    { status: 200 }
  );
}; 