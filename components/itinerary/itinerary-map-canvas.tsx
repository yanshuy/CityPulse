"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import type { GeneratedItinerary, ItineraryItem } from '@/lib/types/component-schemas'

interface Props {
  itinerary: GeneratedItinerary
  day: number
  onSelectDay: (day: number) => void
}

interface CoordItem {
  item: ItineraryItem
  idx: number
  lat: number
  lng: number
}

export function ItineraryDayMap({ itinerary, day, onSelectDay }: Props) {
  const map = useMap()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const polylineRef = useRef<google.maps.Polyline | null>(null)

  const dayPlan = itinerary.days.find(d => d.day === day)
  const coordItems: CoordItem[] = useMemo(() => {
    if (!dayPlan) return []
    return dayPlan.items.map((i, idx) => {
      // Support multiple potential coordinate sources
      const coord = i.coordinates || (i as any).location?.coordinates || (i as any).coords
      if (coord && typeof coord.lat === 'number' && typeof coord.lng === 'number') {
        return { item: i, idx, lat: coord.lat, lng: coord.lng }
      }
      return null
    }).filter(Boolean) as CoordItem[]
  }, [dayPlan])

  // Basic defaults for some popular cities (can expand)
  const cityDefaults: Record<string, { lat: number; lng: number }> = {
    mumbai: { lat: 18.9388, lng: 72.8354 },
    delhi: { lat: 28.6139, lng: 77.2090 },
    bangkok: { lat: 13.7563, lng: 100.5018 },
    jaipur: { lat: 26.9124, lng: 75.7873 },
    goa: { lat: 15.2993, lng: 74.1240 },
    manali: { lat: 32.2396, lng: 77.1887 }
  }

  const center = useMemo(() => {
    if (coordItems.length === 0) {
      const key = itinerary.destination?.toLowerCase()
      if (key && cityDefaults[key]) return cityDefaults[key]
      return { lat: 20.5937, lng: 78.9629 } // India centroid fallback
    }
    if (coordItems.length === 1) return { lat: coordItems[0].lat, lng: coordItems[0].lng }
    const avgLat = coordItems.reduce((s, c) => s + c.lat, 0) / coordItems.length
    const avgLng = coordItems.reduce((s, c) => s + c.lng, 0) / coordItems.length
    return { lat: avgLat, lng: avgLng }
  }, [coordItems])

  // Draw / update polyline
  useEffect(() => {
    if (!map) return
    if (polylineRef.current) polylineRef.current.setMap(null)
    if (coordItems.length < 2) return
    const path = coordItems.map(c => ({ lat: c.lat, lng: c.lng }))
    const polyline = new google.maps.Polyline({
      path,
      strokeColor: '#F1C40F',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map
    })
    polylineRef.current = polyline
    return () => { polyline.setMap(null) }
  }, [map, coordItems])

  // Pan to selected
  useEffect(() => {
    if (!map) return
    const c = coordItems[selectedIndex]
    if (c) {
      map.panTo({ lat: c.lat, lng: c.lng })
    }
  }, [selectedIndex, coordItems, map])

  // Card scroll sync: when user clicks a card, center marker
  const handleMarkerClick = (idx: number) => {
    setSelectedIndex(idx)
    setShowInfo(true)
  }

  return (
    <>
      {coordItems.map(ci => (
        <AdvancedMarker key={ci.item.id} position={{ lat: ci.lat, lng: ci.lng }} onClick={() => handleMarkerClick(ci.idx)}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${ci.idx === selectedIndex ? 'bg-[color:var(--gumo-yellow)] text-black border-white scale-110' : 'bg-white text-black border-black/30'}`}>{ci.idx + 1}</div>
        </AdvancedMarker>
      ))}
      {showInfo && coordItems[selectedIndex] && (
        <InfoWindow position={{ lat: coordItems[selectedIndex].lat, lng: coordItems[selectedIndex].lng }} onCloseClick={() => setShowInfo(false)}>
          <div className="p-2 max-w-xs">
            <h3 className="font-semibold text-sm mb-1">{coordItems[selectedIndex].item.name}</h3>
            <p className="text-xs text-gray-600">{coordItems[selectedIndex].item.description}</p>
          </div>
        </InfoWindow>
      )}
      {/* Day selector overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-2">
        {itinerary.days.map(d => (
          <button key={d.day} onClick={() => onSelectDay(d.day)} className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur bg-black/50 text-white border border-white/10 hover:bg-black/70 ${d.day === day ? '!bg-[color:var(--gumo-yellow)] !text-black border-transparent' : ''}`}>Day {d.day}</button>
        ))}
      </div>
      {/* Cards drawer */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 space-y-4">
        {coordItems.length === 0 && (
          <div className="text-center text-sm text-white/60">No per-item coordinates for Day {day}. Centered on destination city fallback. Edit/re-generate to enrich.</div>
        )}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {coordItems.map(ci => (
            <div key={ci.item.id} onClick={() => setSelectedIndex(ci.idx)} className={`min-w-[260px] rounded-2xl p-4 flex-shrink-0 cursor-pointer border transition-colors ${ci.idx === selectedIndex ? 'bg-gray-800 border-[color:var(--gumo-yellow)]' : 'bg-gray-900 border-transparent hover:border-gray-700'}`}>
              <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{ci.item.name}</h3>
              <p className="text-xs text-white/60 line-clamp-2 mb-2">{ci.item.description}</p>
              <div className="text-[10px] text-white/40 flex gap-2">
                {ci.item.startTime && <span>{ci.item.startTime}</span>}
                {ci.item.duration && <span>• {ci.item.duration}</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-white/40">Tap a card or marker to focus. Route line shows visit order.</div>
      </div>
    </>
  )
}

export function ItineraryMapCanvas({ itinerary, day, onSelectDay }: Props) {
  const dayPlan = itinerary.days.find(d => d.day === day)
  const coordItems = dayPlan?.items.filter(i => i.coordinates) || []
  const first = coordItems[0]
  const center = first ? { lat: first.coordinates!.lat, lng: first.coordinates!.lng } : { lat: 20.5937, lng: 78.9629 }
  return (
    <Map mapId="itinerary-day-map" defaultZoom={13} center={center} gestureHandling="greedy" disableDefaultUI className="h-full w-full">
      <ItineraryDayMap itinerary={itinerary} day={day} onSelectDay={onSelectDay} />
    </Map>
  )
}
