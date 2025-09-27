import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { withRetry } from "@/lib/utils"

export const runtime = "nodejs"

const GoalSchema = z.object({
  title: z.string(),
  destination: z.string().optional(),
  time: z.string().optional(), // "09:00" or best target time
  days: z.array(z.string()).optional(), // ["Mon","Tue",...]
  method: z.string().optional(),
  reason: z.string().optional(),
})

const GoalsResponseSchema = z.object({
  primary: GoalSchema.optional(),
  goals: z.array(GoalSchema).min(1).max(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { preferences } = body as {
      preferences: {
        home?: string
        work?: string
        workHours?: { start?: string; end?: string }
        transport?: string
        interests?: string[]
        schedulePoints?: string[]
      }
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({ success: false, error: "API key not configured" }, { status: 500 })
    }

    const scheduleText =
      preferences?.schedulePoints?.map((s: string) => `- ${s}`).join("\n") ||
      "No explicit schedule points. Infer from interests and common patterns."

    const interestsText = preferences?.interests?.length ? preferences.interests.join(", ") : "general city exploration"

    const home = preferences?.home || "Home"
    const work = preferences?.work || "Work"
    const start = preferences?.workHours?.start || "09:00"
    const transport = preferences?.transport || "Metro"

    const { object } = await withRetry(
      async () => {
        return await generateObject({
          model: google("gemini-2.0-flash"),
          schema: GoalsResponseSchema,
          prompt: `
You are CityPulse's assistant. The user provided their routine and interests. Convert them into 2-6 concise, actionable "goals" for daily living (commute, fitness, leisure, errands).
- Use user's words from SCHEDULE POINTS.
- Respect WORK HOURS, TRANSPORT, and INTERESTS.
- Normalize times to 24h "HH:MM" when helpful.
- Keep goals short and clear. Include a primary goal for "now" given a typical day.

DATA
HOME: ${home}
WORK: ${work}
WORK START: ${start}
TRANSPORT: ${transport}
INTERESTS: ${interestsText}

SCHEDULE POINTS:
${scheduleText}

OUTPUT RULES
- goals[].title: short, user-facing (e.g., "Get to Work", "Saturday Evening Football", "Sunday House Work", "Sunday Movie & Shopping")
- goals[].destination: optional (e.g., "${work}", "Local Park", "Mall")
- goals[].time: if applicable, best single target (e.g., "${start}", "18:00", "10:00")
- goals[].days: if applicable, list like ["Mon","Tue","Wed","Thu","Fri"] or ["Sat"] or ["Sun"]
- goals[].method: optional transport/mode (e.g., "${transport}", "Walk")
- goals[].reason: brief rationale connecting schedule/interests.

Select "primary" as what the user most likely should focus on next on a typical day.
          `,
        })
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000
      }
    )

    return Response.json({ success: true, data: object })
  } catch (error) {
    console.error("AI goals evaluation error:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to evaluate goals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
