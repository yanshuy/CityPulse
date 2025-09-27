import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils'

export const runtime = 'nodejs'

const ExploreDataSchema = z.object({
    heading: z.string(),
    location: z.string(),
    category: z.string().optional(),
    places: z.array(z.object({
        name: z.string(),
        type: z.enum(['tourist_attraction', 'historical', 'nature', 'entertainment', 'shopping', 'cultural', 'religious', 'modern']),
        rating: z.number().min(1).max(5),
        location: z.string(),
        description: z.string(),
        highlights: z.array(z.string()).max(3),
        bestTimeToVisit: z.string(),
        entryFee: z.string(),
        estimatedDuration: z.string(),
        image: z.string().optional(),
    })).max(6),
    totalFound: z.number(),
    suggestion: z.string(),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: ExploreDataSchema,
            prompt: `
        Generate realistic places to explore for this query: "${query}"
        
        Create comprehensive exploration recommendations including:
        - heading: Descriptive heading (e.g., "Top Attractions in Mumbai", "Must-Visit Places in Delhi")
        - location: City/area for places (extract from query or default to Mumbai)
        - category: Specific category if mentioned (historical, nature, shopping, etc.)
        - places: 4-6 realistic places with:
          * name: Authentic place names (famous landmarks, attractions)
          * type: Category of place
          * rating: Star rating between 3.8-4.9
          * location: Specific area/address
          * description: Engaging description of what makes it special
          * highlights: 2-3 key features or things to see/do
          * bestTimeToVisit: Best time of day or season
          * entryFee: Cost information in Indian Rupees (Free, ₹50, ₹200, etc.)
          * estimatedDuration: Time needed to explore (1-2 hours, Half day, etc.)
          * image: Optional placeholder image path
        - totalFound: Total places available
        - suggestion: Helpful exploration tip
        
        Make recommendations realistic for Indian destinations with:
        - Famous landmarks: Gateway of India, India Gate, Red Fort, Marine Drive, etc.
        - Mix of categories: historical monuments, temples, markets, beaches, parks
        - Realistic entry fees for Indian attractions
        - Indian cultural context and significance
        - Popular tourist circuits and must-see combinations
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Explore data generation error:', error)
        return Response.json({ success: false, error: 'Failed to generate explore data' }, { status: 500 })
    }
}
