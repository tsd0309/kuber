import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { products } from '../../../db/schema';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Convert string values to numbers where needed
    const productData = {
      code: data.code,
      name: data.name,
      uom: data.uom,
      price: Number(data.price),
      stock: Number(data.stock),
      restock_level: Number(data.restock_level),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the product and get the result
    const [result] = await db.insert(products)
      .values(productData)
      .returning();
    
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 