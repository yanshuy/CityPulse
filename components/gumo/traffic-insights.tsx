"use client"

import { useRouter } from "next/navigation"

export default function TrafficInsights({ query }: { query?: string }) {
    const router = useRouter()
    const prompt = `traffic conditions ${query ?? "near me"}`

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)]">
            <div className="relative h-28 w-full overflow-hidden">
                <img src="/traffic.png" alt="Traffic" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
                <h3 className="text-base font-semibold">Live traffic snapshot</h3>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-white/80">
                    <div className="rounded-lg bg-white/5 p-2"><div className="text-xs text-white/60">Congestion</div><div className="font-semibold">Moderate</div></div>
                    <div className="rounded-lg bg-white/5 p-2"><div className="text-xs text-white/60">Incidents</div><div className="font-semibold">2 nearby</div></div>
                    <div className="rounded-lg bg-white/5 p-2"><div className="text-xs text-white/60">ETA impact</div><div className="font-semibold">+8 min</div></div>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <button
                        className="rounded-xl bg-[color:var(--gumo-yellow)] px-4 py-2 text-sm font-medium text-black"
                        onClick={() => router.push(`/explore?prompt=${encodeURIComponent(prompt)}`)}
                    >
                        Open in Explore
                    </button>
                </div>
            </div>
        </div>
    )
}
