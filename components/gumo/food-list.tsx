"use client"

import { FoodListProps } from "@/lib/types/component-schemas"

export default function FoodList({ data }: FoodListProps) {
    const displayHeading = data.heading
    const restaurantsToShow = data.restaurants

    const getRatingStars = (rating: number) => {
        return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '')
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{displayHeading}</h3>
                <span className="text-xs text-white/60">{data.totalFound} options</span>
            </div>

            <ul className="mt-3 space-y-3">
                {restaurantsToShow.slice(0, 4).map((restaurant, index) => (
                    <li key={`restaurant-${index}`} className="rounded-xl bg-white/5 p-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="text-sm font-medium">{restaurant.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-yellow-400">
                                        {getRatingStars(restaurant.rating)}
                                    </span>
                                    <span className="text-xs text-white/60">
                                        {restaurant.rating}
                                    </span>
                                    <span className="text-xs text-white/60">•</span>
                                    <span className="text-xs text-white/60">{restaurant.cuisine}</span>
                                </div>
                                <div className="text-xs text-white/60 mt-1">
                                    {restaurant.location} • {restaurant.priceRange}
                                </div>
                                <div className="text-xs text-white/70 mt-1">
                                    {restaurant.specialty}
                                </div>
                            </div>
                            <div className="text-xs text-white/80 ml-2">
                                {restaurant.estimatedCost}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {data.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/70">{data.suggestion}</p>
                </div>
            )}
        </div>
    )
}
