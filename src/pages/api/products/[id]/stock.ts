import type { APIRoute } from 'astro';
import { db } from '../../../../db';
import { products } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { action, quantity } = await request.json();
    
    // Get current product
    const product = await db.select().from(products).where(eq(products.id, Number(params.id))).get();
    
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate new stock
    let newStock = product.stock;
    if (action === 'add') {
      newStock += quantity;
    } else if (action === 'remove') {
      if (product.stock < quantity) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient stock',
          details: `Current stock (${product.stock}) is less than requested quantity (${quantity})`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      newStock -= quantity;
    }

    // Update product stock
    const [result] = await db.update(products)
      .set({
        stock: newStock,
        updatedAt: new Date()
      })
      .where(eq(products.id, Number(params.id)))
      .returning();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to adjust stock',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 