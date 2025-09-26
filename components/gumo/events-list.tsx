"use client"

import { EventsListProps } from "@/lib/types/component-schemas"

export default function EventsList({ data }: EventsListProps) {
    const displayHeading = data.heading
    const eventsToShow = data.events

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'music': return '🎵'
            case 'arts': return '🎨'
            case 'food': return '🍽️'
            case 'sports': return '⚽'
            case 'tech': return '💻'
            case 'cultural': return '🎭'
            case 'business': return '💼'
            default: return '🎉'
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{displayHeading}</h3>
                <span className="text-xs text-white/60">{data.totalFound} total</span>
            </div>

            <ul className="mt-3 space-y-3">
                {eventsToShow.slice(0, 4).map((event, index) => (
                    <li key={`event-${index}`} className="rounded-xl bg-white/5 p-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span>{getCategoryIcon(event.category)}</span>
                                    <div className="text-sm font-medium">{event.title}</div>
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                    {event.date} {event.time && `• ${event.time}`} • {event.venue}
                                </div>
                                {event.description && (
                                    <div className="text-xs text-white/70 mt-1">{event.description}</div>
                                )}
                            </div>
                            <div className="text-xs text-white/80 ml-2">{event.price}</div>
                        </div>
                    </li>
                ))}
            </ul>

            {data.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/70">{data.suggestion}</p>
                </div>
            )}
        </div>
    )
}
