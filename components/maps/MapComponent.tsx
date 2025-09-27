"use client"

import React, { useCallback, useEffect, useState, useMemo, useRef } from "react"
import { Map, useApiIsLoaded, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { 
  Search, X, ChevronUp, ChevronDown, Navigation, MapPin, ArrowLeft, 
  Car, Star, Clock, ArrowRight, Layers, AlertTriangle, Calendar,
  Zap, Coffee, Bus, Construction, Music, MapPinIcon, Users, Wifi,
  Bike, Train, PersonStanding, ChevronLeft, ChevronRight, Share2
} from "lucide-react"
import GetUserLocation from "@/components/maps/GetUserLocation"
import { ResizableDrawer } from "@/components/ui/resizable-drawer"
import { itineraryDB, Itinerary, ItineraryPlace } from "@/lib/db/itinerary-db"
import ItinerarySummaryCardV2 from "@/components/gumo/itinerary-summary-card-v2"

// Demo data for different map layers
export interface CityLocation {
  id: string | number
  name: string
  latitude: number
  longitude: number
  type: 'restaurant' | 'attraction' | 'transport' | 'shopping' | 'hospital' | 'event' | 'incident' | 'other'
  category?: string
  description?: string
  rating?: number
  distance?: string
  time?: string
  address?: string
  imageUrl?: string
  severity?: 'low' | 'medium' | 'high'
  source?: string
  timestamp?: string
  confidence?: number
  startTime?: string
  endTime?: string
  status?: 'active' | 'resolved' | 'scheduled'
}

// Multi-layered demo data representing different map layers
const DEMO_DATA = {
  // Transport & Infrastructure Layer
  transport: [
    {
      id: "transport-1",
      name: "Bandra Station",
      latitude: 19.0544,
      longitude: 72.8406,
      type: 'transport' as const,
      category: 'railway',
      description: "Major railway station on Western Line",
      rating: 4.1,
      distance: "0.8 km",
      time: "3 mins",
      address: "Bandra West, Mumbai",
      status: 'active' as const
    },
    {
      id: "transport-2", 
      name: "Bus Stop - Linking Road",
      latitude: 19.0554,
      longitude: 72.8356,
      type: 'transport' as const,
      category: 'bus',
      description: "AC & Non-AC bus services",
      distance: "0.3 km",
      time: "1 min",
      address: "Linking Road, Bandra West",
      status: 'active' as const
    }
  ],

  // Live Incidents & Alerts Layer
  incidents: [
    {
      id: "incident-1",
      name: "Metro Line 2 Maintenance",
      latitude: 19.0564,
      longitude: 72.8416,
      type: 'incident' as const,
      category: 'transport_maintenance',
      description: "15-min delays due to signal maintenance",
      severity: 'high' as const,
      source: "Mumbai Metro",
      timestamp: "2 min ago",
      confidence: 95,
      status: 'active' as const
    },
    {
      id: "incident-2",
      name: "Water Supply Cut",
      latitude: 19.0534,
      longitude: 72.8396,
      type: 'incident' as const,
      category: 'utility',
      description: "Scheduled maintenance, 2-6 PM",
      severity: 'medium' as const,
      source: "BMC",
      timestamp: "1 hour ago",
      confidence: 100,
      status: 'scheduled' as const
    },
    {
      id: "incident-3",
      name: "Road Construction",
      latitude: 19.0574,
      longitude: 72.8386,
      type: 'incident' as const,
      category: 'construction',
      description: "Lane closure on SV Road",
      severity: 'medium' as const,
      source: "Traffic Police",
      timestamp: "45 min ago",
      confidence: 90,
      status: 'active' as const
    }
  ],

  // Events & Discovery Layer
  events: [
    {
      id: "event-1",
      name: "Food Festival",
      latitude: 19.0504,
      longitude: 72.8446,
      type: 'event' as const,
      category: 'food',
      description: "Weekend food festival at Bandstand",
      rating: 4.5,
      distance: "2.1 km",
      time: "8 mins",
      address: "Bandstand, Bandra West",
      startTime: "6:00 PM",
      endTime: "11:00 PM",
      status: 'active' as const
    },
    {
      id: "event-2",
      name: "Live Music Performance",
      latitude: 19.0524,
      longitude: 72.8366,
      type: 'event' as const,
      category: 'music',
      description: "Acoustic evening at Carter Road",
      rating: 4.3,
      distance: "1.2 km", 
      time: "5 mins",
      address: "Carter Road Promenade",
      startTime: "7:30 PM",
      endTime: "9:30 PM",
      status: 'scheduled' as const
    }
  ],

  // Places & Amenities Layer
  places: [
    {
      id: "place-1",
      name: "Linking Road Market",
      latitude: 19.0544,
      longitude: 72.8306,
      type: 'shopping' as const,
      category: 'market',
      description: "Famous shopping street",
      rating: 4.3,
      distance: "1.2 km",
      time: "5 mins",
      address: "Linking Road, Bandra West"
    },
    {
      id: "place-2",
      name: "Café Mocha",
      latitude: 19.0514,
      longitude: 72.8376,
      type: 'restaurant' as const,
      category: 'cafe',
      description: "Popular coffee spot",
      rating: 4.4,
      distance: "0.7 km",
      time: "3 mins", 
      address: "Hill Road, Bandra West"
    }
  ],

  // Itinerary Layer - day-by-day destinations
  itinerary: [
    {
      id: "itinerary-1",
      name: "Museum of Himachal Culture & Folk Art",
      latitude: 32.2430,
      longitude: 77.1892,
      type: 'attraction' as const,
      category: 'day-1',
      description: "Rich collection of Himachali artifacts and traditional art",
      rating: 4.1,
      time: "9:20 AM",
      distance: "0 km",
      address: "Manali, Himachal Pradesh",
      status: 'active' as const
    },
    {
      id: "itinerary-2", 
      name: "Hadimba Devi Temple",
      latitude: 32.2396,
      longitude: 77.1887,
      type: 'attraction' as const,
      category: 'day-1',
      description: "Ancient cave temple dedicated to Hidimbi Devi",
      rating: 4.5,
      time: "12:30 PM",
      distance: "1.2 km",
      address: "Manali, Himachal Pradesh", 
      status: 'active' as const
    },
    {
      id: "itinerary-3",
      name: "Mall Road Manali",
      latitude: 32.2432,
      longitude: 77.1892,
      type: 'shopping' as const,
      category: 'day-2',
      description: "Main shopping and dining street of Manali",
      rating: 4.3,
      time: "10:00 AM",
      distance: "0.8 km", 
      address: "Manali, Himachal Pradesh",
      status: 'scheduled' as const
    }
  ]
}

// Layer visibility state
type LayerType = 'transport' | 'incidents' | 'events' | 'places' | 'itinerary' | 'heatmap'

const LayerMarker = ({
  location,
  isSelected,
  onClick,
}: {
  location: CityLocation
  isSelected: boolean
  onClick: () => void
}) => {
  const getMarkerIcon = () => {
    switch (location.type) {
      case 'transport':
        return location.category === 'railway' ? <Bus className="w-4 h-4" /> : <Car className="w-4 h-4" />
      case 'incident':
        return <AlertTriangle className="w-4 h-4" />
      case 'event':
        return location.category === 'music' ? <Music className="w-4 h-4" /> : <Calendar className="w-4 h-4" />
      case 'restaurant':
        return <Coffee className="w-4 h-4" />
      case 'shopping':
        return <MapPin className="w-4 h-4" />
      case 'attraction':
        return <Star className="w-4 h-4" />
      case 'other': // Searched locations
        return <MapPin className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const getMarkerColor = () => {
    if (location.type === 'incident') {
      switch (location.severity) {
        case 'high': return '#ef4444'
        case 'medium': return '#f59e0b'
        case 'low': return '#10b981'
        default: return '#6b7280'
      }
    }

    switch (location.type) {
      case 'transport': return '#3b82f6'
      case 'event': return '#8b5cf6'
      case 'restaurant': return '#10b981'
      case 'shopping': return '#f59e0b'
      case 'attraction': return '#F1C40F' // Yellow for attractions in itinerary
      case 'other': return '#F1C40F' // Yellow for searched locations
      default: return '#F1C40F' // Default to yellow to match theme
    }
  }

  return (
    <div
      className="flex flex-col items-center cursor-pointer transform transition-all duration-200 hover:scale-110"
      onClick={onClick}
      style={{ transform: isSelected ? 'scale(1.25)' : 'scale(1)' }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
        style={{ backgroundColor: getMarkerColor() }}
      >
        <div className={getMarkerColor() === '#F1C40F' ? 'text-black' : 'text-white'}>
          {getMarkerIcon()}
        </div>
      </div>
      {isSelected && (
        <div 
          className="w-2 h-2 rotate-45 -mt-1"
          style={{ backgroundColor: getMarkerColor() }}
        />
      )}
    </div>
  )
}

const MarkerInfoWindow = ({ 
  location, 
  onDirectionsClick, 
  showDirections = false 
}: { 
  location: CityLocation
  onDirectionsClick?: (location: CityLocation) => void
  showDirections?: boolean
}) => {
  return (
    <div className="p-4 min-w-[280px] max-w-sm bg-[color:var(--gumo-surface)] rounded-xl border border-white/20">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: location.type === 'incident' && location.severity === 'high' ? '#ef4444' : '#3b82f6' }}
        >
          {location.type === 'incident' ? (
            <AlertTriangle className="w-4 h-4 text-white" />
          ) : (
            <MapPin className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[color:var(--gumo-text)] text-sm">{location.name}</h3>
          <p className="text-xs text-[color:var(--gumo-muted)] mt-1">{location.category}</p>
        </div>
        {location.confidence && (
          <div className="text-xs text-[color:var(--gumo-yellow)] font-medium">
            {location.confidence}% sure
          </div>
        )}
      </div>

      <p className="text-sm text-[color:var(--gumo-text)]/80 mb-3">{location.description}</p>

      <div className="flex items-center gap-4 mb-3 text-xs text-[color:var(--gumo-muted)]">
        {location.distance && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{location.distance}</span>
          </div>
        )}
        {location.time && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{location.time}</span>
          </div>
        )}
        {location.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{location.rating}</span>
          </div>
        )}
      </div>

      {location.source && (
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-[color:var(--gumo-muted)]">Source: {location.source}</span>
          {location.timestamp && (
            <span className="text-[color:var(--gumo-muted)]">{location.timestamp}</span>
          )}
        </div>
      )}

      {(location.startTime || location.endTime) && (
        <div className="flex items-center gap-2 mb-3 text-xs text-[color:var(--gumo-text)]">
          <Clock className="w-3 h-3" />
          <span>{location.startTime} - {location.endTime}</span>
        </div>
      )}

      <div className="flex gap-2">
        {showDirections ? (
          <button 
            onClick={() => onDirectionsClick?.(location)}
            className="flex-1 py-2 px-3 rounded-lg bg-[color:var(--gumo-yellow)] text-black text-xs font-medium hover:bg-[color:var(--gumo-yellow)]/90 transition-colors flex items-center justify-center gap-1"
          >
            <Navigation className="w-3 h-3" />
            Directions
          </button>
        ) : (
          <button className="flex-1 py-2 px-3 rounded-lg bg-[color:var(--gumo-yellow)] text-black text-xs font-medium hover:bg-[color:var(--gumo-yellow)]/90 transition-colors">
            Navigate
          </button>
        )}
        <button className="flex-1 py-2 px-3 rounded-lg border border-white/20 text-[color:var(--gumo-text)] text-xs font-medium hover:bg-white/5 transition-colors">
          Add to Plan
        </button>
      </div>
    </div>
  )
}

export const MapComponent: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<CityLocation | null>(null)
  const [openInfoWindow, setOpenInfoWindow] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>('transport')
  const [isLayerDropdownOpen, setIsLayerDropdownOpen] = useState(false)

  // Check for layer parameter from URL and itinerary ID
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const layerParam = urlParams.get('layer')
      const itineraryParam = urlParams.get('itinerary')
      
      if (layerParam && ['transport', 'incidents', 'events', 'places', 'itinerary'].includes(layerParam)) {
        setSelectedLayer(layerParam as LayerType)
        
        // If itinerary layer is selected from URL, load specific itinerary if provided
        if (layerParam === 'itinerary' && itineraryParam) {
          setSelectedItineraryId(itineraryParam)
        }
      }
    }
  }, [])

  // Load itineraries from IndexedDB when itinerary layer is selected
  React.useEffect(() => {
    if (selectedLayer === 'itinerary') {
      loadItinerariesFromDB()
    }
  }, [selectedLayer])

  const loadItinerariesFromDB = async () => {
    try {
      setItineraryLoading(true)
      const itineraries = await itineraryDB.getAllItineraries()
      setLoadedItineraries(itineraries)
    } catch (error) {
      console.error('Error loading itineraries:', error)
    } finally {
      setItineraryLoading(false)
    }
  }

  // Convert IndexedDB itinerary to CityLocation format for map display
  const convertItineraryToLocations = (itinerary: Itinerary): CityLocation[] => {
    const locations: CityLocation[] = []
    
    itinerary.destinations.forEach((dest, destIndex) => {
      if (dest.places && dest.places.length > 0) {
        // Use actual places with coordinates if available
        dest.places.forEach((place, placeIndex) => {
          // Map ItineraryPlace type to CityLocation type
          const mapPlaceType = (placeType?: string): CityLocation['type'] => {
            switch (placeType) {
              case 'hotel': return 'other'
              case 'restaurant': return 'restaurant'
              case 'attraction': return 'attraction'
              case 'transport': return 'transport'
              case 'shopping': return 'shopping'
              default: return 'attraction'
            }
          }

          // IMPORTANT: category must match filtering logic elsewhere (day-X)
          locations.push({
            id: `${itinerary.id}-${destIndex}-${placeIndex}`,
            name: place.name,
            latitude: place.latitude || getDefaultCityCoordinates(dest.city).lat,
            longitude: place.longitude || getDefaultCityCoordinates(dest.city).lng,
            type: mapPlaceType(place.type),
            category: `day-${Math.floor(placeIndex / 3) + 1}`, // Group places by day (assuming 3 places per day)
            description: place.description || `Visit ${place.name} in ${dest.city}`,
            rating: place.rating || 4.0,
            address: place.address || `${place.name}, ${dest.city}`
          })
        })
      } else {
        // Fallback: Create locations based on city and days with better default coordinates
        for (let day = 1; day <= dest.days; day++) {
          const cityCoords = getDefaultCityCoordinates(dest.city)
          locations.push({
            id: `${itinerary.id}-${dest.city}-day-${day}`,
            name: `${dest.city} - Day ${day}`,
            latitude: cityCoords.lat + (day * 0.01), // Small offset for each day
            longitude: cityCoords.lng + (day * 0.01),
            type: 'attraction',
            category: `day-${day}`,
            description: `Explore ${dest.city} on day ${day}`,
            rating: 4.5,
            address: `${dest.city}, Day ${day} locations`
          })
        }
      }
    })
    
    return locations
  }

  // Helper function to get default coordinates for popular cities
  const getDefaultCityCoordinates = (cityName: string): { lat: number; lng: number } => {
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Surat': { lat: 21.1702, lng: 72.8311 },
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Bhopal': { lat: 23.2599, lng: 77.4126 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Pimpri': { lat: 18.6298, lng: 73.7997 },
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Goa': { lat: 15.2993, lng: 74.1240 },
      'Shimla': { lat: 31.1048, lng: 77.1734 },
      'Manali': { lat: 32.2432, lng: 77.1892 },
      'Leh': { lat: 34.1526, lng: 77.5770 },
      'Rishikesh': { lat: 30.0869, lng: 78.2676 },
      'Haridwar': { lat: 29.9457, lng: 78.1642 },
      'Amritsar': { lat: 31.6340, lng: 74.8723 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Mysore': { lat: 12.2958, lng: 76.6394 },
      'Coorg': { lat: 12.3375, lng: 75.8069 },
      'Ooty': { lat: 11.4064, lng: 76.6932 },
      'Kochi': { lat: 9.9312, lng: 76.2673 },
      'Munnar': { lat: 10.0889, lng: 77.0595 },
      'Alleppey': { lat: 9.4981, lng: 76.3388 },
      'Udaipur': { lat: 24.5854, lng: 73.7125 },
      'Jodhpur': { lat: 26.2389, lng: 73.0243 },
      'Pushkar': { lat: 26.4899, lng: 74.5511 },
      'Mount Abu': { lat: 24.5926, lng: 72.7156 },
      'Darjeeling': { lat: 27.0410, lng: 88.2663 },
      'Gangtok': { lat: 27.3389, lng: 88.6065 },
      'Shillong': { lat: 25.5788, lng: 91.8933 },
      'Guwahati': { lat: 26.1445, lng: 91.7362 }
    }

    // Try to find exact match first
    const exactMatch = cityCoords[cityName]
    if (exactMatch) return exactMatch

    // Try partial match
    const cityKeys = Object.keys(cityCoords)
    const partialMatch = cityKeys.find(key => 
      key.toLowerCase().includes(cityName.toLowerCase()) || 
      cityName.toLowerCase().includes(key.toLowerCase())
    )
    
    if (partialMatch) return cityCoords[partialMatch]

    // Default to Mumbai if city not found
    return cityCoords['Mumbai']
  }
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Routing and directions state
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
  const [directionsRenderers, setDirectionsRenderers] = useState<google.maps.DirectionsRenderer[]>([])
  const [routeOptions, setRouteOptions] = useState<google.maps.DirectionsRoute[]>([])
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0)
  const [selectedTravelMode, setSelectedTravelMode] = useState<string>('DRIVING') // Use string initially
  const [showRoutes, setShowRoutes] = useState(false)
  const [searchedLocation, setSearchedLocation] = useState<CityLocation | null>(null)
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null)
  const [originalDirectionsResult, setOriginalDirectionsResult] = useState<google.maps.DirectionsResult | null>(null)
  const [routeError, setRouteError] = useState<string | null>(null)
  const [showUserLocationInfo, setShowUserLocationInfo] = useState(false)
  const [userLocationAddress, setUserLocationAddress] = useState<string | null>(null)

  // Itinerary route polyline - use ref to avoid circular dependency in useEffect
  const itineraryPolylineRef = useRef<google.maps.Polyline | null>(null)
  // Itinerary day selection (fixed: was causing undefined error)
  const [selectedItineraryDay, setSelectedItineraryDay] = useState(0)
  // Itinerary destination selection for card navigation
  const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(0)
  
  // IndexedDB itinerary management
  const [loadedItineraries, setLoadedItineraries] = useState<Itinerary[]>([])
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null)
  const [itineraryLoading, setItineraryLoading] = useState(false)

  const mapRef = useRef<google.maps.Map | null>(null)
  const map = useMap()
  const apiIsLoaded = useApiIsLoaded()
  const placesLib = useMapsLibrary("places")

  // Helper function to get travel mode enum
  const getTravelMode = (modeString: string): google.maps.TravelMode => {
    if (!apiIsLoaded || typeof google === 'undefined') {
      return 'DRIVING' as google.maps.TravelMode // Fallback
    }
    switch (modeString) {
      case 'WALKING':
        return google.maps.TravelMode.WALKING
      case 'TRANSIT':
        return google.maps.TravelMode.TRANSIT
      case 'BICYCLING':
        return google.maps.TravelMode.BICYCLING
      default:
        return google.maps.TravelMode.DRIVING
    }
  }

  // Get all locations for current selected layer
  const getAllVisibleLocations = () => {
    let locations: CityLocation[] = []
    switch (selectedLayer) {
      case 'transport':
        locations = [...DEMO_DATA.transport]
        break
      case 'incidents':
        locations = [...DEMO_DATA.incidents]
        break
      case 'events':
        locations = [...DEMO_DATA.events]
        break
      case 'places':
        locations = [...DEMO_DATA.places]
        break
      case 'itinerary':
        if (selectedItineraryId) {
          // Show specific itinerary from IndexedDB
          const selectedItinerary = loadedItineraries.find(it => it.id === selectedItineraryId)
          if (selectedItinerary) {
            locations = convertItineraryToLocations(selectedItinerary)
          }
        }
        // When no specific itinerary is selected, show empty map so drawer displays the cards
        // locations remains empty array []
        break
      default:
        locations = [...DEMO_DATA.transport]
        break
    }
    return locations
  }

  const visibleLocations = getAllVisibleLocations()

  // Add searched location to visible locations if it exists
  const allVisibleLocations = useMemo(() => {
    const locations = [...visibleLocations]
    if (selectedLocation && !locations.find(loc => loc.id === selectedLocation.id)) {
      locations.push(selectedLocation)
    }
    return locations
  }, [visibleLocations, selectedLocation])

  useEffect(() => {
    // Get user's actual current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(currentLocation)
          console.log("User's current location:", currentLocation.lat, currentLocation.lng)
        },
        (error) => {
          console.error("Error getting user location:", error)
          // Fallback to Mumbai coordinates if location access is denied
          setUserLocation({
            lat: 19.0760,
            lng: 72.8777
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes cache
        }
      )
    } else {
      // Fallback if geolocation is not supported
      setUserLocation({
        lat: 19.0760,
        lng: 72.8777
      })
    }
  }, [])

  // Draw route between itinerary destinations for selected day (from IndexedDB itinerary)
  useEffect(() => {
    // Clear existing itinerary polyline first
    if (itineraryPolylineRef.current) {
      itineraryPolylineRef.current.setMap(null)
      itineraryPolylineRef.current = null
    }

    if (selectedLayer === 'itinerary' && map && apiIsLoaded && selectedItineraryId) {
      const selectedItinerary = loadedItineraries.find(it => it.id === selectedItineraryId)
      if (selectedItinerary) {
        const allLocations = convertItineraryToLocations(selectedItinerary)
        const dayDestinations = allLocations.filter(dest => dest.category === `day-${selectedItineraryDay + 1}`)

        if (dayDestinations.length > 1) {
          // Create path between destinations
          const path = dayDestinations.map(dest => 
            new google.maps.LatLng(dest.latitude, dest.longitude)
          )

          const polyline = new google.maps.Polyline({
            path: path,
            strokeColor: "#F1C40F",
            strokeWeight: 4,
            strokeOpacity: 0.8,
            map: map
          })

          itineraryPolylineRef.current = polyline

          // Fit map to show all destinations for the day if drawer is not open or first time
          // If drawer is open and user is swiping, just focus on specific destination
          if (!drawerOpen || selectedDestinationIndex === 0) {
            const bounds = new google.maps.LatLngBounds()
            dayDestinations.forEach(dest => {
              bounds.extend(new google.maps.LatLng(dest.latitude, dest.longitude))
            })
            map.fitBounds(bounds)
          } else {
            // Focus on the currently selected destination
            const currentDest = dayDestinations[selectedDestinationIndex]
            if (currentDest) {
              map.panTo({ lat: currentDest.latitude, lng: currentDest.longitude })
              map.setZoom(16)
            }
          }
        } else if (dayDestinations.length === 1) {
          // Single destination - just focus on it
          const singleDest = dayDestinations[0]
          map.panTo({ lat: singleDest.latitude, lng: singleDest.longitude })
          map.setZoom(16)
        }
      }
    }

    return () => {
      if (itineraryPolylineRef.current) {
        itineraryPolylineRef.current.setMap(null)
        itineraryPolylineRef.current = null
      }
    }
  }, [selectedLayer, selectedItineraryDay, selectedDestinationIndex, map, apiIsLoaded, selectedItineraryId, loadedItineraries, drawerOpen])

  // Focus map on specific destination
  const focusOnDestination = useCallback((destination: CityLocation, zoom: number = 16) => {
    if (map) {
      map.panTo({ lat: destination.latitude, lng: destination.longitude })
      map.setZoom(zoom)
    }
  }, [map])

  // Handle card swipe/focus change
  const handleDestinationFocus = useCallback((index: number, destinations: CityLocation[]) => {
    setSelectedDestinationIndex(index)
    if (destinations[index]) {
      focusOnDestination(destinations[index])
    }
  }, [focusOnDestination])

  // Auto open drawer when entering itinerary layer with no itinerary selected
  useEffect(() => {
    if (selectedLayer === 'itinerary' && !selectedItineraryId) {
      setDrawerOpen(true)
    }
  }, [selectedLayer, selectedItineraryId])

  // Initialize DirectionsService and Geocoder
  useEffect(() => {
    if (map && apiIsLoaded && !directionsService) {
      // Initialize DirectionsService
      const service = new google.maps.DirectionsService()
      setDirectionsService(service)
      
      // Initialize Geocoder
      const geocoderService = new google.maps.Geocoder()
      setGeocoder(geocoderService)
    }
  }, [map, apiIsLoaded, directionsService])

  // Ensure we don't cause re-renders during render
  useEffect(() => {
    if (apiIsLoaded && typeof google !== 'undefined') {
      // API is loaded, we can safely use google maps objects
    }
  }, [apiIsLoaded])

  const handleLocationUpdate = useCallback((location: { lat: number; lng: number }, address: string) => {
    setUserLocation(location)
  }, [])

  // Handle user location marker click
  const handleUserLocationClick = useCallback(async () => {
    if (!geocoder || !userLocation) return

    // For mobile, open drawer and set special state for user location
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDrawerOpen(true)
      setSelectedLocation({
        id: 'user-location',
        name: 'Your Current Location',
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        type: 'other',
        category: 'current-location'
      })
    } else {
      // For desktop, show info window
      setShowUserLocationInfo(true)
    }
    
    // If we don't have the address yet, reverse geocode it
    if (!userLocationAddress) {
      try {
        const { results } = await geocoder.geocode({
          location: userLocation
        })
        
        if (results && results.length > 0) {
          setUserLocationAddress(results[0].formatted_address)
        } else {
          setUserLocationAddress("Address not available")
        }
      } catch (error) {
        console.error('Error reverse geocoding user location:', error)
        setUserLocationAddress("Unable to get address")
      }
    }
  }, [geocoder, userLocation, userLocationAddress])

  // Autocomplete functionality - keeping compatible approach while new API stabilizes
  const fetchAutocompleteSuggestions = useCallback(async (input: string) => {
    if (!placesLib || !input.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // Try new AutocompleteSuggestion API first, fallback to AutocompleteService if needed
      if (placesLib.AutocompleteSuggestion) {
        try {
          const { AutocompleteSuggestion } = placesLib
          const request = {
            input: input,
            // Remove locationRestriction for now to avoid type issues
            // Will use componentRestrictions in fallback
          }

          const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
          
          if (response.suggestions && response.suggestions.length > 0) {
            // Convert the new format to the expected format
            const convertedSuggestions: google.maps.places.AutocompletePrediction[] = response.suggestions.map((suggestion: any) => ({
              place_id: suggestion.placePrediction?.placeId || '',
              description: suggestion.placePrediction?.text?.text || '',
              structured_formatting: {
                main_text: suggestion.placePrediction?.text?.text?.split(',')[0] || '',
                secondary_text: suggestion.placePrediction?.text?.text?.split(',').slice(1).join(',').trim() || ''
              },
              types: suggestion.placePrediction?.types || []
            } as google.maps.places.AutocompletePrediction))
            
            setSuggestions(convertedSuggestions)
            setShowSuggestions(true)
            return
          }
        } catch (newApiError) {
          console.warn('New AutocompleteSuggestion API failed, falling back to AutocompleteService:', newApiError)
        }
      }

      // Fallback to AutocompleteService (still works but deprecated)
      const service = new placesLib.AutocompleteService()
      const request: google.maps.places.AutocompletionRequest = {
        input: input,
        componentRestrictions: { country: 'in' }, // Restrict to India
        types: ['establishment', 'geocode']
      }

      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      })
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [placesLib])

  // Handle search input change
  const handleSearchInputChange = useCallback((value: string) => {
    setSearchValue(value)
    if (value.trim()) {
      fetchAutocompleteSuggestions(value)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [fetchAutocompleteSuggestions])

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback(async (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib) return

    setLoading(true)
    setSearchValue(prediction.description)
    setShowSuggestions(false)

    try {
      // Use the new Place API instead of deprecated PlacesService
      const { Place } = placesLib
      const place = new Place({
        id: prediction.place_id,
        requestedLanguage: 'en'
      })

      // Fetch place details using the new API
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'types']
      })

      if (place.location) {
        // Determine location type based on selected layer and place types
        let locationtype: CityLocation['type'] = 'other'
        
        if (selectedLayer === 'transport') {
          // For transport layer, treat searched places as destinations
          locationtype = 'other' // This will show directions button
        } else {
          // For other layers, try to match place types to our categories
          const placeTypes = place.types || []
          if (placeTypes.includes('restaurant') || placeTypes.includes('food')) {
            locationtype = 'restaurant'
          } else if (placeTypes.includes('tourist_attraction') || placeTypes.includes('point_of_interest')) {
            locationtype = 'attraction'
          } else if (placeTypes.includes('store') || placeTypes.includes('shopping_mall')) {
            locationtype = 'shopping'
          } else if (placeTypes.includes('hospital') || placeTypes.includes('pharmacy')) {
            locationtype = 'hospital'
          } else {
            locationtype = 'other'
          }
        }

        const newLocation: CityLocation = {
          id: prediction.place_id,
          name: place.displayName || prediction.structured_formatting.main_text,
          latitude: place.location.lat(),
          longitude: place.location.lng(),
          type: locationtype,
          address: place.formattedAddress || prediction.description,
          category: place.types?.[0] || 'place'
        }

        // Center map on selected location
        if (map) {
          map.setCenter({ lat: place.location.lat(), lng: place.location.lng() })
          map.setZoom(16)
        }

        // Set as selected location for info window
        setSelectedLocation(newLocation)
        setOpenInfoWindow(newLocation.id.toString())
      }
    } catch (error) {
      console.error('Error fetching place details:', error)
    } finally {
      setLoading(false)
    }
  }, [placesLib, map])

  const handleSearch = async () => {
    if (!searchValue.trim()) return

    setLoading(true)
    setShowSuggestions(false)

    try {
      // If there are suggestions, select the first one
      if (suggestions.length > 0) {
        await handlePlaceSelect(suggestions[0])
        return
      }

      // Fallback: Use Text Search API to find the place
      if (placesLib && map) {
        const request = {
          query: searchValue.trim(),
          fields: ['displayName', 'formattedAddress', 'location', 'types', 'place_id']
        }

        const { places } = await placesLib.Place.searchByText(request)
        
        if (places && places.length > 0) {
          const place = places[0]
          
          const newLocation: CityLocation = {
            id: place.id || `search-${Date.now()}`,
            name: place.displayName || searchValue,
            latitude: place.location?.lat() || 0,
            longitude: place.location?.lng() || 0,
            type: 'other',
            address: place.formattedAddress || '',
            category: place.types?.[0] || 'place'
          }

          // Center map on found location
          if (place.location) {
            map.setCenter({ lat: place.location.lat(), lng: place.location.lng() })
            map.setZoom(16)
          }

          // Set as selected location for info window
          setSelectedLocation(newLocation)
          setOpenInfoWindow(newLocation.id.toString())
          
          // For transport layer, calculate route if we have user location
          if (selectedLayer === 'transport' && userLocation) {
            calculateRoutes(newLocation)
          }
          
          console.log('Found place via text search:', newLocation)
        } else {
          console.log('No places found for search:', searchValue)
          // You could add a toast notification here
        }
      }
    } catch (error) {
      console.error('Error searching for place:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchValue("")
    setSelectedLocation(null)
    setOpenInfoWindow(null)
    setDrawerOpen(false)
    setSuggestions([])
    setShowSuggestions(false)
    clearRoutes() // Clear routes when clearing search
  }

  // Route optimization function to sort routes by time (least to most)
  const optimizeRoutes = useCallback((routes: google.maps.DirectionsRoute[], travelMode: string) => {
    if (!routes || routes.length <= 1) return routes

    return [...routes].sort((a, b) => {
      const aLeg = a.legs[0]
      const bLeg = b.legs[0]
      
      // Get duration values (prefer traffic-aware duration for driving)
      const getDurationValue = (leg: google.maps.DirectionsLeg, mode: string) => {
        if (mode === 'DRIVING' && leg.duration_in_traffic) {
          return leg.duration_in_traffic.value
        }
        return leg.duration?.value || 0
      }

      const aTime = getDurationValue(aLeg, travelMode)
      const bTime = getDurationValue(bLeg, travelMode)

      // Always sort by time (least to most) for all travel modes
      return aTime - bTime
    })
  }, [])

  // Get route optimization label for UI display
  const getRouteOptimizationLabel = useCallback((route: google.maps.DirectionsRoute, index: number, routes: google.maps.DirectionsRoute[], travelMode: string) => {
    if (index === 0) {
      switch (travelMode) {
        case 'DRIVING':
          return "Fastest"
        case 'WALKING':
          return "Shortest"
        case 'BICYCLING':
          return "Best Route"
        case 'TRANSIT':
          return "Recommended"
        default:
          return "Optimal"
      }
    }
    
    if (routes.length > 1) {
      const leg = route.legs[0]
      const firstRouteLeg = routes[0].legs[0]
      
      const routeTime = leg.duration_in_traffic?.value || leg.duration?.value || 0
      const firstRouteTime = firstRouteLeg.duration_in_traffic?.value || firstRouteLeg.duration?.value || 0
      const routeDistance = leg.distance?.value || 0
      const firstRouteDistance = firstRouteLeg.distance?.value || 0
      
      // Determine what makes this route different
      if (routeDistance < firstRouteDistance * 0.9) {
        return "Shorter"
      } else if (routeTime > firstRouteTime * 1.1) {
        return "Alternative"
      } else {
        return "Via " + (route.summary ? route.summary.split(',')[0] : "different route")
      }
    }
    
    return ""
  }, [])

  // Helper function to get travel mode icon
  const getTravelModeIcon = useCallback((mode: string) => {
    switch (mode) {
      case 'DRIVING':
        return Car
      case 'WALKING':
        return PersonStanding
      case 'TRANSIT':
        return Bus
      case 'BICYCLING':
        return Bike
      default:
        return MapPin
    }
  }, [])

  // Calculate multiple route options with different travel modes
  const calculateRoutes = useCallback(async (destination: CityLocation, travelModeOverride?: string) => {
    if (!directionsService || !userLocation || !map) {
      console.warn('DirectionsService, user location, or map not available')
      return
    }

    // Use the provided mode override or fall back to state
    const currentTravelMode = travelModeOverride || selectedTravelMode

    setLoading(true)
    // Clear existing route options immediately to prevent showing old data
    setRouteOptions([])
    setShowRoutes(false)
    setRouteError(null) // Clear any previous errors

    const origin = new google.maps.LatLng(userLocation.lat, userLocation.lng)
    const dest = new google.maps.LatLng(destination.latitude, destination.longitude)

    try {
      // Build request based on selected travel mode
      const travelMode = getTravelMode(currentTravelMode)
      const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: dest,
        travelMode: travelMode,
        provideRouteAlternatives: travelMode === google.maps.TravelMode.DRIVING || travelMode === google.maps.TravelMode.WALKING,
        avoidHighways: false,
        avoidTolls: false,
        ...(travelMode === google.maps.TravelMode.DRIVING && {
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
          }
        }),
        ...(travelMode === google.maps.TravelMode.TRANSIT && {
          transitOptions: {
            departureTime: new Date(),
            modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.SUBWAY, google.maps.TransitMode.RAIL]
          }
        })
      }

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          console.log(`Found ${result.routes.length} route options for ${currentTravelMode}`)
          
          // Sort routes by optimality for the current travel mode
          const optimizedRoutes = optimizeRoutes(result.routes, currentTravelMode)
          
          setRouteOptions(optimizedRoutes)
          setOriginalDirectionsResult({...result, routes: optimizedRoutes}) // Store optimized result
          setShowRoutes(true)
          setSelectedRouteIndex(0)
          
          // Clear any existing renderers
          directionsRenderers.forEach(renderer => {
            renderer.setMap(null)
          })

          // Initially show only the first (most optimal) route with traffic
          const routeColors = ['#F1C40F', '#3498DB', '#9B59B6', '#E74C3C', '#2ECC71']
          const renderer = new google.maps.DirectionsRenderer({
            routeIndex: 0,
            polylineOptions: {
              strokeColor: routeColors[0],
              strokeWeight: 6,
              strokeOpacity: 0.8,
            },
            suppressMarkers: false,
            suppressInfoWindows: true,
          })

          // Create result with only first (optimal) route
          const singleRouteResult: google.maps.DirectionsResult = {
            ...result,
            routes: [optimizedRoutes[0]]
          }
          
          renderer.setDirections(singleRouteResult)
          renderer.setMap(map)
          setDirectionsRenderers([renderer])

          // Enable traffic layer for driving mode
          if (currentTravelMode === 'DRIVING' && !trafficLayer) {
            const traffic = new google.maps.TrafficLayer()
            traffic.setMap(map)
            setTrafficLayer(traffic)
          }
          
          // Fit map to show the selected route
          const bounds = new google.maps.LatLngBounds()
          optimizedRoutes[0].legs.forEach(leg => {
            leg.steps.forEach(step => {
              bounds.extend(step.start_location)
              bounds.extend(step.end_location)
            })
          })
          map.fitBounds(bounds)
        } else {
          // Handle different error types with user-friendly messages
          let errorMessage = 'Unable to calculate route'
          
          switch (status) {
            case google.maps.DirectionsStatus.ZERO_RESULTS:
              switch (currentTravelMode) {
                case 'BICYCLING':
                  errorMessage = 'No cycling routes available for this area. Cycling data may be limited.'
                  break
                case 'TRANSIT':
                  errorMessage = 'No public transit routes available for this route.'
                  break
                case 'WALKING':
                  errorMessage = 'No walking routes available for this distance.'
                  break
                default:
                  errorMessage = 'No routes found for the selected travel mode.'
              }
              break
            case google.maps.DirectionsStatus.NOT_FOUND:
              errorMessage = 'Location could not be geocoded.'
              break
            case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
              errorMessage = 'Too many requests. Please try again in a moment.'
              break
            case google.maps.DirectionsStatus.REQUEST_DENIED:
              errorMessage = 'Directions request was denied.'
              break
            case google.maps.DirectionsStatus.INVALID_REQUEST:
              errorMessage = 'Invalid directions request.'
              break
            case google.maps.DirectionsStatus.UNKNOWN_ERROR:
              errorMessage = 'Unknown error occurred. Please try again.'
              break
            default:
              errorMessage = `Directions request failed: ${status}`
          }
          
          console.warn(`Directions request failed for ${currentTravelMode}: ${status} - ${errorMessage}`)
          
          // Clear any existing routes and show error state
          setRouteOptions([])
          setShowRoutes(false)
          setRouteError(errorMessage)
          
          // You could show a toast notification here
          // For now, we'll rely on the console warning and the error state display
        }
        setLoading(false)
      })
    } catch (error) {
      console.error('Error calculating routes:', error)
      setLoading(false)
    }
  }, [directionsService, userLocation, map, selectedTravelMode, directionsRenderers, optimizeRoutes, getTravelMode, trafficLayer])

  // Clear all routes from map
  const clearRoutes = useCallback(() => {
    directionsRenderers.forEach(renderer => {
      renderer.setMap(null)
    })
    setDirectionsRenderers([])
    setRouteOptions([])
    setShowRoutes(false)
    setRouteError(null) // Clear any route errors
  }, [directionsRenderers])

  // Select a specific route and show only that route
  const selectRoute = useCallback((routeIndex: number) => {
    setSelectedRouteIndex(routeIndex)
    
    // Clear all existing renderers
    directionsRenderers.forEach(renderer => {
      renderer.setMap(null)
    })

    // Show only the selected route with traffic
    if (routeOptions[routeIndex] && map && originalDirectionsResult) {
      const selectedRoute = routeOptions[routeIndex]
      const routeColors = ['#F1C40F', '#3498DB', '#9B59B6', '#E74C3C', '#2ECC71']
      
      // Create a new renderer for only the selected route with traffic enabled
      const renderer = new google.maps.DirectionsRenderer({
        routeIndex: 0, // Always 0 since we're only showing one route
        polylineOptions: {
          strokeColor: routeColors[routeIndex % routeColors.length],
          strokeWeight: 6,
          strokeOpacity: 0.8,
        },
        suppressMarkers: false,
        suppressInfoWindows: true,
      })

      // Create a new directions result with only the selected route
      const singleRouteResult: google.maps.DirectionsResult = {
        ...originalDirectionsResult,
        routes: [selectedRoute] // Only include the selected route
      }
      
      renderer.setDirections(singleRouteResult)
      renderer.setMap(map)
      
      // Update the renderers array to only contain the selected route renderer
      setDirectionsRenderers([renderer])

      // Enable traffic layer for the selected route area
      if (!trafficLayer) {
        const traffic = new google.maps.TrafficLayer()
        traffic.setMap(map)
        setTrafficLayer(traffic)
      }
    }
  }, [directionsRenderers, routeOptions, map, trafficLayer, originalDirectionsResult])

  // Add traffic layer state

  // Change travel mode and recalculate routes
  const changeTravelMode = useCallback((mode: string) => {
    setSelectedTravelMode(mode)
    if (selectedLocation) {
      // Pass the new mode directly to avoid state race condition
      calculateRoutes(selectedLocation, mode)
    }
  }, [selectedLocation, calculateRoutes])

  const selectLayer = (layer: LayerType) => {
    // Clear routes when switching away from transport layer
    if (selectedLayer === 'transport' && layer !== 'transport' && showRoutes) {
      clearRoutes()
    }
    
    // Reset selectedItineraryId when manually switching to/from itinerary layer
    if (layer === 'itinerary' && selectedLayer !== 'itinerary') {
      // Switching TO itinerary layer - reset to show cards list
      setSelectedItineraryId(null)
    } else if (layer !== 'itinerary' && selectedLayer === 'itinerary') {
      // Switching AWAY from itinerary layer - clear selection
      setSelectedItineraryId(null)
    }
    
    setSelectedLayer(layer)
    setIsLayerDropdownOpen(false)
  }

  const focusOnMyLocation = () => {
    if (userLocation && map) {
      map.panTo(userLocation)
      map.setZoom(16)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(newLocation)
          console.log(newLocation.lat, " ", newLocation.lng)
          if (map) {
            map.panTo(newLocation)
            map.setZoom(16)
          }
        },
        (error) => {
          console.error("Error getting user location:", error)
          // Fallback to default location
          const defaultLocation = { lat: 19.0760, lng: 72.8777 }
          if (map) {
            map.panTo(defaultLocation)
            map.setZoom(14)
          }
        },
      )
    }
  }

  if (!apiIsLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[color:var(--gumo-bg)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 border-4 border-[color:var(--gumo-yellow)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-[color:var(--gumo-text)] mb-2">Loading CityPulse Map...</h2>
          <p className="text-sm text-[color:var(--gumo-muted)]">
            Initializing map layers and real-time city data
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-[color:var(--gumo-yellow)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[color:var(--gumo-yellow)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[color:var(--gumo-yellow)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">


      {/* Full-screen Google Map with dark theme */}
      <Map
        mapId="citypulse-demo-map"
        defaultZoom={14}
        defaultCenter={userLocation || { lat: 19.0760, lng: 72.8777 }}
        gestureHandling="greedy"
        disableDefaultUI={true}
        className="h-full w-full"
        colorScheme="DARK"
        onCameraChanged={(event) => {
          // Handle camera changes
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <AdvancedMarker
            position={userLocation}
            clickable={true}
            onClick={handleUserLocationClick}
          >
            <div className="flex flex-col items-center cursor-pointer transform transition-all duration-200 hover:scale-110">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white bg-[color:var(--gumo-yellow)]">
                <MapPin className="w-4 h-4 text-black" />
              </div>
              <div className="w-2 h-2 rotate-45 -mt-1 bg-[color:var(--gumo-yellow)]" />
            </div>
          </AdvancedMarker>
        )}

        {/* Layer markers */}
        {allVisibleLocations.map((location) => (
          <AdvancedMarker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            clickable={true}
            onClick={() => {
              setSelectedLocation(location)
              setOpenInfoWindow(String(location.id) === openInfoWindow ? null : String(location.id))
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setDrawerOpen(true)
              }
            }}
          >
            <LayerMarker
              location={location}
              isSelected={selectedLocation?.id === location.id}
              onClick={() => {
                setSelectedLocation(location)
                setOpenInfoWindow(String(location.id) === openInfoWindow ? null : String(location.id))
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setDrawerOpen(true)
                }
              }}
            />
          </AdvancedMarker>
        ))}

        {/* Info windows for desktop */}
        {openInfoWindow && selectedLocation && typeof window !== 'undefined' && window.innerWidth >= 768 && (
          <InfoWindow
            position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
            onCloseClick={() => setOpenInfoWindow(null)}
          >
            <MarkerInfoWindow 
              location={selectedLocation} 
              onDirectionsClick={calculateRoutes}
              showDirections={true}
            />
          </InfoWindow>
        )}

        {/* User location info window */}
        {showUserLocationInfo && userLocation && typeof window !== 'undefined' && window.innerWidth >= 768 && (
          <InfoWindow
            position={userLocation}
            onCloseClick={() => setShowUserLocationInfo(false)}
          >
            <div className="p-4 min-w-[280px] max-w-sm bg-[color:var(--gumo-surface)] rounded-xl border border-white/20">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[color:var(--gumo-yellow)] flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[color:var(--gumo-text)] text-sm">Your Current Location</h3>
                  <p className="text-xs text-[color:var(--gumo-muted)] mt-1">GPS Location</p>
                </div>
              </div>

              {userLocationAddress && (
                <p className="text-sm text-[color:var(--gumo-text)]/80 mb-3">{userLocationAddress}</p>
              )}

              <div className="flex items-center gap-4 mb-3 text-xs text-[color:var(--gumo-muted)]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Lat: {userLocation.lat.toFixed(6)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Lng: {userLocation.lng.toFixed(6)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (map) {
                      map.panTo(userLocation)
                      map.setZoom(16)
                    }
                  }}
                  className="flex-1 py-2 px-3 rounded-lg bg-[color:var(--gumo-yellow)] text-black text-xs font-medium hover:bg-[color:var(--gumo-yellow)]/90 transition-colors flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  Center Map
                </button>
                <button 
                  onClick={() => setShowUserLocationInfo(false)}
                  className="flex-1 py-2 px-3 rounded-lg border border-white/20 text-[color:var(--gumo-text)] text-xs font-medium hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Search interface */}
      <div className="absolute top-16 left-4 right-4 z-10">
        <div className="mx-auto max-w-md space-y-4">
          {/* Search bar - always show */}
          <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search locations, events, alerts..."
            className="w-full px-4 py-3 pr-12 rounded-2xl bg-[color:var(--gumo-surface)]/90 backdrop-blur-sm border border-white/20 text-[color:var(--gumo-text)] placeholder-[color:var(--gumo-muted)] focus:outline-none focus:border-[color:var(--gumo-yellow)] shadow-lg"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => setShowSuggestions(false), 150)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchValue && (
              <button onClick={handleClearSearch} className="text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-text)]">
                <X className="w-5 h-5" />
              </button>
            )}
            {loading ? (
              <div className="w-5 h-5 border-2 border-[color:var(--gumo-yellow)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search
                className="w-5 h-5 text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-yellow)] cursor-pointer"
                onClick={handleSearch}
              />
            )}
          </div>
          </div>

          {/* Day selector tags - show when itinerary is selected, positioned below search */}
          {selectedLayer === 'itinerary' && selectedItineraryId && loadedItineraries.find(it => it.id === selectedItineraryId) && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {loadedItineraries.find(it => it.id === selectedItineraryId)?.destinations.flatMap(dest => 
                Array.from({length: dest.days}, (_, i) => ({
                  date: `Day ${i + 1}`,
                  day: i,
                  city: dest.city
                }))
              ).map((dayInfo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedItineraryDay(index)
                    setSelectedDestinationIndex(0)
                    setDrawerOpen(true) // Open drawer when day is clicked
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedItineraryDay === index
                      ? 'bg-[color:var(--gumo-yellow)] text-black'
                      : 'bg-[color:var(--gumo-surface)]/90 text-[color:var(--gumo-text)] hover:bg-[color:var(--gumo-surface)] border border-white/20'
                  }`}
                >
                  {dayInfo.date}
                </button>
              ))}
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-[color:var(--gumo-surface)]/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handlePlaceSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[color:var(--gumo-yellow)] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[color:var(--gumo-text)] truncate">
                        {suggestion.structured_formatting.main_text}
                      </p>
                      <p className="text-sm text-[color:var(--gumo-muted)] truncate">
                        {suggestion.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Location Button */}
      <div className="absolute bottom-6 right-4 z-10 mb-16">
        <button 
          onClick={focusOnMyLocation}
          className="w-12 h-12 bg-[color:var(--gumo-surface)]/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/10 hover:bg-[color:var(--gumo-surface)] transition-colors"
          title="Focus on my location"
        >
          <Navigation className="w-6 h-6 text-[color:var(--gumo-text)]" />
        </button>
      </div>

      {/* Layer controls - Dropdown */}
      <div className="absolute top-32 right-4 z-10">
        <div className="bg-[color:var(--gumo-surface)]/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-[color:var(--gumo-text)]" />
            <span className="text-xs text-[color:var(--gumo-text)] font-medium">Layers</span>
          </div>
          
          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLayerDropdownOpen(!isLayerDropdownOpen)}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-28 bg-[color:var(--gumo-yellow)] text-black hover:bg-[color:var(--gumo-yellow)]/90"
            >
              <span className="capitalize">{selectedLayer}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLayerDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Options */}
            {isLayerDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[color:var(--gumo-surface)] rounded-lg border border-white/10 shadow-lg overflow-hidden z-50">
                {(['transport', 'incidents', 'events', 'places', 'itinerary'] as LayerType[]).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => selectLayer(layer)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 text-xs transition-colors w-full hover:bg-white/10 ${
                      selectedLayer === layer
                        ? 'bg-[color:var(--gumo-yellow)] text-black'
                        : 'text-[color:var(--gumo-text)]'
                    }`}
                  >
                    <span className="capitalize">{layer}</span>
                    {selectedLayer === layer && <div className="w-2 h-2 rounded-full bg-black" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resizable Bottom Drawer */}
      <ResizableDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedLocation ? selectedLocation.name : "City Overview"}
        minHeight={200}
        maxHeight={600}
        defaultHeight={400}
      >
        {selectedLocation ? (
          <div className="space-y-4 pt-4">
            {/* Special handling for user location */}
            {selectedLocation.id === 'user-location' ? (
              <div className="p-4 min-w-[280px] max-w-sm bg-[color:var(--gumo-surface)] rounded-xl border border-white/20">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[color:var(--gumo-yellow)] flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[color:var(--gumo-text)] text-sm">Your Current Location</h3>
                    <p className="text-xs text-[color:var(--gumo-muted)] mt-1">GPS Location</p>
                  </div>
                </div>

                {userLocationAddress && (
                  <p className="text-sm text-[color:var(--gumo-text)]/80 mb-3">{userLocationAddress}</p>
                )}

                <div className="flex items-center gap-4 mb-3 text-xs text-[color:var(--gumo-muted)]">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Lat: {userLocation?.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Lng: {userLocation?.lng.toFixed(6)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (map && userLocation) {
                        map.panTo(userLocation)
                        map.setZoom(16)
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-[color:var(--gumo-yellow)] text-black text-xs font-medium hover:bg-[color:var(--gumo-yellow)]/90 transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3 h-3" />
                    Center Map
                  </button>
                  <button 
                    onClick={() => {
                      setDrawerOpen(false)
                      setSelectedLocation(null)
                    }}
                    className="flex-1 py-2 px-3 rounded-lg border border-white/20 text-[color:var(--gumo-text)] text-xs font-medium hover:bg-white/5 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <MarkerInfoWindow 
                location={selectedLocation} 
                onDirectionsClick={calculateRoutes}
                showDirections={true}
              />
            )}
            
            {/* Route Options Display with Travel Modes - only for regular locations */}
            {selectedLocation.id !== 'user-location' && ((showRoutes && routeOptions.length > 0) || routeError) ? (
              <div className="space-y-3">
                {/* Travel Mode Selector */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-[color:var(--gumo-text)]">Route Options</h4>
                  <button 
                    onClick={clearRoutes}
                    className="text-xs text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-text)] transition-colors"
                  >
                    Clear Routes
                  </button>
                </div>

                {/* Travel Mode Options */}
                <div className="flex gap-2 mb-3">
                  {[
                    { mode: 'DRIVING', icon: Car, label: 'Drive' },
                    { mode: 'WALKING', icon: PersonStanding, label: 'Walk' },
                    { mode: 'TRANSIT', icon: Bus, label: 'Transit' },
                    { mode: 'BICYCLING', icon: Bike, label: 'Bike' }
                  ].map(({ mode, icon: IconComponent, label }) => (
                    <button
                      key={mode}
                      onClick={() => changeTravelMode(mode)}
                      className={`flex-1 p-2 rounded-lg border transition-all text-xs ${
                        selectedTravelMode === mode 
                          ? 'border-[color:var(--gumo-yellow)] bg-[color:var(--gumo-yellow)]/10 text-[color:var(--gumo-text)]' 
                          : 'border-white/10 hover:border-white/20 text-[color:var(--gumo-muted)]'
                      }`}
                    >
                      <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>{label}</div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Route Error Message */}
                {routeError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-red-400">Route Not Available</span>
                    </div>
                    <p className="text-xs text-red-300">{routeError}</p>
                    <p className="text-xs text-red-300/70 mt-1">Try switching to a different travel mode.</p>
                  </div>
                )}
                
                {/* Route Options List */}
                {showRoutes && routeOptions.length > 0 && (
                <div className="space-y-2">
                  {routeOptions.map((route, index) => {
                    const leg = route.legs[0]
                    const isSelected = index === selectedRouteIndex
                    const routeColors = ['#F1C40F', '#3498DB', '#9B59B6', '#E74C3C', '#2ECC71']
                    const routeColor = routeColors[index % routeColors.length]
                    const optimizationLabel = getRouteOptimizationLabel(route, index, routeOptions, selectedTravelMode)
                    
                    return (
                      <button
                        key={index}
                        onClick={() => selectRoute(index)}
                        className={`w-full p-3 rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-[color:var(--gumo-yellow)] bg-[color:var(--gumo-yellow)]/10' 
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: routeColor }}
                          >
                            {React.createElement(getTravelModeIcon(selectedTravelMode), { 
                              className: "w-4 h-4" 
                            })}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between mb-1">
                              {optimizationLabel && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  index === 0 
                                    ? 'bg-[color:var(--gumo-yellow)]/20 text-[color:var(--gumo-yellow)]' 
                                    : 'bg-white/10 text-[color:var(--gumo-muted)]'
                                }`}>
                                  {optimizationLabel}
                                </span>
                              )}
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-[color:var(--gumo-yellow)]" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1 text-[color:var(--gumo-text)]">
                                <Clock className="w-3 h-3" />
                                {/* Show traffic-aware time for driving, regular duration for others */}
                                <span>
                                  {(leg.duration_in_traffic && selectedTravelMode === 'DRIVING') 
                                    ? leg.duration_in_traffic.text 
                                    : leg.duration?.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[color:var(--gumo-muted)]">
                                <MapPin className="w-3 h-3" />
                                <span>{leg.distance?.text}</span>
                              </div>
                            </div>
                            <p className="text-xs text-[color:var(--gumo-muted)] mt-1">
                              via {route.summary}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                )}

                {/* Selected Route Details */}
                {routeOptions[selectedRouteIndex] && (
                  <div className="p-3 bg-[color:var(--gumo-bg)] rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      {React.createElement(getTravelModeIcon(selectedTravelMode), { 
                        className: "w-4 h-4 text-[color:var(--gumo-yellow)]" 
                      })}
                      <h5 className="text-sm font-medium text-[color:var(--gumo-text)]">
                        {selectedTravelMode === 'DRIVING' && 'Driving Route Details'}
                        {selectedTravelMode === 'WALKING' && 'Walking Route Details'}
                        {selectedTravelMode === 'BICYCLING' && 'Cycling Route Details'}
                        {selectedTravelMode === 'TRANSIT' && 'Transit Route Details'}
                      </h5>
                    </div>
                    <div className="text-xs text-[color:var(--gumo-muted)] space-y-1">
                      <p>Via: {routeOptions[selectedRouteIndex].summary}</p>
                      {selectedTravelMode === 'DRIVING' && (
                        <p>🚗 Car route with traffic considerations</p>
                      )}
                      {selectedTravelMode === 'WALKING' && (
                        <p>🚶 Walking route on pedestrian paths</p>
                      )}
                      {selectedTravelMode === 'BICYCLING' && (
                        <p>🚴 Cycling route on bike-friendly roads</p>
                      )}
                      {selectedTravelMode === 'TRANSIT' && (
                        <p>🚌 Public transport with transfers</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {/* Itinerary Layer Special View */}
            {selectedLayer === 'itinerary' ? (
              <>
                {selectedItineraryId ? (
                  // Show swipeable destination cards for the selected day
                  <>
                    {(() => {
                      const selectedItinerary = loadedItineraries.find(it => it.id === selectedItineraryId)
                      if (!selectedItinerary) {
                        return (
                          <div className="space-y-3 pt-4">
                            <p className="text-sm text-[color:var(--gumo-muted)]">Itinerary not found</p>
                            <button
                              onClick={() => setSelectedItineraryId(null)}
                              className="text-[color:var(--gumo-yellow)] text-sm hover:underline"
                            >
                              ← Back to all itineraries
                            </button>
                          </div>
                        )
                      }
                      
                      const currentDayPlaces = convertItineraryToLocations(selectedItinerary)
                        .filter(dest => dest.category === `day-${selectedItineraryDay + 1}`)
                      
                      if (currentDayPlaces.length === 0) {
                        return (
                          <div className="space-y-3 pt-4 text-center">
                            <p className="text-sm text-[color:var(--gumo-muted)]">No destinations found for Day {selectedItineraryDay + 1}</p>
                          </div>
                        )
                      }
                      
                      return (
                        <div className="space-y-0 -mx-4 -mt-4">
                          {/* Header with day info and navigation */}
                          <div className="px-6 py-4 bg-[color:var(--gumo-surface)] border-b border-white/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-lg font-semibold text-[color:var(--gumo-text)]">
                                  Day {selectedItineraryDay + 1} Destinations
                                </h2>
                                <p className="text-sm text-[color:var(--gumo-muted)]">
                                  {selectedDestinationIndex + 1} of {currentDayPlaces.length}
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedItineraryId(null)}
                                className="text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-text)]"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Swipeable destination cards */}
                          <div className="relative">
                            <div 
                              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                              onScroll={(e) => {
                                const container = e.target as HTMLDivElement
                                const cardWidth = container.clientWidth
                                const scrollLeft = container.scrollLeft
                                const newIndex = Math.round(scrollLeft / cardWidth)
                                if (newIndex !== selectedDestinationIndex) {
                                  handleDestinationFocus(newIndex, currentDayPlaces)
                                }
                              }}
                            >
                              {currentDayPlaces.map((place, index) => (
                                <div 
                                  key={place.id}
                                  className="w-full flex-shrink-0 snap-start"
                                >
                                  {/* Destination card content */}
                                  <div className="bg-[color:var(--gumo-bg)] p-6">
                                    {/* Distance and time header */}
                                    <div className="flex items-baseline gap-4 text-white mb-4">
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">
                                          {index === 0 ? '0.0' : '1.2'}
                                        </span>
                                        <span className="text-sm opacity-70">km</span>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold">
                                          {index === 0 ? '0' : '5'}
                                        </span>
                                        <span className="text-sm opacity-70">min</span>
                                      </div>
                                    </div>

                                    {/* Location number */}
                                    <div className="text-2xl font-bold text-white mb-4">
                                      {index + 1}
                                    </div>

                                    {/* Place info */}
                                    <div className="space-y-4 mb-6">
                                      <div className="flex items-start gap-3">
                                        <div className="bg-[color:var(--gumo-yellow)] text-black text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                          ?
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[color:var(--gumo-text)] text-sm">Entry ticket is</p>
                                          <p className="text-[color:var(--gumo-yellow)] font-semibold">30 INR</p>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-3">
                                        <div className="bg-[color:var(--gumo-yellow)] text-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                          <Star className="w-3 h-3" />
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-[color:var(--gumo-text)] text-sm">
                                            {place.description || `Visit ${place.name}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Timing section */}
                                    <div className="px-4 py-3 bg-[color:var(--gumo-surface)] rounded-xl mb-4">
                                      <div className="flex items-center gap-3">
                                        <div className="bg-[color:var(--gumo-yellow)] text-black text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                          {index + 1}
                                        </div>
                                        <div className="text-[color:var(--gumo-text)] text-sm flex-1">
                                          <span className="font-medium">{place.time || `${9 + index * 2}:00 AM`}</span>
                                          <span className="mx-2">•</span>
                                          <span>Duration 2-3 hours</span>
                                        </div>
                                        <div className="bg-[color:var(--gumo-yellow)] text-black w-6 h-6 rounded-full flex items-center justify-center">
                                          <MapPin className="w-3 h-3" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Main place card */}
                                    <div className="bg-[color:var(--gumo-surface)] rounded-xl p-4 mb-6">
                                      <div className="flex items-center gap-3">
                                        <div className="w-16 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex-shrink-0" />
                                        <div className="flex-1">
                                          <h3 className="text-[color:var(--gumo-text)] font-semibold text-base">
                                            {place.name}
                                          </h3>
                                          <div className="flex items-center gap-1 mt-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-[color:var(--gumo-muted)] text-sm">
                                              {place.rating} • {place.type}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="w-16 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex-shrink-0" />
                                      </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={() => {
                                          window.open(
                                            `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`, 
                                            '_blank'
                                          )
                                        }}
                                        className="flex-1 py-3 px-4 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[color:var(--gumo-yellow)]/90 transition-colors"
                                      >
                                        <Navigation className="w-4 h-4" />
                                        Navigate
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const text = encodeURIComponent(`Check out ${place.name} - ${place.description}`)
                                          window.open(`https://wa.me/?text=${text}`, '_blank')
                                        }}
                                        className="flex-1 py-3 px-4 border border-white/20 text-[color:var(--gumo-text)] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                                      >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Navigation indicators */}
                            <div className="flex justify-center gap-2 py-4 bg-[color:var(--gumo-surface)]">
                              {currentDayPlaces.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    handleDestinationFocus(index, currentDayPlaces)
                                    // Scroll to the card
                                    const container = document.querySelector('.overflow-x-auto') as HTMLDivElement
                                    if (container) {
                                      container.scrollTo({
                                        left: index * container.clientWidth,
                                        behavior: 'smooth'
                                      })
                                    }
                                  }}
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    index === selectedDestinationIndex
                                      ? 'bg-[color:var(--gumo-yellow)]'
                                      : 'bg-white/20'
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Swipe navigation arrows */}
                            {currentDayPlaces.length > 1 && (
                              <>
                                <button
                                  onClick={() => {
                                    const newIndex = Math.max(0, selectedDestinationIndex - 1)
                                    handleDestinationFocus(newIndex, currentDayPlaces)
                                    const container = document.querySelector('.overflow-x-auto') as HTMLDivElement
                                    if (container) {
                                      container.scrollTo({
                                        left: newIndex * container.clientWidth,
                                        behavior: 'smooth'
                                      })
                                    }
                                  }}
                                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[color:var(--gumo-surface)]/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-[color:var(--gumo-surface)] transition-colors"
                                  disabled={selectedDestinationIndex === 0}
                                >
                                  <ChevronLeft className="w-5 h-5 text-[color:var(--gumo-text)]" />
                                </button>
                                <button
                                  onClick={() => {
                                    const newIndex = Math.min(currentDayPlaces.length - 1, selectedDestinationIndex + 1)
                                    handleDestinationFocus(newIndex, currentDayPlaces)
                                    const container = document.querySelector('.overflow-x-auto') as HTMLDivElement
                                    if (container) {
                                      container.scrollTo({
                                        left: newIndex * container.clientWidth,
                                        behavior: 'smooth'
                                      })
                                    }
                                  }}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[color:var(--gumo-surface)]/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-[color:var(--gumo-surface)] transition-colors"
                                  disabled={selectedDestinationIndex === currentDayPlaces.length - 1}
                                >
                                  <ChevronRight className="w-5 h-5 text-[color:var(--gumo-text)]" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </>
                ) : (
                  // Show list of all itineraries (when directly accessing map page)
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-[color:var(--gumo-text)]">Your Itineraries</h3>
                      {itineraryLoading && (
                        <div className="w-4 h-4 border-2 border-[color:var(--gumo-yellow)] border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>
                    
                    {loadedItineraries.length === 0 ? (
                      <div className="text-center py-8 space-y-3">
                        <div className="w-16 h-16 bg-[color:var(--gumo-yellow)]/20 rounded-2xl flex items-center justify-center mx-auto">
                          <MapPin className="w-8 h-8 text-[color:var(--gumo-yellow)]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[color:var(--gumo-text)] mb-1">No itineraries yet</p>
                          <p className="text-xs text-[color:var(--gumo-muted)]">
                            Start a conversation to create your first itinerary
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {loadedItineraries.map((itinerary) => (
                          <div key={itinerary.id} onClick={() => setSelectedItineraryId(itinerary.id)}>
                            <ItinerarySummaryCardV2
                              title={itinerary.title}
                              blurb={itinerary.description}
                              bullets={itinerary.highlights}
                              href={`#itinerary-${itinerary.id}`}
                              imageSrc={itinerary.imageSrc}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* Other layers' UI */
              <div className="space-y-4 pt-4">
                {getAllVisibleLocations().map((location, index) => (
                  <LayerMarker
                    key={location.id}
                    location={location}
                    isSelected={false}
                    onClick={() => setSelectedLocation(location)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </ResizableDrawer>
    </div>
  )
}