import { db } from '../../../db';
import { products } from '../../../db/schema';
import { sql } from 'drizzle-orm';

// Function to generate fuzzy search patterns
function generateFuzzyPatterns(searchTerm: string) {
    // Normalize and split search term into words
    const words = searchTerm.toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
    
    if (words.length === 0) return [];

    // Generate patterns for each word
    const patterns = words.map(word => {
        // Create variations of the search pattern
        const variations = [
            // Exact match with word boundaries
            `%${word}%`,
            // Match parts of words
            `%${word.split('').join('%')}%`,
            // Match with potential typos (allow characters between)
            `%${word.substring(0, Math.ceil(word.length/2))}%${word.substring(Math.ceil(word.length/2))}%`,
            // Match start of words
            `${word}%`,
            // Reverse match for end of words
            `%${word}`
        ];
        return variations;
    }).flat();

    return [...new Set(patterns)]; // Remove duplicates
}

export async function GET({ url }) {
    try {
        const searchQuery = url.searchParams.get('q') || '';
        const page = Number(url.searchParams.get('page') || '1');
        const itemsPerPage = 20;
        const offset = (page - 1) * itemsPerPage;

        // Build the base query
        let baseQuery = db.select().from(products);

        // Add search condition if search query exists
        if (searchQuery) {
            const searchPatterns = generateFuzzyPatterns(searchQuery);
            
            if (searchPatterns.length > 0) {
                // Create OR conditions for each pattern across all searchable fields
                const searchConditions = searchPatterns.map(pattern => 
                    sql`(
                        LOWER(name) LIKE LOWER(${pattern}) OR 
                        LOWER(code) LIKE LOWER(${pattern}) OR 
                        LOWER(uom) LIKE LOWER(${pattern}) OR
                        CAST(price AS TEXT) LIKE ${pattern} OR
                        CAST(stock AS TEXT) LIKE ${pattern} OR
                        CAST(restock_level AS TEXT) LIKE ${pattern}
                    )`
                );
                
                // Combine all conditions with OR
                baseQuery = baseQuery.where(sql`(${sql.join(searchConditions, sql` OR `)})`);
            }
        }

        // Get total count for pagination
        const [{ count }] = await db.select({ 
            count: sql<number>`count(*)` 
        }).from(baseQuery.as('filtered_products')).all();

        // Get paginated results
        const results = await baseQuery
            .limit(itemsPerPage)
            .offset(offset)
            .all();

        return new Response(JSON.stringify({
            products: results,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(count / itemsPerPage),
                totalItems: count
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 