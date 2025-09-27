"use client"

import { useEffect, useState } from "react"
import { itineraryDB, type Itinerary } from "@/lib/db/itinerary-db"
import ItinerarySummaryCardV2 from "@/components/gumo/itinerary-summary-card-v2"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Calendar, Trash2, Plus } from "lucide-react"

export default function ProfilePage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadItineraries()
  }, [])

  const loadItineraries = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading itineraries from IndexedDB...')
      
      await itineraryDB.init()
      console.log('✅ IndexedDB initialized successfully')
      
      const savedItineraries = await itineraryDB.getAllItineraries()
      console.log('📝 Raw itineraries from DB:', savedItineraries)
      console.log('📊 Total itineraries found:', savedItineraries.length)
      
      if (savedItineraries.length > 0) {
        console.log('🎯 First itinerary sample:', savedItineraries[0])
      }
      
      setItineraries(savedItineraries)
    } catch (err) {
      console.error('❌ Error loading itineraries:', err)
      setError(`Failed to load itineraries: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteItinerary = async (id: string) => {
    try {
      await itineraryDB.deleteItinerary(id)
      setItineraries(prev => prev.filter(it => it.id !== id))
    } catch (err) {
      console.error('Error deleting itinerary:', err)
      setError('Failed to delete itinerary')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalDays = (destinations: Array<{ city: string; days: number }>) => {
    return destinations.reduce((total, dest) => total + dest.days, 0)
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md min-h-dvh px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-300 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md min-h-dvh">
      {/* Header */}
      <section className="px-4 pt-6 pb-5 rounded-b-[2rem] bg-[color:var(--gumo-surface)]/60">
        <div className="flex items-center gap-4">
         <div className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--gumo-yellow)] text-black text-3xl">
            ☺
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">My Travel Profile</h1>
            <p className="text-sm text-white/70">@citypulse.traveler</p>
            <p className="mt-1 text-sm">
              <span className="font-medium">{mounted ? itineraries.length : 0}</span> Saved Itineraries
            </p>
          </div>
        </div>

        <p className="mt-4 text-white/80">
          Your personalized travel plans and itineraries, all in one place.
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-2xl bg-black/20 text-center py-3">
          <div>
            <div className="text-2xl font-semibold">{mounted ? itineraries.length : 0}</div>
            <div className="text-xs text-white/70">Total Trips</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">
              {mounted ? itineraries.reduce((acc, it) => acc + getTotalDays(it.destinations), 0) : 0}
            </div>
            <div className="text-xs text-white/70">Total Days</div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[color:var(--gumo-text)]">Your Itineraries</h2>
          <button
            onClick={() => window.location.href = '/'}
            className="p-2 rounded-lg bg-[color:var(--gumo-yellow)] text-black hover:bg-[color:var(--gumo-yellow)]/90 transition-colors"
            title="Create new itinerary"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadItineraries}
              className="mt-2 text-xs text-red-300 hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {itineraries.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[color:var(--gumo-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[color:var(--gumo-muted)]" />
            </div>
            <h3 className="text-lg font-medium text-[color:var(--gumo-text)] mb-2">No Itineraries Yet</h3>
            <p className="text-sm text-[color:var(--gumo-muted)] mb-6">
              Start a conversation to create your first travel itinerary
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--gumo-yellow)] text-black rounded-lg font-medium hover:bg-[color:var(--gumo-yellow)]/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Itinerary
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {itineraries.map((itinerary) => (
              <div key={itinerary.id} className="relative group">
                <ItinerarySummaryCardV2
                  title={itinerary.title}
                  blurb={itinerary.description}
                  bullets={itinerary.highlights}
                  href={`/itinerary?id=${itinerary.id}&readOnly=true`}
                  imageSrc={itinerary.imageSrc}
                />

                {/* Itinerary metadata */}
                <div className="mt-3 flex items-center justify-between text-xs text-[color:var(--gumo-muted)]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(itinerary.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{getTotalDays(itinerary.destinations)} days</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      if (confirm('Are you sure you want to delete this itinerary?')) {
                        deleteItinerary(itinerary.id)
                      }
                    }}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete itinerary"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add some bottom padding for mobile navigation */}
      <div className="h-20" />
    </main>
  )
}