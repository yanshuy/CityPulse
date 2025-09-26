"use client"

import { ExploreGridProps } from "@/lib/types/component-schemas"

export default function ExploreGrid({ data }: ExploreGridProps) {
    const displayHeading = data.heading
    const placesToShow = data.places

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
                <span className="text-xs text-white/60">{data.totalFound} places</span>
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

            {data.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/70">{data.suggestion}</p>
                </div>
            )}
        </div>
    )
}
