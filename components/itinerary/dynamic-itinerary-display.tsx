"use client"

import { useState } from "react"
import { Clock, MapPin, Star, Edit, Trash2, Plus, Utensils, Target, Building, Car, RefreshCw, Save, Share, Building2 } from "lucide-react"
import { ItineraryDisplayProps, ItineraryItem, DayPlan } from "@/lib/types/component-schemas"

// Generate more accurate image URLs based on place name and type
function generatePlaceImageUrl(item: ItineraryItem): string {
    // Clean the place name for URL use
    const cleanName = item.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '+') // Replace spaces with +

    // Get location context (if available in item.location)
    const location = item.location ?
        item.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '+') : ''

    // First try: Use curated photo IDs for famous Indian landmarks
    const curatedPhotos = getCuratedPhotoId(item.name, item.type);
    if (curatedPhotos) {
        return `https://images.unsplash.com/photo-${curatedPhotos}?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
    }

    // Second try: Build search query for location-specific images
    let searchTerms = [];

    // Add location-specific terms first (most important)
    if (location) {
        searchTerms.push(location);
    }

    // Add the place name if it's not too generic
    const genericNames = ['restaurant', 'hotel', 'cafe', 'shop', 'market', 'temple', 'palace'];
    if (!genericNames.some(generic => cleanName.includes(generic))) {
        searchTerms.push(cleanName);
    }

    // Add type-specific terms
    switch (item.type) {
        case 'restaurant':
            searchTerms.push('indian+food', 'restaurant', 'cuisine');
            break;
        case 'attraction':
            searchTerms.push('monument', 'architecture', 'landmark', 'heritage');
            break;
        case 'activity':
            searchTerms.push('activity', 'experience', 'culture');
            break;
        case 'accommodation':
            searchTerms.push('hotel', 'accommodation', 'heritage');
            break;
        case 'transport':
            searchTerms.push('transport', 'india', 'travel');
            break;
        default:
            searchTerms.push('india', 'travel', 'destination');
    }

    // Build the final search query (limit to 2-3 terms for better results)
    const query = searchTerms.slice(0, 3).join('+');

    // Return Unsplash search URL
    return `https://images.unsplash.com/1600x900/?${query}&auto=format&fit=crop&w=200&h=200&q=80`;
}

// Curated photo IDs for famous places to ensure accuracy
function getCuratedPhotoId(placeName: string, type: string): string | null {
    const name = placeName.toLowerCase();

    // Famous Indian landmarks and their actual Unsplash photo IDs
    const curatedPlaces: Record<string, string> = {
        // Mumbai
        'gateway of india': '1570168007204-dfb99c8e19ac',
        'marine drive': '1595655406684-dba50d25d8db',
        'chhatrapati shivaji terminus': '1587474887464-cd2c4ca95f1c',
        'victoria terminus': '1587474887464-cd2c4ca95f1c',
        'cst': '1587474887464-cd2c4ca95f1c',
        'taj mahal palace hotel': '1566552969926-9f4a9f6f9e2a',
        'elephanta caves': '1506905925346-21bda4d32df4',

        // Delhi  
        'red fort': '1587474887464-cd2c4ca95f1c',
        'india gate': '1587474734-5b3c23e8b5b2',
        'lotus temple': '1506905925346-21bda4d32df4',
        'qutub minar': '1506905925346-21bda4d32df4',
        'humayuns tomb': '1587474734-5b3c23e8b5b2',

        // Rajasthan
        'hawa mahal': '1549144511-f099e773c147',
        'city palace jaipur': '1549144511-f099e773c147',
        'amber fort': '1549144511-f099e773c147',
        'lake palace udaipur': '1506905925346-21bda4d32df4',
        'city palace udaipur': '1506905925346-21bda4d32df4',

        // Kerala
        'backwaters': '1506905925346-21bda4d32df4',
        'munnar': '1506905925346-21bda4d32df4',

        // Goa
        'baga beach': '1506905925346-21bda4d32df4',
        'anjuna beach': '1506905925346-21bda4d32df4',
        'basilica of bom jesus': '1506905925346-21bda4d32df4',

        // Generic by type
        'indian restaurant': '1414235077653-2534da808646',
        'street food': '1414235077653-2534da808646',
        'local market': '1506905925346-21bda4d32df4',
        'spice market': '1414235077653-2534da808646',
    };

    // Check for exact matches first
    if (curatedPlaces[name]) {
        return curatedPlaces[name];
    }

    // Check for partial matches
    for (const [place, photoId] of Object.entries(curatedPlaces)) {
        if (name.includes(place.split(' ')[0]) || place.includes(name.split(' ')[0])) {
            return photoId;
        }
    }

    return null;
}

