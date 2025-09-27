"use client"

/**
 * Custom directions service that uses the Google Maps DirectionsService
 * but works with the vis.gl React Google Maps library
 */

import { useEffect, useState } from "react"

declare global {
  interface Window {
    google: any
  }
}

export interface DirectionsRequest {
  origin: google.maps.LatLngLiteral | string
  destination: google.maps.LatLngLiteral | string
  travelMode?: google.maps.TravelMode
  waypoints?: google.maps.DirectionsWaypoint[]
  optimizeWaypoints?: boolean
  provideRouteAlternatives?: boolean
  avoidFerries?: boolean
  avoidHighways?: boolean
  avoidTolls?: boolean
  unitSystem?: google.maps.UnitSystem
}

export interface DirectionsResult {
  routes: Route[]
  request: DirectionsRequest
}

export interface Route {
  bounds: google.maps.LatLngBounds
  legs: RouteLeg[]
  overview_path: google.maps.LatLng[]
  overview_polyline: string
  warnings: string[]
  waypoint_order: number[]
}

export interface RouteLeg {
  distance: TextValue
  duration: TextValue
  end_address: string
  end_location: google.maps.LatLng
  start_address: string
  start_location: google.maps.LatLng
  steps: RouteStep[]
}

export interface RouteStep {
  distance: TextValue
  duration: TextValue
  end_location: google.maps.LatLng
  instructions: string
  path: google.maps.LatLng[]
  start_location: google.maps.LatLng
  travel_mode: google.maps.TravelMode
  maneuver?: string
}

export interface TextValue {
  text: string
  value: number
}

/**
 * Custom hook to use the Google Maps DirectionsService
 */
export function useCustomDirectionsService() {
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    // Initialize the DirectionsService when the component mounts and Google Maps is fully loaded
    const initializeDirectionsService = () => {
      if (window.google && window.google.maps && window.google.maps.DirectionsService) {
        try {
          setDirectionsService(new window.google.maps.DirectionsService())
        } catch (error) {
          console.error("Error initializing DirectionsService:", error)
        }
      } else {
        // If Google Maps API is not fully loaded yet, retry after a short delay
        timeoutId = setTimeout(initializeDirectionsService, 500)
      }
    }

    initializeDirectionsService()

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  /**
   * Get directions between two points
   */
  const getDirections = async (request: DirectionsRequest): Promise<DirectionsResult | null> => {
    if (!directionsService) {
      console.error("DirectionsService not initialized")
      return null
    }

    try {
      const result = await directionsService.route({
        origin: request.origin,
        destination: request.destination,
        travelMode: request.travelMode || window.google.maps.TravelMode.DRIVING,
        waypoints: request.waypoints,
        optimizeWaypoints: request.optimizeWaypoints,
        provideRouteAlternatives: request.provideRouteAlternatives,
        avoidFerries: request.avoidFerries,
        avoidHighways: request.avoidHighways,
        avoidTolls: request.avoidTolls,
        unitSystem: request.unitSystem,
      })

      return result as unknown as DirectionsResult
    } catch (error) {
      console.error("Error fetching directions:", error)
      return null
    }
  }

  return { getDirections, isLoaded: !!directionsService }
}
