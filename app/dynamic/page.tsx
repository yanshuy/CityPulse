"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { buildPlannerParams, parseItineraryIntent } from "@/lib/dynamic/intent-parser"
import { useState } from "react"

export default function DynamicPlayground() {
  const [q, setQ] = useState("plan a 3 day itinerary to mumbai")
  const router = useRouter()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const intent = parseItineraryIntent(q)
    const params = buildPlannerParams(intent)
    router.push(`/planner?${params.toString()}`)
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Dynamic UI Core — Playground</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-white/10 bg-background px-3 py-2 outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask: plan a 3 day itinerary to mumbai"
        />
        <button className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-medium text-black" type="submit">
          Plan
        </button>
      </form>
      <p className="mt-3 text-sm text-foreground/60">
        Submitting will parse your query and prefill the Planner form with slots.
      </p>
    </main>
  )
}
