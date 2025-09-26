"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import ItinerarySummaryCard from "@/components/gumo/itinerary-summary-card"

export default function PlannerResultsPage({ searchParams }: { searchParams: { plan?: string } }) {
  const router = useRouter()

  const plan = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(searchParams.plan ?? "")) as Array<{ city: string; days: number }>
    } catch {
      return [{ city: "Bangkok", days: 3 }]
    }
  }, [searchParams.plan])

  const city = plan[0]?.city || "Bangkok"

  function viewItinerary() {
    const params = new URLSearchParams()
    params.set("plan", searchParams.plan || "")
    router.push(`/itinerary?${params.toString()}`)
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Your Trip is Ready! 🎉</h1>
        <p className="text-foreground/70">Here's your personalized itinerary</p>
      </div>

      <div onClick={viewItinerary} className="cursor-pointer">
        <ItinerarySummaryCard
          title={`Trip to ${city} (v1)`}
          description={`Immerse yourself in the vibrant tapestry of ${city}, where ancient traditions and modern wonders collide in a captivating city.`}
          items={[
            { title: "Bangkokian Museum" },
            { title: "SOI Bangkok Restaurant" },
            { title: "Asiatique The Riverfront" },
          ]}
          href="#"
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.back()}
          className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium"
        >
          Edit Plan
        </button>
        <button
          onClick={viewItinerary}
          className="flex-1 rounded-full bg-[color:var(--gumo-yellow)] px-4 py-2.5 text-sm font-medium text-black"
        >
          View Details
        </button>
      </div>
    </main>
  )
}
