"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { 
  ArrowLeft, MapPin, Star, Clock, ChevronLeft, ChevronRight, 
  ArrowRight, Navigation, Share2, Download
} from "lucide-react"
import Image from "next/image"

// Types for itinerary data
interface ItineraryDestination {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  rating: number
  duration: string
  time: string
  image: string
  notes: string[]
  distanceFromPrevious?: number
  travelTimeFromPrevious?: number
  reviewCount: number
}

interface ItineraryDay {
  date: string
  destinations: ItineraryDestination[]
}

interface ItineraryMapData {
  city: string
  days: number
  itineraryDays: ItineraryDay[]
}

interface ItineraryMapViewProps {
  data: ItineraryMapData
  onBack?: () => void
}

// Mock itinerary data based on the UI reference
const generateMockItineraryData = (city: string, totalDays: number): ItineraryMapData => {
  const baseDate = new Date('2025-10-01')
  
  // Mock destinations for different cities
  const cityDestinations: Record<string, any[]> = {
    'Manali': [
      {
        id: '1',
        title: 'Hadimba Devi Temple',
        description: 'Ancient cave temple dedicated to Hidimbi Devi',
        latitude: 32.2396,
        longitude: 77.1887,
        rating: 4.5,
        duration: '2 hr 30 min',
        time: '9:20 AM',
        image: '/himachal-pradesh-mountains.jpg',
        notes: ['Photography allowed, but don\'t touch the exhibits', 'Located near the famous Hadimba Temple'],
        distanceFromPrevious: 0,
        travelTimeFromPrevious: 0,
        reviewCount: 1263
      },
      {
        id: '2', 
        title: 'Museum of Himachal Culture & Folk Art',
        description: 'Rich collection of Himachali artifacts and traditional art',
        latitude: 32.2430,
        longitude: 77.1892,
        rating: 4.1,
        duration: '3 hr 5 min',
        time: '12:30 PM',
        image: '/himachal-pradesh-mountains.jpg',
        notes: ['Entry ticket is 30 INR', 'Photography allowed, but don\'t touch the exhibits'],
        distanceFromPrevious: 1.2,
        travelTimeFromPrevious: 15,
        reviewCount: 1105
      },
      {
        id: '3',
        title: 'Mall Road Manali', 
        description: 'Main shopping and dining street of Manali',
        latitude: 32.2432,
        longitude: 77.1892,
        rating: 4.3,
        duration: '2 hr 15 min',
        time: '4:00 PM',
        image: '/himachal-pradesh-mountains.jpg',
        notes: ['Great for shopping local handicrafts', 'Try local Himachali food'],
        distanceFromPrevious: 0.8,
        travelTimeFromPrevious: 10,
        reviewCount: 892
      }
    ],
    'Mumbai': [
      {
        id: '1',
        title: 'Gateway of India',
        description: 'Iconic monument overlooking Mumbai Harbor',
        latitude: 18.9220,
        longitude: 72.8347,
        rating: 4.4,
        duration: '1 hr 30 min',
        time: '9:00 AM',
        image: '/sea-facing-villa-in-goa.jpg',
        notes: ['Best time for photos is early morning', 'Watch out for crowds on weekends'],
        distanceFromPrevious: 0,
        travelTimeFromPrevious: 0,
        reviewCount: 2451
      },
      {
        id: '2',
        title: 'Taj Palace Hotel',
        description: 'Historic luxury hotel with colonial architecture', 
        latitude: 18.9216,
        longitude: 72.8333,
        rating: 4.7,
        duration: '1 hr',
        time: '11:00 AM', 
        image: '/sea-facing-villa-in-goa.jpg',
        notes: ['High tea available', 'Heritage walk tours'],
        distanceFromPrevious: 0.2,
        travelTimeFromPrevious: 5,
        reviewCount: 1847
      },
      {
        id: '3',
        title: 'Marine Drive',
        description: 'Queen\'s Necklace - curved seafront promenade',
        latitude: 18.9444,
        longitude: 72.8232,
        rating: 4.5,
        duration: '2 hr',
        time: '6:00 PM',
        image: '/sea-facing-villa-in-goa.jpg', 
        notes: ['Perfect for sunset views', 'Street food available'],
        distanceFromPrevious: 2.8,
        travelTimeFromPrevious: 25,
        reviewCount: 3204
      }
    ]
  }

  const destinations = cityDestinations[city] || cityDestinations['Mumbai']
  
  const itineraryDays: ItineraryDay[] = []
  
  for (let day = 0; day < totalDays; day++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + day)
    
    const dayDestinations = destinations.map((dest, index) => ({
      ...dest,
      id: `day${day + 1}-${dest.id}`,
      // Vary times slightly per day
      time: day === 0 ? dest.time : 
            index === 0 ? '9:30 AM' :
            index === 1 ? '1:00 PM' : '4:30 PM'
    }))
    
    itineraryDays.push({
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: '2-digit' 
      }),
      destinations: dayDestinations
    })
  }

  return {
    city,
    days: totalDays,
    itineraryDays
  }
}

