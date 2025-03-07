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

export const GET: APIRoute = async ({ params, request }) => {
  if (!await isAdmin(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('id', params.id!)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ message: 'User not found' }), 
          { status: 404 }
        );
      }
      throw error;
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to fetch user' }), 
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  if (!await isAdmin(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { username, password, role } = await request.json();

    // Check if username exists (excluding current user)
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', params.id!)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Username already exists' }), 
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      username,
      role
    };

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id!)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ message: 'User not found' }), 
          { status: 404 }
        );
      }
      throw error;
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to update user' }), 
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  if (!await isAdmin(request)) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    // Get current user from cookie to prevent self-deletion
    const authToken = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];
    const currentUser = authToken ? JSON.parse(decodeURIComponent(authToken)) : null;

    if (currentUser?.id === parseInt(params.id!)) {
      return new Response(
        JSON.stringify({ message: 'Cannot delete your own account' }), 
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', params.id!);

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ message: 'User not found' }), 
          { status: 404 }
        );
      }
      throw error;
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to delete user' }), 
      { status: 500 }
    );
  }
}; 