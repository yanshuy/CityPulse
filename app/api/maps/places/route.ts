export const runtime = 'nodejs'

export async function POST(req: Request) {
    try {
        const { query, location, type } = await req.json()

        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
            return Response.json({
                success: false,
                error: 'Google Maps API key not configured'
            }, { status: 500 })
        }

        // Use Google Places API to search for places
        const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
        placesUrl.searchParams.set('query', `${query} ${location}`)
        placesUrl.searchParams.set('key', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

        if (type) {
            placesUrl.searchParams.set('type', type)
        }

        const response = await fetch(placesUrl.toString())
        const data = await response.json()

        if (data.status !== 'OK') {
            throw new Error(`Google Places API error: ${data.status}`)
        }

        // Transform Google Places data to our format
        const suggestions = data.results.slice(0, 5).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            priceLevel: place.price_level,
            types: place.types,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            photoReference: place.photos?.[0]?.photo_reference,
            businessStatus: place.business_status
        }))

        return Response.json({
            success: true,
            suggestions,
            totalResults: data.results.length
        })

    } catch (error) {
        console.error('Google Places search error:', error)
        return Response.json({
            success: false,
            error: 'Failed to search places',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

// GET method for place details
export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const placeId = url.searchParams.get('placeId')

        if (!placeId) {
            return Response.json({
                success: false,
                error: 'Place ID is required'
            }, { status: 400 })
        }

        if (!process.env.GOOGLE_MAPS_API_KEY) {
            return Response.json({
                success: false,
                error: 'Google Maps API key not configured'
            }, { status: 500 })
        }

        // Get detailed place information
        const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json')
        detailsUrl.searchParams.set('place_id', placeId)
        detailsUrl.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY)
        detailsUrl.searchParams.set('fields', 'name,formatted_address,rating,price_level,opening_hours,website,formatted_phone_number,reviews,photos,geometry,types')

        const response = await fetch(detailsUrl.toString())
        const data = await response.json()

        if (data.status !== 'OK') {
            throw new Error(`Google Places Details API error: ${data.status}`)
        }

        const place = data.result
        const placeDetails = {
            id: placeId,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            priceLevel: place.price_level,
            types: place.types,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
            },
            openingHours: place.opening_hours?.weekday_text,
            website: place.website,
            phoneNumber: place.formatted_phone_number,
            reviews: place.reviews?.slice(0, 3).map((review: any) => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.relative_time_description
            })),
            photos: place.photos?.slice(0, 5).map((photo: any) => photo.photo_reference)
        }

        return Response.json({
            success: true,
            place: placeDetails
        })

    } catch (error) {
        console.error('Google Places details error:', error)
        return Response.json({
            success: false,
            error: 'Failed to get place details',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
