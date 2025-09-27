"use client"

/**
 * Component to display directions information in a panel
 */

import type React from "react"
import type { DirectionsResult } from "./directions-service"
import { Clock, Navigation } from "lucide-react"

interface DirectionsPanelProps {
  directions: DirectionsResult | null
  className?: string
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({ directions, className }) => {
  if (!directions || !directions.routes || directions.routes.length === 0) {
    return null
  }

  const route = directions.routes[0]
  const leg = route.legs[0] // For simplicity, we'll just show the first leg

  // Calculate total distance and duration
  const totalDistance = leg.distance.text
  const totalDuration = leg.duration.text

  return (
    <div className={`bg-[color:var(--gumo-surface)] rounded-2xl p-4 ${className}`}>
      <div className="pb-2">
        <h3 className="text-lg font-semibold flex items-center text-[color:var(--gumo-text)]">
          <Navigation className="w-5 h-5 mr-2" />
          Directions
        </h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-[color:var(--gumo-muted)] mb-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {totalDuration}
          </div>
          <div>{totalDistance}</div>
        </div>

        <div className="space-y-4">
          {/* Origin */}
          <div className="flex items-start">
            <div className="flex flex-col items-center mr-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <div className="w-0.5 h-full bg-[color:var(--gumo-muted)]/30 mt-1"></div>
            </div>
            <div>
              <p className="font-medium text-[color:var(--gumo-text)]">{leg.start_address.split(",")[0]}</p>
              <p className="text-sm text-[color:var(--gumo-muted)]">{leg.start_address}</p>
            </div>
          </div>

          {/* Steps */}
          {leg.steps.map((step, index) => (
            <div key={index} className="flex items-start">
              <div className="flex flex-col items-center mr-3">
                <div className="w-2 h-2 rounded-full bg-[color:var(--gumo-muted)] mt-2"></div>
                <div className="w-0.5 h-full bg-[color:var(--gumo-muted)]/30 mt-1"></div>
              </div>
              <div className="text-sm">
                <div 
                  className="text-[color:var(--gumo-text)]"
                  dangerouslySetInnerHTML={{ __html: step.instructions }} 
                />
                <div className="text-xs text-[color:var(--gumo-muted)] mt-1">
                  {step.distance.text} · {step.duration.text}
                </div>
              </div>
            </div>
          ))}

          {/* Destination */}
          <div className="flex items-start">
            <div className="flex flex-col items-center mr-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
            </div>
            <div>
              <p className="font-medium text-[color:var(--gumo-text)]">{leg.end_address.split(",")[0]}</p>
              <p className="text-sm text-[color:var(--gumo-muted)]">{leg.end_address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
