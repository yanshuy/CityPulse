"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import ItineraryDisplay from "@/components/itinerary/dynamic-itinerary-display"
import EditItineraryModal from "@/components/itinerary/edit-itinerary-modal"
import { GeneratedItinerary, ItineraryItem } from "@/lib/types/component-schemas"
import { getItinerary, saveItinerary } from "@/lib/itinerary-storage"
import { itineraryDB, type Itinerary } from "@/lib/db/itinerary-db"
import { convertStoredItineraryToGenerated } from '@/lib/itinerary/normalize'

// Conversion moved to shared util `convertStoredItineraryToGenerated`.

export default function ItineraryPage() {
  const searchParams = useSearchParams()
  const readOnly = searchParams.get('readOnly') === 'true'

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true)
        const itineraryId = searchParams.get('id')

        if (itineraryId) {
          // First try the new itinerary system (itineraryDB)
          try {
            await itineraryDB.init()
            const newItinerary = await itineraryDB.getItinerary(itineraryId)
            if (newItinerary) {
              console.log('🔍 Raw itinerary from new system:', newItinerary);
              console.log('🔍 Raw itinerary destinations:', newItinerary.destinations);
              console.log('🔍 Raw itinerary chatData:', newItinerary.chatData);
              const generatedItinerary = convertStoredItineraryToGenerated(newItinerary)
              console.log('🔄 Converted itinerary:', generatedItinerary);
              console.log('📅 Converted Days array:', generatedItinerary.days);
              console.log('🔢 Days array type:', typeof generatedItinerary.days);
              console.log('🔢 Days array length:', generatedItinerary.days?.length);
              setItinerary(generatedItinerary)
              return
            }
          } catch (newSystemError) {
            console.log('New system failed, trying old system:', newSystemError)
          }

          // Fallback to old itinerary system
          const oldItineraryData = await getItinerary(itineraryId)
          if (oldItineraryData) {
            setItinerary(oldItineraryData)
            return
          }
          
          setError('Itinerary not found in either storage system')
        } else {
          // Fallback: check for old URL format
          const itineraryParam = searchParams.get('itinerary')
          if (itineraryParam) {
            try {
              const decoded = JSON.parse(decodeURIComponent(itineraryParam)) as GeneratedItinerary
              setItinerary(decoded)
              // Optionally save to storage for future use
              saveItinerary(decoded)
            } catch (parseError) {
              setError('Invalid itinerary data')
            }
          } else {
            setError('No itinerary ID provided')
          }
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err)
        setError(err instanceof Error ? err.message : 'Failed to load itinerary')
      } finally {
        setLoading(false)
      }
    }

    loadItinerary()
  }, [searchParams])

  const router = useRouter()
  const [editingItem, setEditingItem] = useState<{ itemId: string; day: number } | null>(null)
  const [currentItinerary, setCurrentItinerary] = useState<GeneratedItinerary | null>(itinerary)

  const handleEdit = (itemId: string, day: number) => {
    setEditingItem({ itemId, day })
  }

  const handleRemove = (itemId: string, day: number) => {
    if (!currentItinerary) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === day) {
          return {
            ...dayPlan,
            items: dayPlan.items.filter(item => item.id !== itemId)
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
  }

  const handleAddSuggestion = (day: number) => {
    setEditingItem({ itemId: 'new', day })
  }

  const handleSaveItem = (updatedItem: ItineraryItem) => {
    if (!currentItinerary || !editingItem) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === editingItem.day) {
          return {
            ...dayPlan,
            items: dayPlan.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
    setEditingItem(null)
  }

  const handleReplaceItem = (newItem: ItineraryItem, oldItemId: string) => {
    if (!currentItinerary || !editingItem) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === editingItem.day) {
          if (oldItemId === 'new') {
            // Adding new item
            return {
              ...dayPlan,
              items: [...dayPlan.items, newItem]
            }
          } else {
            // Replacing existing item
            return {
              ...dayPlan,
              items: dayPlan.items.map(item =>
                item.id === oldItemId ? newItem : item
              )
            }
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
    setEditingItem(null)
  }

  const updateUrlWithItinerary = (updatedItinerary: GeneratedItinerary) => {
    // Save updated itinerary to storage
    const itineraryId = saveItinerary(updatedItinerary)
    const newUrl = `/itinerary?id=${itineraryId}`
    router.replace(newUrl, { scroll: false })
  }

  const getCurrentEditingItem = (): ItineraryItem | undefined => {
    if (!editingItem || !currentItinerary) return undefined

    if (editingItem.itemId === 'new') return undefined

    const day = currentItinerary.days.find(d => d.day === editingItem.day)
    return day?.items.find(item => item.id === editingItem.itemId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gumo-yellow)] mb-4"></div>
          <p className="text-white/70">Loading your itinerary...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Itinerary Not Found</h1>
          <p className="text-white/70 mb-6">
            {error || 'This itinerary link is invalid or expired. Please generate a new one.'}
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-medium hover:brightness-110 transition-all"
          >
            Generate New Itinerary
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[color:var(--gumo-bg)] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a
            href={readOnly ? "/profile" : "/"}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to {readOnly ? "Profile" : "Chat"}
          </a>
        </div>

        {/* Itinerary Display */}
        {/* Actions Row */}
        {(currentItinerary || itinerary)?.days?.length > 0 && (
          <div className="mb-4 flex justify-end gap-2">
            <a
              href={`/itinerary/map?id=${(currentItinerary || itinerary).id}`}
              className="px-4 py-2 rounded-lg bg-[color:var(--gumo-yellow)] text-black text-sm font-medium hover:brightness-110 transition-colors"
            >
              Map View
            </a>
          </div>
        )}

        <ItineraryDisplay
          itinerary={currentItinerary || itinerary}
          onEdit={readOnly ? undefined : handleEdit}
          onRemove={readOnly ? undefined : handleRemove}
          onAddSuggestion={readOnly ? undefined : handleAddSuggestion}
          readOnly={readOnly}
        />

        {/* Edit Modal */}
        <EditItineraryModal
          isOpen={!!editingItem}
          item={getCurrentEditingItem()}
          day={editingItem?.day || 1}
          destination={(currentItinerary || itinerary)?.destination || 'Mumbai'}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
          onReplace={handleReplaceItem}
        />
      </div>
    </div>
  )
}