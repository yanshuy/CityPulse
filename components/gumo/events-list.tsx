"use client"

type EventItem = { id: string; title: string; when: string; where: string }

const MOCK_EVENTS: EventItem[] = [
    { id: 'e1', title: 'Sunset Music Fest', when: 'This weekend', where: 'Central Park' },
    { id: 'e2', title: 'Street Food Carnival', when: 'Tonight', where: 'Riverside' },
    { id: 'e3', title: 'Art Walk', when: 'Tomorrow', where: 'Old Town' },
]

export default function EventsList({ heading }: { heading?: string }) {
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <h3 className="text-base font-semibold">{heading ?? 'Local events'}</h3>
            <ul className="mt-3 space-y-3">
                {MOCK_EVENTS.map((ev) => (
                    <li key={ev.id} className="rounded-xl bg-white/5 p-3">
                        <div className="text-sm font-medium">{ev.title}</div>
                        <div className="text-xs text-white/60">{ev.when} • {ev.where}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
