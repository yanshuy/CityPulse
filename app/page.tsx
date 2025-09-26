"use client"

import { TopBar } from "@/components/gumo/top-bar"
import { SuggestionCard } from "@/components/gumo/suggestion-card"
import { BottomNav } from "@/components/gumo/bottom-nav"
import { ChatInput } from "@/components/gumo/chat-input"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  async function handleQuery(query: string) {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const { type, destination, days, searchQuery, timeframe } = result.data

        console.log('AI Response:', result.data)

        // Handle different query types with available components
        switch (type) {
          case 'itinerary':
            // Route to planner page with extracted parameters
            const params = new URLSearchParams()
            if (destination) params.set('loc', destination)
            if (days) params.set('days', days.toString())
            params.set('q', query)
            router.push(`/planner?${params.toString()}`)
            break

          case 'traffic':
            // Route to explore with traffic-specific search
            router.push(`/explore?prompt=${encodeURIComponent('traffic conditions ' + (searchQuery || query))}`)
            break

          case 'events':
            // Route to explore with events search
            const eventsQuery = timeframe ? `events ${timeframe}` : 'local events'
            router.push(`/explore?prompt=${encodeURIComponent(searchQuery || eventsQuery)}`)
            break

          case 'food':
            // Route to explore with food search
            router.push(`/explore?prompt=${encodeURIComponent(searchQuery || 'restaurants food')}`)
            break

          case 'explore':
            // Route to explore page with search query
            router.push(`/explore?prompt=${encodeURIComponent(searchQuery || query)}`)
            break

          default:
            // Fallback for general queries
            router.push(`/explore?prompt=${encodeURIComponent(query)}`)
        }
      } else {
        // Fallback if AI processing fails
        router.push(`/explore?prompt=${encodeURIComponent(query)}`)
      }

    } catch (error) {
      console.error('Error processing query:', error)
      // Fallback to original behavior
      router.push(`/explore?prompt=${encodeURIComponent(query)}`)
    } finally {
      setIsProcessing(false)
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
              {isProcessing ? "Processing your request..." : "Discover how"}{" "}
              <span className="font-semibold text-[color:var(--gumo-text)]">
                CityPulse
              </span>
              {!isProcessing && <br />}
              {!isProcessing && " can help you?"}
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
      </section>

      {/* Spacer to push input to bottom on taller screens */}
      <div className="flex-1" />

      <div className="relative">
        <div className="gumo-ambient" />
        <ChatInput onQuerySubmit={handleQuery} disabled={isProcessing} />
      </div>

      <div className="fixed inset-x-0 bottom-3">
        <div className="mx-auto max-w-md px-4">
          <BottomNav />
        </div>
      </div>
    </main>
  )
}
