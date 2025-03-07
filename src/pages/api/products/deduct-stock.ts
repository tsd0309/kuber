import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { product_code, quantity } = await request.json();

    // Validate input
    if (!product_code || !quantity) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: 'Product code and quantity are required' 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.code, product_code))
      .limit(1);

    if (!product) {
      return new Response(
        JSON.stringify({ 
          error: 'Product not found', 
          details: `No product found with code: ${product_code}` 
        }), 
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if there's enough stock
    if (product.stock < quantity) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient stock', 
          details: `Current stock (${product.stock}) is less than requested deduction (${quantity})` 
        }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update the stock
    const [updatedProduct] = await db
      .update(products)
      .set({ 
        stock: product.stock - quantity 
      })
      .where(eq(products.id, product.id))
      .returning();

    return new Response(
      JSON.stringify(updatedProduct),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error deducting stock:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to deduct stock',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 