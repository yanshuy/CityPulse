import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { withRetry } from '@/lib/utils'

export const runtime = 'nodejs'

const EventsDataSchema = z.object({
    heading: z.string(),
    location: z.string(),
    timeframe: z.string(),
    events: z.array(z.object({
        title: z.string(),
        date: z.string(),
        time: z.string(),
        venue: z.string(),
        category: z.enum(['music', 'arts', 'food', 'sports', 'tech', 'cultural', 'entertainment', 'business']),
        price: z.string(),
        description: z.string(),
        image: z.string().optional(),
    })).max(6),
    totalFound: z.number(),
    suggestion: z.string(),
})

const VIN_URL = "https://live-merely-drum.ngrok-free.app"
export async function POST(req: Request) {
    try {
        const { query } = await req.json()
        let res = await fetch(`${VIN_URL}/reddit?Body=${query}`)

        //     const { object } = await generateObject({
        //         model: google('gemini-2.0-flash'),
        //         schema: EventsDataSchema,
        //         prompt: `
        //     Generate realistic local events information for this query: "${query}"

        //     Create engaging events data including:
        //     - heading: Descriptive heading for events section (e.g., "Events This Weekend in Mumbai")
        //     - location: City/area for events (extract from query or default to Mumbai)
        //     - timeframe: When these events are happening (e.g., "This Weekend", "Next Week")
        //     - events: 4-6 realistic events with:
        //       * title: Engaging event name
        //       * date: Specific date (e.g., "Dec 15, 2024")  
        //       * time: Event time (e.g., "7:00 PM - 10:00 PM")
        //       * venue: Realistic Mumbai venues (Phoenix Mills, NCPA, etc.)
        //       * category: Type of event
        //       * price: Realistic pricing in Indian Rupees (₹500, Free, ₹1,200, etc.)
        //       * description: Brief, engaging event description
        //       * image: Optional placeholder image path
        //     - totalFound: Total number of events available
        //     - suggestion: Helpful suggestion for user

        //     Make events realistic for Indian cities with:
        //     - Popular venues: Phoenix Mills, Palladium Mall, NCPA, Hard Rock Cafe, etc.
        //     - Indian context: Bollywood nights, cultural festivals, food festivals
        //     - Realistic pricing for Indian audience
        //     - Mix of free and paid events
        //   `,
        //     })

        let d = await res.json()
        if (!res.ok) {
            throw new Error(`Fetch failed with status ${res.status} - ${await res.text()}`)
        }
        return Response.json({ success: true, data: d })
    } catch (error) {
        console.error('Events data generation error:', error)
        return Response.json({ success: false, error: 'Failed to generate events data' }, { status: 500 })
    }
}
