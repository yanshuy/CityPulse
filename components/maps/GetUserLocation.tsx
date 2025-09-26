"use client"

import React, { useState, useEffect } from "react"
import { MapPin, ChevronDown } from "lucide-react"

interface GetUserLocationProps {
  divcolor?: string
  textcolor1?: string
  textcolor2?: string
  iconcolor?: string
  onLocationUpdate?: (location: { lat: number; lng: number }, address: string) => void
}

const GetUserLocation: React.FC<GetUserLocationProps> = ({ 
  divcolor = "bg-[color:var(--gumo-surface)]", 
  textcolor1 = "text-[color:var(--gumo-muted)]", 
  textcolor2 = "text-[color:var(--gumo-text)]", 
  iconcolor = "text-[color:var(--gumo-yellow)]",
  onLocationUpdate
}) => {
  const [userLocation, setUserLocation] = useState<string>("Loading location...")
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              {
                headers: {
                  "User-Agent": "CityPulse App (citypulse@example.com)", 
                },
              }
            )
            const data = await response.json()
            const address = data.display_name || "Location not found"
            setUserLocation(address)
            
            // Call the callback with location data
            if (onLocationUpdate) {
              onLocationUpdate({ lat: latitude, lng: longitude }, address)
            }
          } catch (error) {
            setUserLocation("Error fetching location")
            console.error("Error fetching location:", error)
          }
        },
        (error) => {
          setUserLocation("Error getting location")
          console.error("Error getting location:", error)
        }
      )
    }
  }, [onLocationUpdate])

  const truncateLocation = (location: string) => {
    const words = location.split(" ")
    return words.length > 2 ? words.slice(0, 2).join(" ") + "..." : location
  }

  return (
    <button
      onClick={() => setIsLocationExpanded(!isLocationExpanded)}
      className={`${divcolor} flex flex-col gap-2 rounded-lg p-3 transition-all duration-200 w-full shadow-sm border border-white/10`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`${textcolor1} text-sm pl-0.5`}>Your location</span>
        <ChevronDown
          className={`w-4 h-4 ${textcolor1} transition-transform duration-200 ${isLocationExpanded ? "rotate-180" : ""}`}
        />
      </div>
      <div className="flex items-start gap-2">
        <MapPin className={`${iconcolor} w-5 h-5 flex-shrink-0`} />
        <p className={`${textcolor2} text-sm text-start font-medium ${!isLocationExpanded ? "whitespace-nowrap overflow-hidden text-ellipsis" : "whitespace-normal"}`}>
          {isLocationExpanded ? userLocation : truncateLocation(userLocation)}
        </p>
      </div>
    </button>
  )
}

export default GetUserLocation