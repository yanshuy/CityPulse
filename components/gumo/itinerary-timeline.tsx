"use client"

import { PoiCard } from "./poi-card"

type Segment = {
  distanceKm: number
  travelMinutes: number
}

type POI = Parameters<typeof PoiCard>[0]["poi"]

type DayPlan = {
  label: string
  items: Array<{ poi: POI; segmentAfter?: Segment }>
}

export function ItineraryTimeline({ day }: { day: DayPlan }) {
  return (
    <section aria-label={`Timeline for ${day.label}`} className="relative">
      <ol className="relative">
        {day.items.map((item, idx) => (
          <li key={idx} className="relative pl-10">
            {/* vertical line */}
            <span className="absolute left-4 top-0 bottom-0 w-px bg-[color:var(--border)]" aria-hidden />
            {/* node */}
            <span
              className="absolute left-3 top-6 h-5 w-5 rounded-full bg-background ring-2 ring-[color:var(--border)] grid place-items-center"
              aria-hidden
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--primary)]" />
            </span>
            <PoiCard poi={item.poi} />
            {item.segmentAfter ? (
              <div className="pl-2 py-4 text-sm text-muted-foreground flex items-center gap-6">
                <div>
                  <div className="text-base font-medium">{item.segmentAfter.distanceKm.toFixed(1)} km</div>
                  <div className="text-xs">distance</div>
                </div>
                <div>
                  <div className="text-base font-medium">{item.segmentAfter.travelMinutes} min</div>
                  <div className="text-xs">travel time</div>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
