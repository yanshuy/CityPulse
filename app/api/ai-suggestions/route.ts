import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'nodejs'

const SuggestionSchema = z.object({
    suggestions: z.array(z.object({
        name: z.string(),
        type: z.enum(['attraction', 'restaurant', 'activity', 'accommodation', 'transport']),
        description: z.string(),
        location: z.string(),
        estimatedDuration: z.string(),
        estimatedCost: z.string(),
        rating: z.number().min(3.5).max(5),
        highlights: z.array(z.string()).max(2),
        bestTime: z.string(),
        reason: z.string(),
        coordinates: z.object({
            lat: z.number(),
            lng: z.number()
        }).optional()
    })).max(5)
})

export async function POST(req: Request) {
    try {
        const {
            destination,
            day,
            currentItems,
            preferences,
            timeSlot,
            replacingItem
        } = await req.json()

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return Response.json({ success: false, error: 'API key not configured' }, { status: 500 })
        }

        const currentItemsText = currentItems?.map((item: any) => `- ${item.name} (${item.type})`).join('\n') || 'None'
        const replacingText = replacingItem ? `\n\nREPLACING: ${replacingItem.name} (${replacingItem.type}) - ${replacingItem.description}` : ''

        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: SuggestionSchema,
            prompt: `
        Generate 3-5 alternative place suggestions for Day ${day} of an itinerary in ${destination}.
        
        TIME SLOT: ${timeSlot || 'Any time'}
        USER PREFERENCES: ${preferences || 'Balanced mix of culture, food, and sightseeing'}
        
        CURRENT DAY ITEMS:
        ${currentItemsText}
        ${replacingText}
        
        Generate diverse suggestions that:
        1. Complement existing items (avoid duplicates)
        2. Are appropriate for the time slot
        3. Match user preferences
        4. Are realistically located in ${destination}
        5. Provide good variety (different types if possible)
        
        For each suggestion include:
        - name: Real place name in ${destination}
        - type: Category (attraction, restaurant, activity, etc.)
        - description: What makes this place special (2-3 sentences)
        - location: Specific area/neighborhood in ${destination}
        - estimatedDuration: How long to spend there
        - estimatedCost: Realistic cost in Indian Rupees
        - rating: Realistic rating (3.5-5.0)
        - highlights: 1-2 key features
        - bestTime: Best time to visit this place
        - reason: Why this fits the user's preferences (1 sentence)
        - coordinates: Approximate lat/lng for ${destination}
        
        Make suggestions authentic and specific to ${destination}, considering:
        - Local culture and attractions
        - Realistic travel times
        - Popular areas and neighborhoods
        - Indian context and pricing
      `,
        })

        return Response.json({ success: true, data: object })
    } catch (error) {
        console.error('AI suggestions generation error:', error)
        return Response.json({
            success: false,
            error: 'Failed to generate suggestions',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
