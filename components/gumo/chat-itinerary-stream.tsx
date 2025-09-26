"use client"

import { useEffect, useState } from "react"
import SaveableItinerarySummaryCard from "@/components/itinerary/saveable-itinerary-summary-card"

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
        <SaveableItinerarySummaryCard
          key={idx}
          title={s.title}
          blurb={s.blurb}
          bullets={s.bullets}
          href={s.href}
          imageSrc={s.imageSrc}
          chatData={{
            title: s.title,
            description: s.blurb,
            highlights: s.bullets,
            imageSrc: s.imageSrc,
            href: s.href
          }}
          onSaved={(id) => console.log('Itinerary saved from stream:', id)}
          onError={(error) => console.error('Save failed from stream:', error)}
        />
      ))}
    </div>
  )
}
