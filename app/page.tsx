"use client"

import { TopBar } from "@/components/gumo/top-bar"
import { SuggestionCard } from "@/components/gumo/suggestion-card"
import { BottomNav } from "@/components/gumo/bottom-nav"
import { ChatInput } from "@/components/gumo/chat-input"
import { ItineraryPlanner } from "@/components/gumo/itinerary-planner"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Simple NLP-like function to parse the query
function parseQuery(query: string) {
  const itineraryRegex = /plan(?: a(?:n)?)? (\d+)\s*day itinerary to (.+)/i
  const match = query.match(itineraryRegex)

  if (match) {
    return {
      isItinerary: true,
      days: parseInt(match[1], 10),
      destination: match[2].trim(),
    }
  }

  return { isItinerary: false }
}

export default function Page() {
  const [plannerState, setPlannerState] = useState<{
    show: boolean
    destination?: string
    days?: number
  }>({ show: false })

  const router = useRouter()

  function handleQuery(query: string) {
    const parsed = parseQuery(query)

    if (parsed.isItinerary) {
      setPlannerState({
        show: true,
        destination: parsed.destination,
        days: parsed.days,
      })
    } else {
      // Fallback to the original behavior
      router.push(`/explore?prompt=${encodeURIComponent(query)}`)
    }
  }

  return (
    <main className="min-h-dvh mx-auto max-w-md px-4 pb-24 pt-2 flex flex-col">
      <img
        src="/images/reference/gumo-home.jpg"
        alt=""
        aria-hidden
        className="hidden"
      />

      <TopBar />

      <section className="mt-6">
        <h1 className="text-pretty text-2xl font-medium">
          What's your plan for today?
        </h1>

        {plannerState.show ? (
          <ItineraryPlanner
            destination={plannerState.destination}
            days={plannerState.days}
          />
        ) : (
          <>
            <div className="mt-4 space-y-4">
              <SuggestionCard
                image="/traffic.png"
                title="Check traffic conditions for my commute"
                onClick={() => handleQuery("Check traffic conditions for my commute")}
              />
              <SuggestionCard
                image="/events.png"
                title="Find local events happening this weekend"
                onClick={() => handleQuery("Find local events happening this weekend")}
              />
              <SuggestionCard
                image="/food.png"
                title="Plan a 3 day itinerary to Mumbai"
                onClick={() => handleQuery("Plan a 3 day itinerary to Mumbai")}
              />
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-[15px] leading-6 text-[color:var(--gumo-muted)]">
                Discover how{" "}
                <span className="font-semibold text-[color:var(--gumo-text)]">
                  CityPulse
                </span>
                <br /> can help you?
              </p>
              <a
                href="/about"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-[color:var(--gumo-yellow)]"
              >
                Learn more
                <span aria-hidden>↗</span>
              </a>
            </div>
          </>
        )}
      </section>

      {/* Spacer to push input to bottom on taller screens */}
      <div className="flex-1" />

      <div className="relative">
        <div className="gumo-ambient" />
        <ChatInput onQuerySubmit={handleQuery} />
      </div>

      <div className="fixed inset-x-0 bottom-3">
        <div className="mx-auto max-w-md px-4">
          <BottomNav />
        </div>
      </div>
    </main>
  )
}