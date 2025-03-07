import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products } from '../../../db/schema';

export const DELETE: APIRoute = async () => {
  try {
    // Delete all products
    await db.delete(products);
    
    return new Response(null, { 
      status: 204 // No Content
    });
  } catch (error) {
    console.error('Error deleting all products:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to delete all products',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 