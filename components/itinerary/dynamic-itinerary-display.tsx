"use client"

import { useState } from "react"
import { ItineraryDisplayProps, ItineraryItem, DayPlan } from "@/lib/types/component-schemas"

function ItineraryItemCard({
    item,
    onEdit,
    onRemove,
    day
}: {
    item: ItineraryItem
    onEdit?: (itemId: string, day: number) => void
    onRemove?: (itemId: string, day: number) => void
    day: number
}) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'attraction': return '📍'
            case 'restaurant': return '🍽️'
            case 'activity': return '🎯'
            case 'accommodation': return '🏨'
            case 'transport': return '🚗'
            default: return '📌'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'attraction': return 'bg-blue-500/20 text-blue-400'
            case 'restaurant': return 'bg-orange-500/20 text-orange-400'
            case 'activity': return 'bg-green-500/20 text-green-400'
            case 'accommodation': return 'bg-purple-500/20 text-purple-400'
            case 'transport': return 'bg-gray-500/20 text-gray-400'
            default: return 'bg-white/10 text-white/80'
        }
    }

    return (
        <div className="rounded-xl bg-white/5 p-4 border border-white/10 hover:border-white/20 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <h4 className="font-semibold text-white">{item.name}</h4>
                        {onEdit && onRemove && (
                            <div className="ml-auto flex gap-1">
                                <button
                                    onClick={() => onEdit(item.id, day)}
                                    className="p-1 rounded text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => onRemove(item.id, day)}
                                    className="p-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    title="Remove"
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                        <span className={`px-2 py-1 rounded text-xs ${getTypeColor(item.type)}`}>
                            {item.type}
                        </span>
                        <span>★ {item.rating}</span>
                        <span>•</span>
                        <span>{item.estimatedCost}</span>
                    </div>
                </div>
            </div>

            {/* Time and Duration */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-400">🕐</span>
                    <span className="text-white/80">{item.startTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-400">⏱️</span>
                    <span className="text-white/80">{item.duration}</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/70 mb-3">{item.description}</p>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                <span>📍</span>
                <span>{item.location}</span>
            </div>

            {/* Highlights */}
            {item.highlights.length > 0 && (
                <div className="mb-3">
                    <p className="text-xs text-white/50 mb-1">Highlights:</p>
                    <div className="flex flex-wrap gap-1">
                        {item.highlights.map((highlight, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-yellow-400/20 text-yellow-300 rounded text-xs"
                            >
                                {highlight}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            {item.tips && (
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-xs text-green-300">💡 {item.tips}</p>
                </div>
            )}
        </div>
    )
}

function DayPlanSection({
    dayPlan,
    onEdit,
    onRemove,
    onAddSuggestion
}: {
    dayPlan: DayPlan
    onEdit?: (itemId: string, day: number) => void
    onRemove?: (itemId: string, day: number) => void
    onAddSuggestion?: (day: number) => void
}) {
    return (
        <div className="mb-8">
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4 p-4 bg-[color:var(--gumo-yellow)]/10 rounded-xl border border-[color:var(--gumo-yellow)]/20">
                <div>
                    <h3 className="text-xl font-bold text-[color:var(--gumo-yellow)]">
                        Day {dayPlan.day}
                    </h3>
                    <p className="text-sm text-white/80">{dayPlan.theme}</p>
                    <p className="text-xs text-white/60 mt-1">{dayPlan.summary}</p>
                </div>
                <div className="text-right text-sm">
                    <div className="text-white/80">{dayPlan.totalEstimatedCost}</div>
                    <div className="text-white/60">{dayPlan.walkingDistance} walking</div>
                </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[color:var(--gumo-yellow)]/30"></div>

                {dayPlan.items.map((item, idx) => (
                    <div key={item.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute left-4 w-4 h-4 bg-[color:var(--gumo-yellow)] rounded-full border-2 border-[color:var(--gumo-surface)] z-10"></div>

                        {/* Item card */}
                        <div className="ml-12">
                            <ItineraryItemCard
                                item={item}
                                onEdit={onEdit}
                                onRemove={onRemove}
                                day={dayPlan.day}
                            />

                            {/* Travel time to next item */}
                            {idx < dayPlan.items.length - 1 && (
                                <div className="flex items-center gap-2 my-3 ml-4 text-sm text-white/50">
                                    <span>🚶‍♀️</span>
                                    <span>14 min walk</span>
                                    <span>•</span>
                                    <span>1.2 km</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Day Tips */}
            {dayPlan.tips && (
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-300">💡 <strong>Day {dayPlan.day} Tips:</strong> {dayPlan.tips}</p>
                </div>
            )}

            {/* Add more button */}
            {onAddSuggestion && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => onAddSuggestion(dayPlan.day)}
                        className="px-4 py-2 bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)] rounded-xl border border-[color:var(--gumo-yellow)]/30 hover:bg-[color:var(--gumo-yellow)]/30 transition-all"
                    >
                        ➕ Add More Places
                    </button>
                </div>
            )}
        </div>
    )
}

export default function ItineraryDisplay({
    itinerary,
    onEdit,
    onRemove,
    onAddSuggestion
}: ItineraryDisplayProps) {
    const [selectedDay, setSelectedDay] = useState<number>(1)

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 p-6 bg-[color:var(--gumo-surface)] rounded-2xl border border-white/10">
                <h1 className="text-2xl font-bold text-white mb-2">{itinerary.title}</h1>
                <p className="text-white/70 mb-4">{itinerary.overview}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span className="text-white/80">{itinerary.totalDays} days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="text-white/80">{itinerary.totalBudget}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>🌤️</span>
                        <span className="text-white/80">{itinerary.bestTimeToVisit}</span>
                    </div>
                </div>

                {/* General Tips */}
                {itinerary.generalTips.length > 0 && (
                    <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-sm text-green-300 font-medium mb-2">✨ General Tips:</p>
                        <ul className="text-sm text-green-200 space-y-1">
                            {itinerary.generalTips.map((tip, idx) => (
                                <li key={idx}>• {tip}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Day Selector */}
            <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {itinerary.days.map((day) => (
                        <button
                            key={day.day}
                            onClick={() => setSelectedDay(day.day)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedDay === day.day
                                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                                    : 'bg-[color:var(--gumo-surface)] text-white/70 hover:bg-white/10'
                                }`}
                        >
                            Day {day.day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Day Content */}
            {itinerary.days
                .filter(day => day.day === selectedDay)
                .map(day => (
                    <DayPlanSection
                        key={day.day}
                        dayPlan={day}
                        onEdit={onEdit}
                        onRemove={onRemove}
                        onAddSuggestion={onAddSuggestion}
                    />
                ))}

            {/* Alternative Suggestions */}
            {itinerary.alternativeSuggestions.length > 0 && (
                <div className="mt-8 p-4 bg-[color:var(--gumo-surface)] rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-3">🔄 Alternative Suggestions</h3>
                    <div className="grid gap-3">
                        {itinerary.alternativeSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">{suggestion.name}</p>
                                        <p className="text-sm text-white/60">{suggestion.type}</p>
                                        <p className="text-xs text-white/50 mt-1">{suggestion.reason}</p>
                                    </div>
                                    <button className="px-3 py-1 bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)] rounded text-sm hover:bg-[color:var(--gumo-yellow)]/30 transition-all">
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}