export const ItineraryMapView: React.FC<ItineraryMapViewProps> = ({ data, onBack }) => {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0)
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  
  const map = useMap()

  const currentDay = data.itineraryDays[selectedDay]
  const currentDestination = currentDay?.destinations[selectedDestinationIndex]

  // Calculate map center based on current day's destinations
  const mapCenter = useMemo(() => {
    if (!currentDay?.destinations.length) {
      return { lat: 32.2396, lng: 77.1887 } // Default to Manali
    }
    
    const destinations = currentDay.destinations
    const avgLat = destinations.reduce((sum, dest) => sum + dest.latitude, 0) / destinations.length
    const avgLng = destinations.reduce((sum, dest) => sum + dest.longitude, 0) / destinations.length
    
    return { lat: avgLat, lng: avgLng }
  }, [currentDay])

  // Handle swipe navigation for destination cards
  const handleNextDestination = useCallback(() => {
    if (currentDay && selectedDestinationIndex < currentDay.destinations.length - 1) {
      setSelectedDestinationIndex(selectedDestinationIndex + 1)
    }
  }, [currentDay, selectedDestinationIndex])

  const handlePreviousDestination = useCallback(() => {
    if (selectedDestinationIndex > 0) {
      setSelectedDestinationIndex(selectedDestinationIndex - 1)
    }
  }, [selectedDestinationIndex])

  // Handle day selection
  const handleDaySelect = useCallback((dayIndex: number) => {
    setSelectedDay(dayIndex)
    setSelectedDestinationIndex(0) // Reset to first destination when changing days
  }, [])

  // Handle destination marker click
  const handleDestinationClick = useCallback((destinationIndex: number) => {
    setSelectedDestinationIndex(destinationIndex)
    setShowInfoWindow(true)
  }, [])

  // Generate path between destinations for the current day and create polyline
  useEffect(() => {
    if (!map || !currentDay) return

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
    }

    // Create new polyline for current day's route
    const path = currentDay.destinations.map(dest => 
      new google.maps.LatLng(dest.latitude, dest.longitude)
    )

    const polyline = new google.maps.Polyline({
      path: path,
      strokeColor: "#F1C40F",
      strokeWeight: 4,
      strokeOpacity: 0.8,
      map: map
    })

    polylineRef.current = polyline

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }
    }
  }, [map, currentDay])

  // Generate path between destinations for the current day
  const generateRoutePath = useCallback(() => {
    if (!currentDay) return []
    
    const path: google.maps.LatLng[] = []
    currentDay.destinations.forEach(dest => {
      path.push(new google.maps.LatLng(dest.latitude, dest.longitude))
    })
    return path
  }, [currentDay])

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[color:var(--gumo-bg)]">
      {/* Map */}
      <Map
        mapId="itinerary-map"
        defaultZoom={13}
        center={mapCenter}
        gestureHandling="greedy"
        disableDefaultUI={true}
        className="h-full w-full"
        colorScheme="LIGHT"
      >
        {/* Destination markers */}
        {currentDay?.destinations.map((destination, index) => (
          <AdvancedMarker
            key={destination.id}
            position={{ lat: destination.latitude, lng: destination.longitude }}
            clickable={true}
            onClick={() => handleDestinationClick(index)}
          >
            <div 
              className={`flex flex-col items-center cursor-pointer transform transition-all duration-200 ${
                index === selectedDestinationIndex ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-black font-bold border-2 border-white shadow-lg ${
                  index === selectedDestinationIndex ? 'bg-[color:var(--gumo-yellow)]' : 'bg-white'
                }`}
              >
                {index + 1}
              </div>
              {index === selectedDestinationIndex && (
                <div className="w-2 h-2 rotate-45 -mt-1 bg-[color:var(--gumo-yellow)]" />
              )}
            </div>
          </AdvancedMarker>
        ))}

        {/* Info window for selected destination */}
        {showInfoWindow && currentDestination && (
          <InfoWindow
            position={{ lat: currentDestination.latitude, lng: currentDestination.longitude }}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-semibold text-sm mb-1">{currentDestination.title}</h3>
              <p className="text-xs text-gray-600 mb-2">{currentDestination.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{currentDestination.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{currentDestination.duration}</span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Trip to {data.city} (v1)</h1>
              <p className="text-sm text-gray-600">OLD {data.city.toUpperCase()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-xs">
              List Overview
            </button>
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-xs flex items-center gap-1">
              <Download className="w-3 h-3" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Day selector tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto">
            {data.itineraryDays.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDaySelect(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedDay === index
                    ? 'bg-[color:var(--gumo-yellow)] text-black'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day.date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom drawer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-black text-white rounded-t-3xl">
        {/* Drawer handle */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-4"></div>

        {/* Current destination info */}
        {currentDestination && (
          <div className="px-4 pb-4">
            {/* Travel info to current destination */}
            <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
              <div className="flex items-center gap-4">
                <span>{selectedDestinationIndex + 1}</span>
                <div className="flex items-center gap-1">
                  <span>{currentDestination.distanceFromPrevious?.toFixed(1) || '0.0'} km</span>
                </div>
                <div className="flex items-center gap-1">  
                  <span>{currentDestination.travelTimeFromPrevious || '1'} min</span>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handlePreviousDestination}
                disabled={selectedDestinationIndex === 0}
                className={`p-2 rounded-full transition-colors ${
                  selectedDestinationIndex === 0 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2">
                {currentDay?.destinations.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedDestinationIndex ? 'bg-[color:var(--gumo-yellow)]' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button 
                onClick={handleNextDestination}
                disabled={!currentDay || selectedDestinationIndex === currentDay.destinations.length - 1}
                className={`p-2 rounded-full transition-colors ${
                  !currentDay || selectedDestinationIndex === currentDay.destinations.length - 1
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-white hover:bg-gray-800'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Time and duration */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span>{currentDestination.time}</span>
              <span>•</span>
              <span>Duration {currentDestination.duration}</span>
              <button className="ml-auto">
                <MapPin className="w-4 h-4" />
              </button>
            </div>

            {/* Destination card */}
            <div className="bg-gray-900 rounded-2xl p-4 mb-4">
              <div className="flex gap-3">
                <Image
                  src={currentDestination.image}
                  alt={currentDestination.title}
                  width={80}
                  height={80}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg mb-1">{currentDestination.title}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">
                      {currentDestination.rating} ({currentDestination.reviewCount} ratings)
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{currentDestination.description}</p>
                </div>
              </div>

              {/* Notes */}
              {currentDestination.notes && currentDestination.notes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {currentDestination.notes.map((note, index) => (
                    <span
                      key={index}
                      className="text-xs bg-yellow-400/20 text-yellow-200 px-2 py-1 rounded-full border border-yellow-400/30"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="flex-1 bg-[color:var(--gumo-yellow)] text-black py-3 px-4 rounded-2xl font-medium flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                Open Day 1 in Google Maps
              </button>
              <button className="bg-green-500 text-white p-3 rounded-2xl">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Wrapper component for integration
interface ItineraryMapWrapperProps {
  city: string
  days: number
  destinations?: Array<{ city: string; days: number }>
}

export const ItineraryMapWrapper: React.FC<ItineraryMapWrapperProps> = ({ 
  city, 
  days, 
  destinations = [] 
}) => {
  const itineraryData = useMemo(() => 
    generateMockItineraryData(city, days), 
    [city, days]
  )

  const handleBack = useCallback(() => {
    window.history.back()
  }, [])

  return <ItineraryMapView data={itineraryData} onBack={handleBack} />
}