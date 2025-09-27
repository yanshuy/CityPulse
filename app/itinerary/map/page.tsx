"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { itineraryDB } from '@/lib/db/itinerary-db'
import { getItinerary as getLegacy } from '@/lib/itinerary-storage'
import { GeneratedItinerary } from '@/lib/types/component-schemas'
import { APIProvider } from '@vis.gl/react-google-maps'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { normalizeAnyItinerary } from '@/lib/itinerary/normalize'
import { ItineraryMapCanvas } from '@/components/itinerary/itinerary-map-canvas'

// normalization moved to util

export default function ItineraryMapPage() {
  const params = useSearchParams()
  const router = useRouter()
  const id = params.get('id')
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [day, setDay] = useState(1)

  useEffect(() => {
    const load = async () => {
      if (!id) { setLoading(false); return }
      try {
        await itineraryDB.init()
        const dbItin = await itineraryDB.getItinerary(id)
        let gen = normalizeAnyItinerary(dbItin?.chatData ? { ...dbItin.chatData, id: dbItin.id } : dbItin)
        if (!gen) {
          const legacy = await getLegacy(id)
          gen = normalizeAnyItinerary(legacy)
        }
        if (gen) {
          setItinerary(gen)
          // default to first day present if not 1
          if (gen.days.length > 0) setDay(gen.days[0].day)
        }
      } finally { setLoading(false) }
    }
    load()
  }, [id])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--gumo-bg)] text-white">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading Map...
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[color:var(--gumo-bg)] text-white p-6">
        <p>No itinerary data with map-capable coordinates.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-[color:var(--gumo-yellow)] text-black rounded-lg">Back</button>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[color:var(--gumo-bg)]">
      <APIProvider apiKey={apiKey} libraries={['places']}>
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={() => router.back()} className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{itinerary.title}</h1>
            <p className="text-xs text-white/60">Day {day} / {itinerary.totalDays}</p>
          </div>
        </div>
        <ItineraryMapCanvas itinerary={itinerary} day={day} onSelectDay={setDay} />
      </APIProvider>
    </div>
  )
}
