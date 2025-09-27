"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Marker, useMap } from "@vis.gl/react-google-maps"
import type { DirectionsResult } from "./directions-service"

interface DirectionsRendererProps {
  directions: DirectionsResult | null
  options?: {
    polylineOptions?: {
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
    }
    markerOptions?: {
      origin?: {
        icon?: string
        label?: string
      }
      destination?: {
        icon?: string
        label?: string
      }
      waypoints?: {
        icon?: string
        label?: string
      }
    }
    suppressMarkers?: boolean
    preserveViewport?: boolean
  }
}

export const CustomDirectionsRenderer: React.FC<DirectionsRendererProps> = ({ directions, options = {} }) => {
  const map = useMap()
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([])
  const [markers, setMarkers] = useState<{
    origin: google.maps.LatLngLiteral | null
    destination: google.maps.LatLngLiteral | null
    waypoints: google.maps.LatLngLiteral[]
  }>({
    origin: null,
    destination: null,
    waypoints: [],
  })

  // Cleanup polyline on unmount
  useEffect(() => {
    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }
    }
  }, [])

  useEffect(() => {
    if (!directions || !directions.routes || directions.routes.length === 0) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }
      setPath([])
      setMarkers({ origin: null, destination: null, waypoints: [] })
      return
    }

    // Get the first route
    const route = directions.routes[0]

    // Extract path from the route's overview_path
    const newPath = route.overview_path.map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }))
    setPath(newPath)

    // Extract markers from the route's legs
    if (route.legs.length > 0) {
      const firstLeg = route.legs[0]
      const lastLeg = route.legs[route.legs.length - 1]

      setMarkers({
        origin: {
          lat: firstLeg.start_location.lat(),
          lng: firstLeg.start_location.lng(),
        },
        destination: {
          lat: lastLeg.end_location.lat(),
          lng: lastLeg.end_location.lng(),
        },
        waypoints: route.legs.slice(0, -1).map((leg) => ({
          lat: leg.end_location.lat(),
          lng: leg.end_location.lng(),
        })),
      })
    }

    // Update polyline
    if (map) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null)
      }
      polylineRef.current = new google.maps.Polyline({
        path: newPath,
        strokeColor: options.polylineOptions?.strokeColor || "#4361ee",
        strokeOpacity: options.polylineOptions?.strokeOpacity || 0.8,
        strokeWeight: options.polylineOptions?.strokeWeight || 5,
        clickable: false,
        zIndex: 1,
        map: map,
      })
    }

    // Fit the map to the route bounds if preserveViewport is not set to true
    if (!options.preserveViewport && map) {
      const bounds = new window.google.maps.LatLngBounds()
      route.overview_path.forEach((latLng) => {
        bounds.extend(latLng)
      })
      map.fitBounds(bounds)
    }
  }, [directions, map, options])

  if (!directions || path.length === 0) {
    return null
  }

  return (
    <>
      {/* Render markers if not suppressed */}
      {!options.suppressMarkers && (
        <>
          {markers.origin && (
            <Marker
              position={markers.origin}
              clickable={false}
            />
          )}

          {markers.destination && (
            <Marker
              position={markers.destination}
              clickable={false}
            />
          )}

          {markers.waypoints.map((waypoint, index) => (
            <Marker
              key={`waypoint-${index}`}
              position={waypoint}
              clickable={false}
            />
          ))}
        </>
      )}
    </>
  )
}
