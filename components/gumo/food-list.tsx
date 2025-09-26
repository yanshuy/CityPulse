"use client"

type FoodItem = { id: string; name: string; area: string; price: string }

const MOCK_FOOD: FoodItem[] = [
    { id: 'f1', name: 'Masala Trails', area: 'Bandra', price: '$$' },
    { id: 'f2', name: 'Coastal Catch', area: 'Juhu', price: '$$' },
    { id: 'f3', name: 'Veg Street', area: 'Dadar', price: '$' },
]

export default function FoodList({ heading }: { heading?: string }) {
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <h3 className="text-base font-semibold">{heading ?? 'Where to eat'}</h3>
            <ul className="mt-3 space-y-3">
                {MOCK_FOOD.map((r) => (
                    <li key={r.id} className="rounded-xl bg-white/5 p-3">
                        <div className="text-sm font-medium">{r.name}</div>
                        <div className="text-xs text-white/60">{r.area} • {r.price}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
