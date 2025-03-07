import type { APIRoute } from 'astro';
import { validateLogin } from '../../../utils/auth';

// In a real application, these would be stored securely in environment variables
// and the password would be hashed
const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    const result = await validateLogin(username, password);

    if (result.success) {
      // Set secure HTTP-only cookie with user info
      cookies.set('auth-token', JSON.stringify({
        id: result.user.id,
        username: result.user.username,
        role: result.user.role
      }), {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return new Response(
        JSON.stringify({ success: true }), 
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: result.message 
      }), 
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Server error' 
      }), 
      { status: 500 }
    );
  }
}; 