import Link from 'next/link'

export default function TestItineraryMapPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🗺️ Itinerary Map View Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test the New Map View</h2>
          <p className="text-gray-600 mb-6">
            Click the link below to test the detailed itinerary map view with:
          </p>
          
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>Date badges</strong> at the top to switch between days</li>
            <li><strong>Interactive map</strong> with destination markers and routes</li>
            <li><strong>Swipeable drawer</strong> cards (swipe left/right or use arrow buttons)</li>
            <li><strong>Synchronized navigation</strong> between map markers and drawer cards</li>
            <li><strong>Google Maps integration</strong> for navigation and sharing</li>
          </ul>

          <Link
            href="/itinerary/sample-mumbai-trip?plan=%5B%7B%22city%22%3A%22Mumbai%22%2C%22days%22%3A3%7D%5D"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            🚀 Test Mumbai 3-Day Itinerary Map
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">📱 Mobile Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✅ Touch/swipe support for destination cards</li>
              <li>✅ Responsive drawer that adapts to screen size</li>
              <li>✅ Native mobile navigation integration</li>
              <li>✅ WhatsApp sharing functionality</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🖥️ Desktop Features</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✅ Mouse drag support for destination cards</li>
              <li>✅ Keyboard navigation with arrow keys</li>
              <li>✅ Hover states and interactive feedback</li>
              <li>✅ Full-screen map experience</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🧪 How to Test:</h3>
          <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
            <li>Click the test link above to open the map view</li>
            <li>Try switching between different days using the date badges</li>
            <li>Swipe left/right on the destination cards (mobile) or use arrow buttons</li>
            <li>Click on map markers to select different destinations</li>
            <li>Test the "Open in Google Maps" and "WhatsApp" buttons</li>
            <li>Try the back button to return to the previous page</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/profile"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ← Back to Profile to see saved itineraries
          </Link>
        </div>
      </div>
    </div>
  )
}