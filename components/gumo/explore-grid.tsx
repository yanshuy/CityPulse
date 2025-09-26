"use client"

type Place = { id: string; title: string; image: string; caption?: string }

const PLACES: Place[] = [
    { id: 'p1', title: 'Sunset Point', image: '/beach-sunset.jpg', caption: 'Great for evenings' },
    { id: 'p2', title: 'Forest Trail', image: '/hiker-on-trail.jpg', caption: 'Easy 2km hike' },
    { id: 'p3', title: 'City Museum', image: '/bangkok-museum-photo.jpg', caption: 'Open till 6pm' },
]

export default function ExploreGrid({ heading }: { heading?: string }) {
    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <h3 className="text-base font-semibold">{heading ?? 'Explore ideas nearby'}</h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
                {PLACES.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl bg-white/5">
                        <div className="aspect-[4/3] w-full overflow-hidden">
                            <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="p-2">
                            <div className="truncate text-xs font-medium">{p.title}</div>
                            {p.caption && <div className="truncate text-[10px] text-white/60">{p.caption}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
