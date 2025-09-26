"use client"

type ExploreData = {
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

type Place = { id: string; title: string; image: string; caption?: string }

const PLACES: Place[] = [
    { id: 'p1', title: 'Sunset Point', image: '/beach-sunset.jpg', caption: 'Great for evenings' },
    { id: 'p2', title: 'Forest Trail', image: '/hiker-on-trail.jpg', caption: 'Easy 2km hike' },
    { id: 'p3', title: 'City Museum', image: '/bangkok-museum-photo.jpg', caption: 'Open till 6pm' },
]

interface ExploreGridProps {
    data?: ExploreData
    heading?: string // Legacy prop for backward compatibility
}

export default function ExploreGrid({ data, heading }: ExploreGridProps) {
    const displayHeading = data?.heading || heading || 'Explore ideas nearby'
    const placesToShow = data?.places || PLACES.map(place => ({
        name: place.title,
        type: 'tourist_attraction' as const,
        rating: 4.5,
        location: 'Nearby',
        description: place.caption || 'Worth visiting',
        highlights: ['Great views', 'Photo opportunities'],
        bestTimeToVisit: place.caption || 'Anytime',
        entryFee: 'Free',
        estimatedDuration: '1-2 hours',
        image: place.image
    }))

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'historical': return '🏛️'
            case 'nature': return '🌿'
            case 'entertainment': return '🎪'
            case 'shopping': return '🛒'
            case 'cultural': return '🎭'
            case 'religious': return '🕉️'
            case 'modern': return '🏙️'
            default: return '📍'
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">{displayHeading}</h3>
                {data?.totalFound && (
                    <span className="text-xs text-white/60">{data.totalFound} places</span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {placesToShow.slice(0, 4).map((place, index) => (
                    <div key={`place-${index}`} className="overflow-hidden rounded-xl bg-white/5">
                        <div className="aspect-[4/3] w-full overflow-hidden">
                            <img
                                src={place.image || '/placeholder.jpg'}
                                alt={place.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs">{getTypeIcon(place.type)}</span>
                                        <div className="text-xs font-medium truncate">{place.name}</div>
                                    </div>
                                    <div className="text-[10px] text-white/60 mt-1">
                                        ⭐ {place.rating} • {place.entryFee}
                                    </div>
                                    <div className="text-[10px] text-white/70 mt-1 truncate">
                                        {place.bestTimeToVisit}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {data?.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/70">{data.suggestion}</p>
                </div>
            )}
        </div>
    )
}
