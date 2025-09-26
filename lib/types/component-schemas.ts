// Shared TypeScript interfaces for AI-generated component data
// These interfaces should match the Zod schemas in the API routes

export interface EventsData {
    heading: string
    location: string
    timeframe: string
    events: Array<{
        title: string
        date: string
        time: string
        venue: string
        category: 'music' | 'arts' | 'food' | 'sports' | 'tech' | 'cultural' | 'entertainment' | 'business'
        price: string
        description: string
        image?: string
    }>
    totalFound: number
    suggestion: string
}

export interface FoodData {
    heading: string
    location: string
    cuisine?: string
    restaurants: Array<{
        name: string
        cuisine: string
        rating: number
        priceRange: string
        location: string
        specialty: string
        description: string
        estimatedCost: string
        timings: string
        image?: string
    }>
    totalFound: number
    suggestion: string
}

export interface TrafficData {
    route: string
    fromLocation: string
    toLocation: string
    currentStatus: 'light' | 'moderate' | 'heavy' | 'severe'
    estimatedTime: string
    estimatedDelay: string
    alternativeRoutes: Array<{
        name: string
        estimatedTime: string
        description: string
    }>
    incidents: Array<{
        type: string
        location: string
        impact: string
        severity: 'low' | 'medium' | 'high'
    }>
    suggestion: string
    lastUpdated: string
}

export interface ExploreData {
    heading: string
    location: string
    category?: string
    places: Array<{
        name: string
        type: 'tourist_attraction' | 'historical' | 'nature' | 'entertainment' | 'shopping' | 'cultural' | 'religious' | 'modern'
        rating: number
        location: string
        description: string
        highlights: string[]
        bestTimeToVisit: string
        entryFee: string
        estimatedDuration: string
        image?: string
    }>
    totalFound: number
    suggestion: string
}

export interface PlannerData {
    destination: string
    days: number
    suggestedTitle: string
    description: string
    highlights: string[]
    bestTimeToVisit: string
    estimatedBudget: string
    suggestedActivities: Array<{
        day: number
        activity: string
        location: string
        duration: string
    }>
}

// Union type for all component data types
export type ComponentData = EventsData | FoodData | TrafficData | ExploreData | PlannerData

// Props interfaces for components
export interface EventsListProps {
    data: EventsData
}

export interface FoodListProps {
    data: FoodData
}

export interface TrafficInsightsProps {
    data: TrafficData
}

export interface ExploreGridProps {
    data: ExploreData
}

export interface PlannerFormProps {
    data: PlannerData
}

// Detailed Itinerary Types
export interface ItineraryItem {
    id: string
    name: string
    type: 'attraction' | 'restaurant' | 'activity' | 'accommodation' | 'transport'
    description: string
    location: string
    address: string
    startTime: string
    duration: string
    estimatedCost: string
    rating: number
    highlights: string[]
    tips?: string
    coordinates?: {
        lat: number
        lng: number
    }
    image?: string
}

export interface DayPlan {
    day: number
    date: string
    theme: string
    summary: string
    items: ItineraryItem[]
    totalEstimatedCost: string
    walkingDistance: string
    tips: string
}

export interface GeneratedItinerary {
    id: string
    title: string
    destination: string
    totalDays: number
    overview: string
    bestTimeToVisit: string
    totalBudget: string
    days: DayPlan[]
    generalTips: string[]
    alternativeSuggestions: Array<{
        name: string
        type: string
        reason: string
    }>
}

export interface ItineraryDisplayProps {
    itinerary: GeneratedItinerary
    onEdit?: (itemId: string, day: number) => void
    onRemove?: (itemId: string, day: number) => void
    onAddSuggestion?: (day: number) => void
}