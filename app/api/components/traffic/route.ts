import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils'

export const runtime = 'nodejs'

const TrafficDataSchema = z.object({
    route: z.string(),
    fromLocation: z.string(),
    toLocation: z.string(),
    currentStatus: z.enum(['light', 'moderate', 'heavy', 'severe']),
    estimatedTime: z.string(),
    estimatedDelay: z.string(),
    alternativeRoutes: z.array(z.object({
        name: z.string(),
        estimatedTime: z.string(),
        description: z.string(),
    })).max(2),
    incidents: z.array(z.object({
        type: z.string(),
        location: z.string(),
        impact: z.string(),
        severity: z.enum(['low', 'medium', 'high']),
    })).max(3),
    suggestion: z.string(),
    lastUpdated: z.string(),
})

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: TrafficDataSchema,
            prompt: `
        Generate realistic traffic information for this query: "${query}"
        
        Extract or infer:
        - route: Main route description (e.g., "Andheri to Mumbai Airport")
        - fromLocation: Starting point (extract or suggest realistic Mumbai location)
        - toLocation: Destination (extract or suggest realistic Mumbai destination)
        - currentStatus: Current traffic condition level
        - estimatedTime: Normal travel time (e.g., "45 minutes")
        - estimatedDelay: Additional delay due to traffic (e.g., "15-20 minutes extra")
        - alternativeRoutes: 1-2 alternative routes with time estimates
        - incidents: Current incidents affecting traffic (construction, accidents, etc.)
        - suggestion: Best recommendation for the user
        - lastUpdated: Current time in "X minutes ago" format
        
        Make it realistic for Mumbai traffic conditions with:
        - Peak hours: 8-11 AM, 6-9 PM (heavier traffic)
        - Common routes: Andheri-Airport, Bandra-Nariman Point, etc.
        - Typical delays: 20-40% extra time during peak hours
        - Indian context: mentions of flyovers, metro, local trains
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('Traffic data generation error:', error)
        return Response.json({ success: false, error: 'Failed to generate traffic data' }, { status: 500 })
    }
}
