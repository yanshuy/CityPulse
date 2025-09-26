'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Calendar, MapPin, Clock, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
import { type Itinerary } from '@/lib/db/itinerary-db'
import { Swipeable } from '@/components/ui/swipeable'

interface DayPlan {
  day: number
  date: string
  destinations: Array<{
    name: string
    location: string
    duration: string
    description?: string
    coordinates?: { lat: number; lng: number }
  }>
}

interface ItineraryMapViewProps {
  itinerary: Itinerary
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Sample itinerary data structure - in production this would come from the itinerary prop
const generateSampleItinerary = (itinerary: Itinerary): DayPlan[] => {
  const days: DayPlan[] = []
  const startDate = new Date()
  
  itinerary.destinations.forEach((dest, destIndex) => {
    for (let dayNum = 1; dayNum <= dest.days; dayNum++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + days.length)
      
      days.push({
        day: days.length + 1,
        date: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        destinations: [
          {
            name: `Museum of ${dest.city} Culture`,
            location: `${dest.city} City Center`,
            duration: '3 hr 5 min',
            description: 'Explore the rich cultural heritage',
            coordinates: { 
              lat: 28.6139 + (destIndex * 0.1), 
              lng: 77.2090 + (destIndex * 0.1) 
            }
          },
          {
            name: `${dest.city} Historic Temple`,
            location: `Old ${dest.city}`,
            duration: '2 hr 30 min',
            description: 'Visit the ancient temple complex',
            coordinates: { 
              lat: 28.6239 + (destIndex * 0.1), 
              lng: 77.2190 + (destIndex * 0.1) 
            }
          },
          {
            name: `Local Market ${dest.city}`,
            location: `${dest.city} Bazaar`,
            duration: '1 hr 45 min',
            description: 'Shop for local crafts and souvenirs',
            coordinates: { 
              lat: 28.6339 + (destIndex * 0.1), 
              lng: 77.2290 + (destIndex * 0.1) 
            }
          }
        ]
      })
    }
  })
  
  return days
}

export default function ItineraryMapView({ itinerary }: ItineraryMapViewProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedDestination, setSelectedDestination] = useState(0)
  const [dayPlans] = useState<DayPlan[]>(() => generateSampleItinerary(itinerary))
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

  const currentDayPlan = dayPlans[selectedDay]
  const currentDestination = currentDayPlan?.destinations[selectedDestination]

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 13,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      googleMapRef.current = map
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#FACC15',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
      directionsRendererRef.current.setMap(map)
      
      setIsMapLoaded(true)
    }

    if (window.google?.maps) {
      initMap()
    } else {
      // Load Google Maps API if not already loaded
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`
      script.async = true
      script.onload = initMap
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  // Update markers when day or destination changes
  useEffect(() => {
    if (!googleMapRef.current || !currentDayPlan) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers for current day
    currentDayPlan.destinations.forEach((destination, index) => {
      const marker = new google.maps.Marker({
        position: destination.coordinates || { lat: 28.6139, lng: 77.2090 },
        map: googleMapRef.current!,
        title: destination.name,
        icon: {
          url: index === selectedDestination 
            ? 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#FACC15"/>
                <circle cx="16" cy="16" r="8" fill="#000"/>
                <text x="16" y="20" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${index + 1}</text>
              </svg>
            `)
            : 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#6B7280"/>
                <circle cx="16" cy="16" r="8" fill="#374151"/>
                <text x="16" y="20" text-anchor="middle" font-size="10" fill="white" font-weight="bold">${index + 1}</text>
              </svg>
            `),
          scaledSize: new google.maps.Size(32, 32)
        }
      })

      marker.addListener('click', () => {
        setSelectedDestination(index)
      })

      markersRef.current.push(marker)
    })

    // Center map on current destination
    if (currentDestination?.coordinates) {
      googleMapRef.current.setCenter(currentDestination.coordinates)
    }
  }, [currentDayPlan, selectedDestination, isMapLoaded])

  // Calculate and display route for current day
  const calculateDayRoute = useCallback(() => {
    if (!googleMapRef.current || !directionsRendererRef.current || !currentDayPlan?.destinations.length) return

    const directionsService = new google.maps.DirectionsService()
    const destinations = currentDayPlan.destinations

    if (destinations.length < 2) return

    const waypoints = destinations.slice(1, -1).map(dest => ({
      location: dest.coordinates || { lat: 28.6139, lng: 77.2090 },
      stopover: true
    }))

    directionsService.route({
      origin: destinations[0].coordinates || { lat: 28.6139, lng: 77.2090 },
      destination: destinations[destinations.length - 1].coordinates || { lat: 28.6139, lng: 77.2090 },
      waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    }, (result, status) => {
      if (status === 'OK' && result) {
        directionsRendererRef.current!.setDirections(result)
      } else {
        console.error('Error calculating route:', status)
      }
    })
  }, [currentDayPlan, isMapLoaded])

  useEffect(() => {
    if (isMapLoaded) {
      calculateDayRoute()
    }
  }, [calculateDayRoute, selectedDay])

  const handlePrevDestination = () => {
    if (selectedDestination > 0) {
      setSelectedDestination(selectedDestination - 1)
    }
  }

  const handleNextDestination = () => {
    if (selectedDestination < currentDayPlan.destinations.length - 1) {
      setSelectedDestination(selectedDestination + 1)
    }
  }

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex)
    setSelectedDestination(0) // Reset to first destination of the day
  }

  if (!isMapLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">{itinerary.title}</h1>
              <p className="text-sm text-gray-600">{itinerary.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              List View
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg">
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Date badges */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {dayPlans.map((dayPlan, index) => (
            <button
              key={index}
              onClick={() => handleDaySelect(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDay === index
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dayPlan.date}
            </button>
          ))}
        </div>
      </div>

      {/* Map and drawer container */}
      <div className="flex-1 relative">
        {/* Google Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {/* Bottom drawer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-3xl">
          {/* Drawer handle */}
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>
          
          {currentDestination && (
            <div className="px-4 pb-6">
              {/* Destination counter and navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {selectedDestination + 1} of {currentDayPlan.destinations.length}
                  </span>
                  <div className="flex gap-1">
                    {currentDayPlan.destinations.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === selectedDestination ? 'bg-yellow-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDestination}
                    disabled={selectedDestination === 0}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextDestination}
                    disabled={selectedDestination === currentDayPlan.destinations.length - 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Destination card */}
              <Swipeable
                onSwipeLeft={handleNextDestination}
                onSwipeRight={handlePrevDestination}
                threshold={80}
              >
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{currentDestination.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{currentDestination.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{currentDestination.duration}</span>
                        </div>
                      </div>
                      {currentDestination.description && (
                        <p className="text-sm text-gray-700">{currentDestination.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-4">
                    <button 
                      className="flex-1 bg-yellow-400 text-black font-medium py-3 px-4 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        const coords = currentDestination.coordinates
                        if (coords) {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`
                          window.open(url, '_blank')
                        }
                      }}
                    >
                      <Navigation className="w-4 h-4" />
                      Open in Google Maps
                    </button>
                    <button 
                      className="flex-1 bg-green-500 text-white font-medium py-3 px-4 rounded-xl hover:bg-green-600 transition-colors"
                      onClick={() => {
                        const message = `Check out this amazing place: ${currentDestination.name} at ${currentDestination.location}`
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank')
                      }}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </Swipeable>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}