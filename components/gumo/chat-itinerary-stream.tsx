"use client"

import { useEffect, useState } from "react"
import ItinerarySummaryCardV2 from "./itinerary-summary-card-v2"

type Summary = {
  title: string
  blurb: string
  bullets: string[]
  href: string
  imageSrc?: string
}

export default function ChatItineraryStream() {
  const [summaries, setSummaries] = useState<Summary[]>([])

  useEffect(() => {
    function onAdd(e: Event) {
      const ce = e as CustomEvent<Summary>
      if (!ce.detail) return
      setSummaries((prev) => [...prev, ce.detail])
    }
    window.addEventListener("gumo:add-itinerary-summary", onAdd as EventListener)
    return () => window.removeEventListener("gumo:add-itinerary-summary", onAdd as EventListener)
  }, [])

  if (summaries.length === 0) return null

  return (
    <div className="mt-4 space-y-4">
      {summaries.map((s, idx) => (
        <ItinerarySummaryCardV2
          key={idx}
          title={s.title}
          blurb={s.blurb}
          bullets={s.bullets}
          href={s.href}
          imageSrc={s.imageSrc}
        />
      ))}
    </div>
  )
}
