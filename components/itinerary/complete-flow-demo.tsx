'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SaveItineraryButton } from '@/components/itinerary/save-itinerary-button'
import SaveableItinerarySummaryCard from '@/components/itinerary/saveable-itinerary-summary-card'
import { itineraryDB, type Itinerary } from '@/lib/db/itinerary-db'

// Mock itinerary data that would come from chat
const mockChatItineraries = [
  {
    title: 'Amazing Mumbai Adventure',
    blurb: 'Experience the vibrant culture, street food, and iconic landmarks of Mumbai in this comprehensive 5-day adventure.',
    bullets: [
      'Explore the Gateway of India',
      'Try authentic street food at Mohammed Ali Road', 
      'Take a ferry to Elephanta Caves'
    ],
    href: '/itinerary?plan=mumbai-5-days',
    imageSrc: '/sea-facing-villa-in-goa.jpg',
    chatData: {
      destination: 'Mumbai',
      days: 5,
      highlights: [
        'Explore the Gateway of India',
        'Try authentic street food at Mohammed Ali Road', 
        'Take a ferry to Elephanta Caves',
        'Walk along Marine Drive at sunset'
      ]
    }
  },
  {
    title: '3-Day Delhi Heritage Tour',
    blurb: 'Discover the rich history and culture of India\'s capital city with visits to iconic monuments and bustling markets.',
    bullets: [
      'Visit Red Fort and Jama Masjid',
      'Explore Chandni Chowk markets',
      'See India Gate and Rashtrapati Bhavan'
    ],
    href: '/itinerary?plan=delhi-3-days',
    imageSrc: '/himachal-pradesh-mountains.jpg',
    chatData: {
      destination: 'Delhi',
      days: 3,
      highlights: [
        'Visit Red Fort and Jama Masjid',
        'Explore Chandni Chowk markets',
        'See India Gate and Rashtrapati Bhavan',
        'Try street food at Paranthe Wali Gali'
      ]
    }
  }
]

export function CompleteFlowDemo() {
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(false)

  const loadSavedItineraries = async () => {
    try {
      setLoading(true)
      await itineraryDB.init()
      const saved = await itineraryDB.getAllItineraries()
      setSavedItineraries(saved)
    } catch (error) {
      console.error('Error loading itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllItineraries = async () => {
    if (confirm('Are you sure you want to clear all saved itineraries?')) {
      try {
        for (const itinerary of savedItineraries) {
          await itineraryDB.deleteItinerary(itinerary.id)
        }
        setSavedItineraries([])
      } catch (error) {
        console.error('Error clearing itineraries:', error)
      }
    }
  }

  useEffect(() => {
    loadSavedItineraries()
  }, [])

  const handleSaved = (id: string) => {
    console.log('Itinerary saved:', id)
    loadSavedItineraries() // Refresh the list
  }

  const handleError = (error: string) => {
    console.error('Save error:', error)
    alert(`Error saving itinerary: ${error}`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Chat to Profile Flow Demo</h1>
        <p className="text-gray-600">
          This demonstrates the complete flow from chat-generated itineraries to saved profile items
        </p>
      </div>

      {/* Mock Chat Interface */}
      <div className="bg-gray-900 text-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📱 Simulated Chat Interface</h2>
        
        <div className="space-y-6">
          {mockChatItineraries.map((itinerary, index) => (
            <div key={index} className="space-y-3">
              {/* AI Response */}
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-300 mb-2">🤖 CityPulse AI</p>
                <p>I've created a perfect itinerary for {itinerary.chatData.destination}!</p>
              </div>

              {/* Itinerary Card with Save Button */}
              <SaveableItinerarySummaryCard
                title={itinerary.title}
                blurb={itinerary.blurb}
                bullets={itinerary.bullets}
                href={itinerary.href}
                imageSrc={itinerary.imageSrc}
                chatData={{
                  title: itinerary.title,
                  description: itinerary.blurb,
                  destinations: [{ city: itinerary.chatData.destination, days: itinerary.chatData.days }],
                  highlights: itinerary.chatData.highlights,
                  imageSrc: itinerary.imageSrc
                }}
                onSaved={handleSaved}
                onError={handleError}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">👤 Profile Page Preview</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadSavedItineraries}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllItineraries}>
                Clear All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('/profile', '_blank')}
              >
                Open Full Profile
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading saved itineraries...</p>
            </div>
          ) : savedItineraries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Itineraries</h3>
              <p className="text-gray-500 mb-4">Save some itineraries from the chat above to see them here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                ✅ {savedItineraries.length} itineraries saved successfully!
              </p>
              {savedItineraries.map((itinerary) => (
                <div key={itinerary.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{itinerary.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{itinerary.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>📍 {itinerary.destinations.map(d => `${d.city} (${d.days} days)`).join(', ')}</span>
                        <span className="ml-4">📅 {new Date(itinerary.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Highlights: </span>
                        <span className="text-xs text-gray-700">{itinerary.highlights.slice(0, 2).join(', ')}...</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        await itineraryDB.deleteItinerary(itinerary.id)
                        loadSavedItineraries()
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to test:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Hover over the itinerary cards above and click the bookmark icon to save them</li>
          <li>Watch as they appear in the profile section below</li>
          <li>Click "Open Full Profile" to see the actual profile page</li>
          <li>Use "Clear All" to reset and test again</li>
        </ol>
      </div>
    </div>
  )
}