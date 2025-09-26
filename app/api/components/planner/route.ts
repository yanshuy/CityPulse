import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'nodejs'

const PlannerDataSchema = z.object({
    destination: z.string(),
    days: z.number().min(1).max(30),
    suggestedTitle: z.string(),
    description: z.string(),
    highlights: z.array(z.string()).max(3),
    bestTimeToVisit: z.string(),
    estimatedBudget: z.string(),
    suggestedActivities: z.array(z.object({
        day: z.number(),
        activity: z.string(),
        location: z.string(),
        duration: z.string(),
    })).max(5),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 })
        }

        const { object } = await generateObject({
            model: google('gemini-1.5-flash-latest'),
            schema: PlannerDataSchema,
            prompt: `
        Extract detailed itinerary planning information from this query: "${query}"
        
        Generate comprehensive trip planning data including:
        - destination: The place to visit (extract or suggest popular destination)
        - days: Number of days (if not specified, suggest 3-5 days based on destination)
        - suggestedTitle: Catchy, engaging trip title
        - description: Brief, exciting description of the trip experience
        - highlights: 3 key attractions/activities that make this trip special
        - bestTimeToVisit: Best season/months to visit with weather info
        - estimatedBudget: Realistic budget range in Indian Rupees (e.g., "₹15,000 - ₹25,000")
        - suggestedActivities: 3-5 specific activities with day, location, and duration
        
        Make it relevant to Indian travelers and include realistic local information.
        If query is vague, suggest Mumbai as default destination.
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Planner data generation error:', error)
        return Response.json({ success: false, error: 'Failed to generate planner data' }, { status: 500 })
    }
}