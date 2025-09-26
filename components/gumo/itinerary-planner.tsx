"use client"

import { useState, useEffect } from "react"

interface ItineraryPlannerProps {
  destination?: string
  days?: number
}

export function ItineraryPlanner({
  destination: initialDestination = "",
  days: initialDays,
}: ItineraryPlannerProps) {
  const [destination, setDestination] = useState(initialDestination)
  const [days, setDays] = useState(initialDays?.toString() ?? "")
  const [startDate, setStartDate] = useState("")

  useEffect(() => {
    setDestination(initialDestination)
  }, [initialDestination])

  useEffect(() => {
    setDays(initialDays?.toString() ?? "")
  }, [initialDays])

  return (
    <div className="mt-6 p-4 rounded-2xl bg-[color:var(--gumo-surface)]">
      <h2 className="text-lg font-semibold">Plan your trip</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-white/80">
            Destination
          </label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Mumbai"
            className="mt-1 w-full bg-white/10 rounded-md border-transparent focus:ring-0 focus:outline-none px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="days" className="block text-sm font-medium text-white/80">
            Number of days
          </label>
          <input
            type="number"
            id="days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g., 3"
            className="mt-1 w-full bg-white/10 rounded-md border-transparent focus:ring-0 focus:outline-none px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-white/80">
            Start date (optional)
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 w-full bg-white/10 rounded-md border-transparent focus:ring-0 focus:outline-none px-3 py-2"
          />
        </div>
      </div>
      <button
        onClick={() => alert(`Planning a ${days}-day trip to ${destination} starting on ${startDate || 'any day'}`)}
        className="mt-6 w-full bg-[color:var(--gumo-yellow)] text-black font-semibold py-2.5 rounded-lg"
      >
        Generate Itinerary
      </button>
    </div>
  )
}