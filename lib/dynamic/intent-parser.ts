export type ItineraryIntent = {
  query: string
  locations: { city: string }[]
  days?: number
  includeHotels?: boolean
}

const titleCase = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())

/**
 * Very naive parser that extracts:
 * - days: "3 day", "3 days"
 * - location: phrases after "to", "in", or "for" (keeps first token set)
 * Examples:
 *  "plan a 3 day itinerary to mumbai" -> days=3, location=Mumbai
 */
export function parseItineraryIntent(query: string): ItineraryIntent {
  const q = query.trim()
  let days: number | undefined
  const daysMatch = q.match(/(\d+)\s*(?:day|days)\b/i)
  if (daysMatch) days = Number(daysMatch[1])

  // Extract location heuristically
  // Prefer "...to X", then "...in X"
  let city: string | undefined
  const toMatch = q.match(/\bto\s+([a-zA-Z][a-zA-Z\s-]+)/i)
  const inMatch = q.match(/\bin\s+([a-zA-Z][a-zA-Z\s-]+)/i)
  const forMatch = q.match(/\bfor\s+([a-zA-Z][a-zA-Z\s-]+)/i)
  const rawLoc = toMatch?.[1] || inMatch?.[1] || forMatch?.[1]
  if (rawLoc) {
    // stop at "for|with|and|from|on|next|this|week|month"
    city = titleCase(rawLoc.replace(/\b(for|with|and|from|on|next|this|week|month|days?)\b.*$/i, "")).trim()
  }

  return {
    query: q,
    locations: city ? [{ city }] : [],
    days,
    includeHotels: undefined,
  }
}

/**
 * Build URLSearchParams for /planner route using partial slots
 */
export function buildPlannerParams(intent: ItineraryIntent) {
  const sp = new URLSearchParams()
  if (intent.query) sp.set("q", intent.query)
  if (intent.days) sp.set("days", String(intent.days))
  if (intent.locations.length) sp.set("loc", intent.locations.map((l) => l.city).join(","))
  if (typeof intent.includeHotels === "boolean") sp.set("includeHotels", intent.includeHotels ? "1" : "0")
  return sp
}
