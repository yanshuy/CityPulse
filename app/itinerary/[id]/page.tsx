'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { itineraryDB, type Itinerary } from '@/lib/db/itinerary-db'
import ItineraryMapView from '@/components/itinerary/itinerary-map-view'

export default function ItineraryDetailPage() {
  const params = useParams()
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        const id = params.id as string
        if (!id) {
          setError('Invalid itinerary ID')
          return
        }

        // Try to get from IndexedDB first
        await itineraryDB.init()
        const savedItinerary = await itineraryDB.getItinerary(id)
        
        if (savedItinerary) {
          setItinerary(savedItinerary)
        } else {
          // If not found, try to parse from URL params (for external links)
          const urlParams = new URLSearchParams(window.location.search)
          const planData = urlParams.get('plan')
          
          if (planData) {
            try {
              const parsed = JSON.parse(decodeURIComponent(planData))
              // Convert URL params to itinerary format
              const tempItinerary: Itinerary = {
                id: id,
                title: `Trip to ${parsed[0]?.city || 'Unknown'}`,
                description: 'Itinerary from link',
                destinations: parsed,
                highlights: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
              setItinerary(tempItinerary)
            } catch (parseError) {
              console.error('Failed to parse plan data:', parseError)
              setError('Invalid itinerary data')
            }
          } else {
            setError('Itinerary not found')
          }
        }
      } catch (err) {
        console.error('Error loading itinerary:', err)
        setError('Failed to load itinerary')
      } finally {
        setLoading(false)
      }
    }

    loadItinerary()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Itinerary Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested itinerary could not be loaded.'}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <ItineraryMapView itinerary={itinerary} />
}