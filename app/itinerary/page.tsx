"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import ItineraryDisplay from "@/components/itinerary/dynamic-itinerary-display"
import EditItineraryModal from "@/components/itinerary/edit-itinerary-modal"
import { GeneratedItinerary, ItineraryItem } from "@/lib/types/component-schemas"

export default function ItineraryPage() {
  const searchParams = useSearchParams()

  const itinerary = useMemo(() => {
    try {
      const itineraryParam = searchParams.get('itinerary')
      if (itineraryParam) {
        return JSON.parse(decodeURIComponent(itineraryParam)) as GeneratedItinerary
      }

      // Fallback for old plan format
      const planParam = searchParams.get('plan')
      if (planParam) {
        const plan = JSON.parse(decodeURIComponent(planParam)) as Array<{ city: string; days: number }>

        // Show message that this is old format and needs to be regenerated
        return null
      }

      return null
    } catch (error) {
      console.error('Failed to parse itinerary data:', error)
      return null
    }
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
    const newUrl = `/itinerary?itinerary=${encodeURIComponent(JSON.stringify(updatedItinerary))}`
    router.replace(newUrl, { scroll: false })
  }

  const getCurrentEditingItem = (): ItineraryItem | undefined => {
    if (!editingItem || !currentItinerary) return undefined

    if (editingItem.itemId === 'new') return undefined

    const day = currentItinerary.days.find(d => d.day === editingItem.day)
    return day?.items.find(item => item.id === editingItem.itemId)
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">No Itinerary Found</h1>
          <p className="text-white/70 mb-6">
            This itinerary link is invalid or expired. Please generate a new one.
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
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to Chat
          </a>
        </div>

        {/* Itinerary Display */}
        <ItineraryDisplay
          itinerary={currentItinerary || itinerary}
          onEdit={handleEdit}
          onRemove={handleRemove}
          onAddSuggestion={handleAddSuggestion}
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