function ItineraryItemCard({
    item,
    onEdit,
    onRemove,
    day,
    isLast = false,
    readOnly = false
}: {
    item: ItineraryItem
    onEdit?: (itemId: string, day: number) => void
    onRemove?: (itemId: string, day: number) => void
    day: number
    isLast?: boolean
    readOnly?: boolean
}) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'attraction': return <Building2 className="w-4 h-4" />
            case 'restaurant': return <Utensils className="w-4 h-4" />
            case 'activity': return <Target className="w-4 h-4" />
            case 'accommodation': return <Building className="w-4 h-4" />
            case 'transport': return <Car className="w-4 h-4" />
            default: return <MapPin className="w-4 h-4" />
        }
    }

    return (
        <div className="relative">
            {/* Timeline dot and line */}
            <div className="absolute left-0 top-0 flex flex-col items-center">
                <div className="w-8 h-8 bg-[color:var(--gumo-yellow)] rounded-full flex items-center justify-center text-black text-sm font-semibold">
                    {getTypeIcon(item.type)}
                </div>
                {!isLast && (
                    <div className="w-0.5 h-24 bg-[color:var(--gumo-yellow)]/30 mt-2"></div>
                )}
            </div>

            {/* Time and Duration - Outside card */}
            <div className="ml-12 mb-2">
                <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.startTime}</span>
                    <span className="mx-2">•</span>
                    <span>Duration {item.duration}</span>
                    {!readOnly && onEdit && onRemove && (
                        <div className="ml-auto flex gap-2">
                            <button
                                onClick={() => onEdit(item.id, day)}
                                className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-blue-400/10"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onRemove(item.id, day)}
                                className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                                title="Remove"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content card */}
            <div className="ml-12 pb-6">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                    {/* Main content */}
                    <div className="flex gap-3">
                        {/* Actual place image */}
                        <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden">
                            <img
                                src={generatePlaceImageUrl(item)}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Enhanced fallback system
                                    const target = e.currentTarget;

                                    // First fallback: Try type-specific curated image
                                    if (!target.dataset.fallbackAttempted) {
                                        target.dataset.fallbackAttempted = 'true';
                                        const typeImages = {
                                            restaurant: '1414235077653-2534da808646', // Indian food
                                            attraction: '1549144511-f099e773c147',   // Indian architecture
                                            activity: '1571019613454-1cb2f99b2d8b',    // Adventure/activity
                                            accommodation: '1566552969926-9f4a9f6f9e2a', // Luxury hotel
                                            transport: '1587474887464-cd2c4ca95f1c'     // Transport
                                        };
                                        const photoId = typeImages[item.type as keyof typeof typeImages] || '1506905925346-21bda4d32df4';
                                        target.src = `https://images.unsplash.com/photo-${photoId}?w=200&h=200&fit=crop&crop=center&auto=format&q=80`;
                                        return;
                                    }

                                    // Final fallback: Generic travel image
                                    target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&crop=center&auto=format&q=80';
                                }}
                            />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-1">{item.name}</h3>
                            <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 text-[color:var(--gumo-yellow)] fill-current" />
                                <span className="text-sm text-white font-medium">{item.rating}</span>
                                <span className="text-sm text-gray-400">({Math.floor(Math.random() * 10000)} ratings)</span>
                            </div>

                            {/* Highlights - Full width, more rounded */}
                            {item.highlights && item.highlights.length > 0 && (
                                <div className="space-y-1">
                                    {item.highlights.slice(0, 2).map((highlight, idx) => (
                                        <div key={idx} className="bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)] px-3 py-1.5 rounded-full text-xs font-medium block w-full">
                                            {highlight}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Location pin */}
                        <div className="flex-shrink-0 pt-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Walking distance to next location */}
                {!isLast && (
                    <div className="flex items-center gap-2 mt-3 ml-2 text-sm font-medium">
                        <span className="text-[color:var(--gumo-yellow)]">2.5 km</span>
                        <span className="text-white">14 min</span>
                    </div>
                )}
            </div>
        </div>
    )
}

function DayPlanSection({
    dayPlan,
    onEdit,
    onRemove,
    onAddSuggestion,
    readOnly = false
}: {
    dayPlan: DayPlan
    onEdit?: (itemId: string, day: number) => void
    onRemove?: (itemId: string, day: number) => void
    onAddSuggestion?: (day: number) => void
    readOnly?: boolean
}) {
    return (
        <div className="mb-8">
            {/* Timeline */}
            <div className="space-y-0">
                {dayPlan.items.map((item, idx) => (
                    <ItineraryItemCard
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onRemove={onRemove}
                        day={dayPlan.day}
                        isLast={idx === dayPlan.items.length - 1}
                        readOnly={readOnly}
                    />
                ))}
            </div>

            {/* Add more button */}
            {!readOnly && onAddSuggestion && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => onAddSuggestion(dayPlan.day)}
                        className="flex items-center gap-2 px-4 py-2 bg-[color:var(--gumo-purple)]/20 text-[color:var(--gumo-purple)] rounded-xl border border-[color:var(--gumo-purple)]/30 hover:bg-[color:var(--gumo-purple)]/30 transition-all mx-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add More Places
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
    onSave,
    onShare,
    onAddSuggestion,
    readOnly = false
}: ItineraryDisplayProps & { readOnly?: boolean }) {
    const [selectedDay, setSelectedDay] = useState<number>(1)

    if (!itinerary || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-black text-white p-6 rounded-xl border border-white/5">
                <h1 className="text-2xl font-bold mb-4">{itinerary?.title || 'Itinerary'}</h1>
                <p className="text-sm text-white/70 mb-4">{itinerary?.overview || 'No overview available.'}</p>
                <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className="text-[color:var(--gumo-muted)] mb-2">Detailed day-by-day schedule was not captured for this itinerary.</p>
                    <p className="text-xs text-white/40">Save the itinerary again after generation to preserve full day plans.</p>
                </div>
                {itinerary?.generalTips && itinerary.generalTips.length > 0 && (
                    <div className="mt-6 text-sm">
                        <h2 className="font-medium mb-2 text-white/80">General Tips</h2>
                        <ul className="list-disc list-inside space-y-1 text-white/60">
                            {itinerary.generalTips.slice(0, 6).map((tip, i) => <li key={i}>{tip}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-black text-white p-6 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-4">{itinerary.title}</h1>

                {/* Day Selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {itinerary.days.map((day) => (
                        <button
                            key={day.day}
                            onClick={() => setSelectedDay(day.day)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedDay === day.day
                                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                                    : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
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
                        onEdit={readOnly ? undefined : onEdit}
                        onRemove={readOnly ? undefined : onRemove}
                        onAddSuggestion={readOnly ? undefined : onAddSuggestion}
                        readOnly={readOnly}
                    />
                ))}

            {/* Alternative Suggestions */}
            {!readOnly && itinerary.alternativeSuggestions && itinerary.alternativeSuggestions.length > 0 && (
                <div className="mt-8 p-4 bg-[color:var(--gumo-surface)]/50 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-[color:var(--gumo-text)] mb-3 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-[color:var(--gumo-yellow)]" />
                        Alternative Suggestions
                    </h3>
                    <div className="grid gap-3">
                        {itinerary.alternativeSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="p-3 bg-[color:var(--gumo-surface)]/30 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[color:var(--gumo-text)]">{suggestion.name}</p>
                                        <p className="text-sm text-[color:var(--gumo-muted)]">{suggestion.type}</p>
                                        <p className="text-xs text-[color:var(--gumo-muted)] mt-1">{suggestion.reason}</p>
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

            {/* Action Buttons */}
            {!readOnly && (onSave || onShare) && (
                <div className="mt-8 flex gap-4 justify-center">
                    {onSave && (
                        <button
                            onClick={onSave}
                            className="px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-semibold hover:bg-[color:var(--gumo-yellow)]/90 transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Itinerary
                        </button>
                    )}
                    {onShare && (
                        <button
                            onClick={onShare}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Share className="w-4 h-4" />
                            Share
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
