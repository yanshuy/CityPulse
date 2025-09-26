import PlannerForm from "@/components/planner/planner-form"
import { parseItineraryIntent } from "@/lib/dynamic/intent-parser"

export default function PlannerPage({
  searchParams,
}: {
  searchParams: { q?: string; days?: string; loc?: string }
}) {
  const q = searchParams.q || ""
  // Run parser server-side to normalize initial slots (also supports direct days/loc params)
  const parsed = parseItineraryIntent(q)
  const days = searchParams.days || (parsed.days ? String(parsed.days) : undefined)
  const loc = searchParams.loc || (parsed.locations[0]?.city ?? undefined)

  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (days) params.set("days", days)
  if (loc) params.set("loc", loc)

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-pretty text-2xl font-semibold">Itinerary Planner</h1>
        <div className="text-sm text-foreground/60">
          {q ? <span>“{q}”</span> : <span>Start with a destination and days</span>}
        </div>
      </header>

      {/* Preserve normalized slots on the client via URL search params */}
      <PlannerForm />
    </main>
  )
}
