"use client"

type FoodData = {
    heading: string
    location: string
    cuisine?: string
    restaurants: Array<{
        name: string
        cuisine: string
        rating: number
        priceRange: string
        location: string
        specialty: string
        description: string
        estimatedCost: string
        timings: string
        image?: string
    }>
    totalFound: number
    suggestion: string
}

type FoodItem = { id: string; name: string; area: string; price: string }

const MOCK_FOOD: FoodItem[] = [
    { id: 'f1', name: 'Masala Trails', area: 'Bandra', price: '$$' },
    { id: 'f2', name: 'Coastal Catch', area: 'Juhu', price: '$$' },
    { id: 'f3', name: 'Veg Street', area: 'Dadar', price: '$' },
]

interface FoodListProps {
    data?: FoodData
    heading?: string // Legacy prop for backward compatibility
}

export default function FoodList({ data, heading }: FoodListProps) {
    const displayHeading = data?.heading || heading || 'Where to eat'
    const restaurantsToShow = data?.restaurants || MOCK_FOOD.map(food => ({
        name: food.name,
        cuisine: 'Indian',
        rating: 4.2,
        priceRange: food.price,
        location: food.area,
        specialty: 'Local favorites',
        description: '',
        estimatedCost: '₹500 for two',
        timings: '12:00 PM - 11:00 PM'
    }))

    const getRatingStars = (rating: number) => {
        return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '☆' : '')
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--gumo-surface)] p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{displayHeading}</h3>
                {data?.totalFound && (
                    <span className="text-xs text-white/60">{data.totalFound} options</span>
                )}
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

            {data?.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-white/70">{data.suggestion}</p>
                </div>
            )}
        </div>
    )
}
