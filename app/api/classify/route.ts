import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'nodejs'

const ClassificationSchema = z.object({
    type: z.enum(['planner', 'traffic', 'events', 'food', 'explore', 'general']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 })
        }

        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: ClassificationSchema,
            prompt: `
        Classify this user query into one of these UI component types:
        
        Query: "${query}"
        
        Component Types:
        - planner: Trip/itinerary planning, vacation planning, travel plans (mentions destinations, days, travel itinerary)
        - traffic: Traffic conditions, commute info, road status, driving time, route planning
        - events: Local events, concerts, activities, festivals, shows, entertainment happening
        - food: Restaurant recommendations, food places, dining, cafes, cuisine suggestions
        - explore: General exploration, tourist spots, places to visit, sightseeing, attractions
        - general: Anything else that doesn't fit the above categories (weather, news, general questions)
        
        Examples:
        - "Plan a 3 day trip to Mumbai" → planner
        - "Check traffic from Andheri to Airport" → traffic  
        - "What events are happening this weekend" → events
        - "Best restaurants in Bandra" → food
        - "Show me tourist places in Delhi" → explore
        - "What's the weather today" → general
        
        Provide confidence score (0-1) and brief reasoning for classification.
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Classification error:', error)
        return Response.json({
            success: false,
            error: 'Failed to classify query',
            fallback: { type: 'general', confidence: 0.5, reasoning: 'Fallback due to error' }
        }, { status: 500 })
    }
}
