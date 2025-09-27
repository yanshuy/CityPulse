"use client"

import { TopBar } from "@/components/gumo/top-bar"
import { BottomNav } from "@/components/gumo/bottom-nav"
import { APIProvider } from "@vis.gl/react-google-maps"
import { MapComponent } from "@/components/maps/MapComponent"
import { ItineraryMapWrapper } from "@/components/maps/ItineraryMapView"
import { MapPin, Sparkles } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export default function MapsPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const searchParams = useSearchParams()
  
  // Parse itinerary data from URL params
  const itineraryData = useMemo(() => {
    const itineraryParam = searchParams.get('itinerary')
    if (itineraryParam) {
      try {
        return JSON.parse(decodeURIComponent(itineraryParam))
      } catch (error) {
        console.error('Error parsing itinerary data:', error)
        return null
      }
    }
    return null
  }, [searchParams])

  const isItineraryMode = !!itineraryData

  if (!apiKey) {
    return (
      <main className="min-h-dvh mx-auto max-w-md px-4 pb-24 pt-2 flex flex-col items-center justify-center bg-[color:var(--gumo-bg)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[color:var(--gumo-yellow)]/20 rounded-2xl flex items-center justify-center mb-6">
            <MapPin className="w-8 h-8 text-[color:var(--gumo-yellow)]" />
          </div>
          <h1 className="text-2xl font-bold text-[color:var(--gumo-text)] mb-4">Demo Mode Active</h1>
          <p className="text-[color:var(--gumo-muted)] mb-6 leading-relaxed">
            CityPulse Maps is running in demo mode with simulated city data. 
            All map layers and features are fully functional.
          </p>
          <div className="bg-[color:var(--gumo-surface)] rounded-2xl p-6 text-left">
            <p className="font-semibold mb-3 text-[color:var(--gumo-text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[color:var(--gumo-yellow)]" />
              Demo Features Available:
            </p>
            <ul className="space-y-2 text-sm text-[color:var(--gumo-muted)]">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Transport layer with real-time updates
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Live incident alerts and notifications
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Event discovery and scheduling
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Places and amenities mapping
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Mobile-first bottom drawer interface
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-[color:var(--gumo-muted)]">
                For production deployment, add your Google Maps API key to .env.local
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-2xl font-semibold hover:bg-[color:var(--gumo-yellow)]/90 transition-colors"
          >
            Continue to Demo Map
          </button>
        </div>
      </main>
    )
  }

  return (
    <APIProvider 
      apiKey={apiKey} 
      libraries={['places']}
      onLoad={() => console.log('Google Maps API loaded successfully')}
    >
      {isItineraryMode ? (
        // Itinerary Map View (full screen without navigation)
        <ItineraryMapWrapper
          city={itineraryData.city}
          days={itineraryData.days}
          destinations={itineraryData.destinations}
        />
      ) : (
        // Regular Map View with navigation
        <main className="min-h-dvh relative overflow-hidden">
          {/* Top bar overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 mx-auto max-w-md w-full px-4 pt-2">
            <TopBar />
          </div>

          {/* Full-screen map component */}
          <MapComponent />

          {/* Bottom navigation */}
          <div className="fixed inset-x-0 bottom-3 z-30">
            <div className="mx-auto max-w-md px-4">
              <BottomNav />
            </div>
          </div>
        </main>
      )}
    </APIProvider>
  )
}
