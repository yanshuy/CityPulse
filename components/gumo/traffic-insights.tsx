"use client"

import { useRouter } from "next/navigation"
import { TrafficInsightsProps } from "@/lib/types/component-schemas"

export default function TrafficInsights({ data }: TrafficInsightsProps) {
    const router = useRouter()

    // Use AI data directly
    const trafficStatus = data.currentStatus
    const incidentCount = data.incidents.length
    const estimatedDelay = data.estimatedDelay
    const route = data.route

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'light': return 'text-green-400'
            case 'moderate': return 'text-yellow-400'
            case 'heavy': return 'text-orange-400'
            case 'severe': return 'text-red-400'
            default: return 'text-white/80'
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)]">
            <div className="relative h-28 w-full overflow-hidden">
                <img src="/traffic.png" alt="Traffic" className="h-full w-full object-cover" />
            </div>
            <div className="p-4">
                <h3 className="text-base font-semibold">{route}</h3>
                {data && (
                    <p className="text-sm text-white/70 mt-1">
                        {data.fromLocation} → {data.toLocation}
                    </p>
                )}

                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-white/80">
                    <div className="rounded-lg bg-white/5 p-2">
                        <div className="text-xs text-white/60">Congestion</div>
                        <div className={`font-semibold capitalize ${getStatusColor(trafficStatus)}`}>
                            {trafficStatus}
                        </div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2">
                        <div className="text-xs text-white/60">Incidents</div>
                        <div className="font-semibold">{incidentCount} nearby</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-2">
                        <div className="text-xs text-white/60">ETA impact</div>
                        <div className="font-semibold">{estimatedDelay}</div>
                    </div>
                </div>

                {data?.suggestion && (
                    <div className="mt-3 p-3 rounded-lg bg-white/5">
                        <p className="text-sm text-white/80">{data.suggestion}</p>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                    <button
                        className="rounded-xl bg-[color:var(--gumo-yellow)] px-4 py-2 text-sm font-medium text-black"
                        onClick={() => router.push('/explore')}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    )
}
