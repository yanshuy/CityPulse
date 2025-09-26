"use client"

import { useState, useEffect } from "react"
import { ItineraryItem } from "@/lib/types/component-schemas"

interface PlaceSuggestion {
    id: string
    name: string
    type: 'attraction' | 'restaurant' | 'activity' | 'accommodation' | 'transport'
    description: string
    location: string
    estimatedDuration: string
    estimatedCost: string
    rating: number
    highlights: string[]
    bestTime: string
    reason: string
    coordinates?: {
        lat: number
        lng: number
    }
}

interface GooglePlace {
    id: string
    name: string
    address: string
    rating: number
    priceLevel?: number
    types: string[]
    location: {
        lat: number
        lng: number
    }
    photoReference?: string
    businessStatus?: string
}

interface EditItineraryModalProps {
    isOpen: boolean
    item?: ItineraryItem
    day: number
    destination: string
    onClose: () => void
    onSave: (updatedItem: ItineraryItem) => void
    onReplace: (newItem: ItineraryItem, oldItemId: string) => void
}

export default function EditItineraryModal({
    isOpen,
    item,
    day,
    destination,
    onClose,
    onSave,
    onReplace
}: EditItineraryModalProps) {
    const [activeTab, setActiveTab] = useState<'edit' | 'ai-suggestions' | 'search'>('edit')
    const [aiSuggestions, setAiSuggestions] = useState<PlaceSuggestion[]>([])
    const [googlePlaces, setGooglePlaces] = useState<GooglePlace[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)

    // Editable item state
    const [editedItem, setEditedItem] = useState<ItineraryItem | null>(null)

    useEffect(() => {
        if (item) {
            setEditedItem({ ...item })
        }
    }, [item])

    const fetchAISuggestions = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/ai-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination,
                    day,
                    currentItems: [item], // Pass current item for context
                    preferences: 'balanced mix', // TODO: Get from user preferences
                    timeSlot: item?.startTime,
                    replacingItem: item
                })
            })

            const result = await response.json()
            if (result.success) {
                setAiSuggestions(result.data.suggestions)
            }
        } catch (error) {
            console.error('Failed to fetch AI suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    const searchGooglePlaces = async (query: string) => {
        setLoading(true)
        try {
            const response = await fetch('/api/maps/places', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    location: destination,
                    type: item?.type === 'restaurant' ? 'restaurant' : 'tourist_attraction'
                })
            })

            const result = await response.json()
            if (result.success) {
                setGooglePlaces(result.suggestions)
            }
        } catch (error) {
            console.error('Failed to search places:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        if (searchQuery.trim()) {
            searchGooglePlaces(searchQuery.trim())
        }
    }

    const convertAISuggestionToItem = (suggestion: PlaceSuggestion): ItineraryItem => ({
        id: `day${day}-${suggestion.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: suggestion.name,
        type: suggestion.type,
        description: suggestion.description,
        location: suggestion.location,
        address: suggestion.location, // Use location as address for AI suggestions
        startTime: item?.startTime || '10:00 AM',
        duration: suggestion.estimatedDuration,
        estimatedCost: suggestion.estimatedCost,
        rating: suggestion.rating,
        highlights: suggestion.highlights,
        tips: suggestion.reason,
        coordinates: suggestion.coordinates
    })

    const convertGooglePlaceToItem = (place: GooglePlace): ItineraryItem => ({
        id: `day${day}-${place.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: place.name,
        type: place.types.includes('restaurant') ? 'restaurant' : 'attraction',
        description: `Popular ${place.types[0]?.replace(/_/g, ' ')} in ${destination}`,
        location: place.address.split(',')[0], // First part of address
        address: place.address,
        startTime: item?.startTime || '10:00 AM',
        duration: '1.5 hours', // Default duration
        estimatedCost: place.priceLevel ? `₹${500 * place.priceLevel}-${1000 * place.priceLevel}` : '₹500-1000',
        rating: place.rating || 4.0,
        highlights: ['Popular destination', 'Highly rated'],
        coordinates: place.location
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[color:var(--gumo-surface)] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">
                            {item ? `Edit: ${item.name}` : 'Add New Place'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white text-2xl"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'edit'
                                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            ✏️ Edit Details
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('ai-suggestions')
                                if (aiSuggestions.length === 0) fetchAISuggestions()
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'ai-suggestions'
                                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            🤖 AI Suggestions
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'search'
                                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            🔍 Search Places
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Edit Tab */}
                    {activeTab === 'edit' && editedItem && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editedItem.name}
                                    onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editedItem.description}
                                    onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                                    rows={3}
                                    className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="text"
                                        value={editedItem.startTime}
                                        onChange={(e) => setEditedItem({ ...editedItem, startTime: e.target.value })}
                                        placeholder="e.g., 10:30 AM"
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={editedItem.duration}
                                        onChange={(e) => setEditedItem({ ...editedItem, duration: e.target.value })}
                                        placeholder="e.g., 2 hours"
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => editedItem && onSave(editedItem)}
                                    className="px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-medium hover:brightness-110 transition-all"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* AI Suggestions Tab */}
                    {activeTab === 'ai-suggestions' && (
                        <div>
                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gumo-yellow)]"></div>
                                    <p className="text-white/60 mt-2">Getting AI suggestions...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {aiSuggestions.map((suggestion, idx) => (
                                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-white">{suggestion.name}</h3>
                                                    <p className="text-sm text-white/60">{suggestion.location} • {suggestion.type}</p>
                                                </div>
                                                <div className="text-right text-sm text-white/60">
                                                    <div>★ {suggestion.rating}</div>
                                                    <div>{suggestion.estimatedCost}</div>
                                                </div>
                                            </div>

                                            <p className="text-sm text-white/70 mb-3">{suggestion.description}</p>

                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {suggestion.highlights.map((highlight, i) => (
                                                        <span key={i} className="px-2 py-1 bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)] rounded text-xs">
                                                            {highlight}
                                                        </span>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const newItem = convertAISuggestionToItem(suggestion)
                                                        if (item) {
                                                            onReplace(newItem, item.id)
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-[color:var(--gumo-yellow)] text-black rounded-xl text-sm font-medium hover:brightness-110 transition-all"
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div>
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search for restaurants, attractions..."
                                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    Search
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gumo-yellow)]"></div>
                                    <p className="text-white/60 mt-2">Searching places...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {googlePlaces.map((place) => (
                                        <div key={place.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-white">{place.name}</h3>
                                                    <p className="text-sm text-white/60">{place.address}</p>
                                                </div>
                                                <div className="text-right text-sm text-white/60">
                                                    <div>★ {place.rating}</div>
                                                    <div>{place.types[0]?.replace(/_/g, ' ')}</div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-2">
                                                    {place.types.slice(0, 2).map((type, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                            {type.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        const newItem = convertGooglePlaceToItem(place)
                                                        if (item) {
                                                            onReplace(newItem, item.id)
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-[color:var(--gumo-yellow)] text-black rounded-xl text-sm font-medium hover:brightness-110 transition-all"
                                                >
                                                    Replace
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}