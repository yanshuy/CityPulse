## Itinerary Map View

The itinerary map view renders a geographic visualization of a generated itinerary with:

- Day selector (chip buttons)
- Ordered markers per day (numbered, route polyline)
- Bottom card drawer (horizontal scroll, tap to focus marker)
- Marker <-> card synchronization (tap either to focus)

### Data Requirements

Markers and route lines are only rendered for items that include `coordinates` in the itinerary day items:

```ts
interface ItineraryItem {
	id: string
	name: string
	description?: string
	startTime?: string
	duration?: string
	// ...other fields
	coordinates?: { lat: number; lng: number }
}
```

Items without coordinates are ignored in the map view and a helpful message is shown if a day has none.

### Normalization

The shared utility `convertStoredItineraryToGenerated` (in `lib/itinerary/normalize.ts`) converts persisted DB itineraries or legacy shapes into the `GeneratedItinerary` structure used by both the timeline and map.

### Components

- `ItineraryMapCanvas` – Wraps Google Map, draws polyline + markers + cards.
- `ItineraryDayMap` – Internal logic (marker selection, polyline management, card interaction).

### Environment

Requires a valid Maps JavaScript API key exposed as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

Add to `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Navigation Pattern

From itinerary timeline page a button links to:

```
/itinerary/map?id=<itineraryId>
```

### Future Enhancements (Ideas)

- Geocode enrichment for items missing coordinates.
- Fit bounds across all day markers on day switch.
- Directions API polyline (actual travel path) vs straight-line connection.
- Clustering for dense urban itineraries.
- Export to Google Maps custom list.

### Edge Cases Handled

- Missing itinerary id → error state.
- Day with 0 coordinate items → placeholder message.
- Single coordinate item → no polyline, still centered.

### Styling

Uses existing design tokens / colors: `var(--gumo-bg)` & highlight yellow for active markers / day chips.

---
Generated: keeps this file concise for onboarding future contributors.
