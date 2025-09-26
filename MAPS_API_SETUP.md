# Google Maps API Configuration

## Required Environment Variables

Add these to your `.env.local` file:

```
# Google Maps API Key (required for place search and suggestions)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Setup Instructions

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Places API
     - Places API (New)
     - Maps JavaScript API (if using maps)
   
2. **Create API Key:**
   - Go to Credentials → Create Credentials → API Key
   - Copy the generated key
   
3. **Restrict API Key (Recommended):**
   - Edit the API key
   - Add application restrictions (HTTP referrers for web)
   - Add API restrictions (limit to Places API)

4. **Add to Environment:**
   ```bash
   echo "GOOGLE_MAPS_API_KEY=your_actual_key_here" >> .env.local
   ```

## Features Enabled

With the Google Maps API integration, users can:

- **Search Real Places:** Find actual restaurants, attractions, and activities
- **AI-Powered Suggestions:** Get context-aware alternatives based on preferences
- **Edit Itineraries:** Remove, replace, or add items to any day
- **Real-Time Data:** Access current ratings, addresses, and details
- **Smart Replacements:** Get relevant alternatives when editing items

## API Endpoints

- `/api/maps/places` - Search and get place details
- `/api/ai-suggestions` - AI-powered alternative suggestions
- `/api/generate-itinerary` - Generate complete itineraries

## Cost Considerations

Google Places API charges per request:
- Text Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests

Consider implementing caching for production use.