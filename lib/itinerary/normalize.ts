import { Itinerary } from '@/lib/db/itinerary-db'
import { GeneratedItinerary } from '@/lib/types/component-schemas'

/**
 * Convert stored DB itinerary (or legacy shape) into a GeneratedItinerary used by display & map layers.
 * Mirrors the robust search logic previously inline in `app/itinerary/page.tsx`.
 */
export function convertStoredItineraryToGenerated(itinerary: Itinerary): GeneratedItinerary {
  // 1. Direct pass-through if chatData is already a GeneratedItinerary with days
  if (itinerary.chatData && itinerary.chatData.id && Array.isArray(itinerary.chatData.days) && itinerary.chatData.days.length > 0 && itinerary.chatData.days[0].items) {
    return itinerary.chatData as GeneratedItinerary
  }

  // 2. Deep search any nested array that looks like days
  if (itinerary.chatData) {
    const searchForDaysArray = (obj: any): any[] | null => {
      if (Array.isArray(obj) && obj.length > 0 && obj[0] && obj[0].day && obj[0].items) {
        return obj
      }
      if (obj && typeof obj === 'object') {
        for (const value of Object.values(obj)) {
          const res = searchForDaysArray(value)
          if (res) return res
        }
      }
      return null
    }
    const found = searchForDaysArray(itinerary.chatData)
    if (found) {
      return {
        id: itinerary.id,
        title: itinerary.title,
        destination: itinerary.chatData.destination || itinerary.destinations[0]?.city || 'Unknown',
        totalDays: found.length,
        overview: itinerary.description,
        bestTimeToVisit: itinerary.chatData.bestTimeToVisit || 'Year-round',
        totalBudget: itinerary.chatData.totalBudget || '—',
        days: found,
        generalTips: itinerary.chatData.generalTips || itinerary.highlights || [],
        alternativeSuggestions: itinerary.chatData.alternativeSuggestions || []
      }
    }
  }

  // 3. Empty baseline (no synthetic fallback day)
  return {
    id: itinerary.id,
    title: itinerary.title,
    destination: itinerary.destinations[0]?.city || 'Unknown',
    totalDays: 0,
    overview: itinerary.description,
    bestTimeToVisit: itinerary.chatData?.bestTimeToVisit || '—',
    totalBudget: itinerary.chatData?.totalBudget || '—',
    days: [],
    generalTips: itinerary.highlights || [],
    alternativeSuggestions: []
  }
}

/** Attempt to normalize any arbitrary object (DB itinerary, GeneratedItinerary, legacy). */
export function normalizeAnyItinerary(anyData: any): GeneratedItinerary | null {
  if (!anyData) return null
  if (anyData.days && Array.isArray(anyData.days) && anyData.days[0]?.items) {
    return anyData as GeneratedItinerary
  }
  if (anyData.destinations && anyData.id) {
    // Might be stored itinerary
    return convertStoredItineraryToGenerated(anyData as Itinerary)
  }
  if (anyData.chatData && (anyData.chatData.days || anyData.chatData.destinations)) {
    return convertStoredItineraryToGenerated(anyData as Itinerary)
  }
  return null
}
