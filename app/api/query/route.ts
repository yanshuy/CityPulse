import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils'

// Ensure we run in the Node.js runtime so .env.local is available
export const runtime = 'nodejs'

const QueryResponseSchema = z.object({
    type: z.enum(['itinerary', 'traffic', 'events', 'food', 'explore', 'general']),
    destination: z.string().optional(),
    days: z.number().optional(),
    startDate: z.string().optional(),
    category: z.string().optional(),
    timeframe: z.string().optional(),
    searchQuery: z.string().optional(),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        // Quick guard for missing API key
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY')
            return Response.json({
                success: false,
                error: 'Server misconfiguration: missing GOOGLE_GENERATIVE_AI_API_KEY',
            }, { status: 500 })
        }

        // Single Gemini model call; pick a generally accessible alias
        const modelName = 'gemini-2.0-flash'
        const { object } = await withRetry(
            async () => {
                return await generateObject({
                    model: google(modelName),
                    schema: QueryResponseSchema,
                    prompt: `
        Analyze this user query and categorize it: "${query}"
        
        Available components and pages:
        - itinerary: Trip/travel planning (ItineraryPlanner component with destination, days, startDate fields)
        - traffic: Traffic conditions and commute information
        - events: Local events and activities
        - food: Restaurant recommendations and food-related queries
        - explore: General exploration, discovery, places to visit (has social feed)
        - general: Any other query
        
        For itinerary requests, extract:
        - destination: the place they want to visit
        - days: number of days (if mentioned)
        - startDate: specific date if mentioned (format: YYYY-MM-DD)
        
        For other requests, extract relevant information:
        - category: type of content (events, food, etc.)
        - timeframe: when they want it (today, weekend, etc.)
        - searchQuery: refined search terms for the request
        
        Examples:
        - "Plan a 3 day itinerary to Mumbai" → type: "itinerary", destination: "Mumbai", days: 3
        - "Plan a trip to Paris next month" → type: "itinerary", destination: "Paris"
        - "Check traffic conditions" → type: "traffic"
        - "Find events this weekend" → type: "events", timeframe: "weekend"
        - "Best restaurants in Delhi" → type: "food", searchQuery: "restaurants Delhi"
        - "What to see in Tokyo" → type: "explore", searchQuery: "Tokyo attractions"
      `,
                })
            },
            {
                maxRetries: 2,
                baseDelay: 500,
                maxDelay: 4000
            }
        )

        return Response.json({ success: true, data: object, meta: { model: modelName } })
    } catch (error) {
        console.error('AI processing error:', error)
        return Response.json({
            success: false,
            error: 'Failed to process query'
        }, { status: 500 })
    }
}
