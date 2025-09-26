import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'nodejs'

const FoodDataSchema = z.object({
    heading: z.string(),
    location: z.string(),
    cuisine: z.string().optional(),
    restaurants: z.array(z.object({
        name: z.string(),
        cuisine: z.string(),
        rating: z.number().min(1).max(5),
        priceRange: z.string(),
        location: z.string(),
        specialty: z.string(),
        description: z.string(),
        estimatedCost: z.string(),
        timings: z.string(),
        image: z.string().optional(),
    })).max(6),
    totalFound: z.number(),
    suggestion: z.string(),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        const { object } = await generateObject({
            model: google('gemini-1.5-flash-latest'),
            schema: FoodDataSchema,
            prompt: `
        Generate realistic restaurant recommendations for this query: "${query}"
        
        Create comprehensive food recommendations including:
        - heading: Descriptive heading (e.g., "Best Street Food in Mumbai", "Top Restaurants in Bandra")
        - location: Area/city for restaurants (extract from query or default to Mumbai)
        - cuisine: Specific cuisine type if mentioned in query
        - restaurants: 4-6 realistic restaurants with:
          * name: Authentic restaurant names (mix of popular and local names)
          * cuisine: Type of cuisine (Indian, Chinese, Italian, etc.)
          * rating: Star rating between 3.5-4.8
          * priceRange: Budget indicator (₹, ₹₹, ₹₹₹)
          * location: Specific area in the city
          * specialty: Signature dish or what they're famous for
          * description: Brief, appetizing description
          * estimatedCost: Cost for 2 people in Indian Rupees
          * timings: Operating hours
          * image: Optional placeholder image path
        - totalFound: Total restaurants available
        - suggestion: Helpful dining suggestion
        
        Make recommendations realistic for Indian dining with:
        - Popular areas: Bandra, Andheri, Colaba, etc.
        - Mix of cuisines: North Indian, South Indian, Chinese, Continental, etc.
        - Realistic pricing: Street food ₹50-200, casual ₹500-1000, fine dining ₹2000+
        - Indian dining culture context
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Food data generation error:', error)
        return Response.json({ success: false, error: 'Failed to generate food data' }, { status: 500 })
    }
}