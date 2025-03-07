import type { APIRoute } from 'astro';
import { supabase } from '../../../db/database';
import { hashPassword } from '../../../utils/auth';

// Helper to check if user is admin
async function isAdmin(request: Request) {
  const authToken = request.headers.get('cookie')?.split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1];

  if (!authToken) return false;

  try {
    const userData = JSON.parse(decodeURIComponent(authToken));
    return userData.role === 'admin';
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ request }) => {
  if (!await isAdmin(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, created_at, last_login, locked_until');

    if (error) throw error;

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch users' }), 
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!await isAdmin(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { username, password, role } = await request.json();

    // Validate input
    if (!username || !password) {
      return new Response(
        JSON.stringify({ message: 'Username and password are required' }), 
        { status: 400 }
      );
    }

    // Check if username exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Username already exists' }), 
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        username,
        password: hashedPassword,
        role: role || 'user'
      }])
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to create user' }), 
      { status: 500 }
    );
  }
}; 