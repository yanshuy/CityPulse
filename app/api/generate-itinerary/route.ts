import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils'

export const runtime = 'nodejs'

const ItineraryItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['attraction', 'restaurant', 'activity', 'accommodation', 'transport']),
    description: z.string(),
    location: z.string(),
    address: z.string(),
    startTime: z.string(),
    duration: z.string(),
    estimatedCost: z.string(),
    rating: z.number().min(1).max(5),
    highlights: z.array(z.string()).max(3),
    tips: z.string().optional(),
    coordinates: z.object({
        lat: z.number(),
        lng: z.number()
    }).optional(),
    image: z.string().optional()
})

const DayPlanSchema = z.object({
    day: z.number(),
    date: z.string(),
    theme: z.string(),
    summary: z.string(),
    items: z.array(ItineraryItemSchema).min(2).max(6),
    totalEstimatedCost: z.string(),
    walkingDistance: z.string(),
    tips: z.string()
})

const ItinerarySchema = z.object({
    id: z.string(),
    title: z.string(),
    destination: z.string(),
    totalDays: z.number(),
    overview: z.string(),
    bestTimeToVisit: z.string(),
    totalBudget: z.string(),
    days: z.array(DayPlanSchema),
    generalTips: z.array(z.string()).max(3),
    alternativeSuggestions: z.array(z.object({
        name: z.string(),
        type: z.string(),
        reason: z.string()
    })).max(5)
})

export async function POST(req: Request) {
    try {
        const { destination, days, preferences, budget } = await req.json()

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 })
        }

        const { object } = await withRetry(
            async () => {
                return await generateObject({
                    model: google('gemini-2.0-flash'),
                    schema: ItinerarySchema,
                    prompt: `
        Generate a detailed ${days}-day itinerary for ${destination}. 
        
        User preferences: ${preferences || 'balanced mix of culture, food, and sightseeing'}
        Budget: ${budget || 'moderate'}
        
        Create a comprehensive itinerary with:
        
        OVERALL STRUCTURE:
        - id: Unique identifier (use format: dest-${Date.now()})
        - title: Engaging title (e.g., "Mumbai Heritage & Flavors Experience")
        - destination: ${destination}
        - totalDays: ${days}
        - overview: 2-3 sentence overview of the trip experience
        - bestTimeToVisit: Optimal seasons/months with weather info
        - totalBudget: Realistic total cost in Indian Rupees
        - generalTips: 3 essential tips for visiting this destination
        
        DAILY PLANS (for each of ${days} days):
        - day: Day number
        - date: Relative date (Day 1, Day 2, etc.)
        - theme: Theme for the day (e.g., "Historic Heritage", "Local Flavors")
        - summary: Brief description of the day's focus
        - items: 3-5 activities/places for the day, scheduled with:
          * Unique IDs (format: day1-item1, day1-item2, etc.)
          * Real place names in ${destination}
          * Accurate descriptions and locations
          * Realistic start times (e.g., "10:30 AM", "2:00 PM")
          * Duration estimates (e.g., "2 hours", "1.5 hours")
          * Cost estimates in Indian Rupees
          * Ratings (3.8-4.8 range)
          * 2-3 highlights per place
          * Practical tips
          * Approximate coordinates (realistic for ${destination})
        - totalEstimatedCost: Total cost for the day
        - walkingDistance: Estimated walking distance
        - tips: Day-specific advice
        
        ALTERNATIVE SUGGESTIONS:
        - 5 backup places/activities user could substitute
        - Include name, type, and reason why it's a good alternative
        
        Make everything authentic to ${destination} with:
        - Real landmarks, museums, restaurants, markets
        - Accurate neighborhoods and areas
        - Realistic travel times and costs
        - Local cultural context
        - Practical Indian travel considerations
        
        Ensure logical flow: morning activities → lunch → afternoon activities → evening activities
        `,
                })
            },
            {
                maxRetries: 3,
                baseDelay: 2000,
                maxDelay: 12000
            }
        )

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Itinerary generation error:', error)
        return Response.json({
            success: false,
            error: 'Failed to generate itinerary',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
