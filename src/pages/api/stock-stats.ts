import type { APIRoute } from 'astro';
import { db } from '../../db';
import { products } from '../../db/schema';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ url }) => {
    try {
        const multiplier = Number(url.searchParams.get('multiplier') || '3');
        
        // Get updated stock statistics
        const [stockStats] = await db.select({
            soldOut: sql`count(case when stock <= 0 then 1 end)`,
            lowStock: sql`count(case when stock > 0 and stock < restock_level then 1 end)`,
            mediumStock: sql`count(case when stock >= restock_level and stock < (restock_level * ${multiplier}) then 1 end)`,
            highStock: sql`count(case when stock >= (restock_level * ${multiplier}) then 1 end)`
        }).from(products).all();

        // Convert BigInt values to numbers
        const response = {
            soldOut: Number(stockStats.soldOut) || 0,
            lowStock: Number(stockStats.lowStock) || 0,
            mediumStock: Number(stockStats.mediumStock) || 0,
            highStock: Number(stockStats.highStock) || 0
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error getting stock stats:', error);
        return new Response(JSON.stringify({
            error: 'Failed to get stock stats',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}; 