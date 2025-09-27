'use client'

import React from 'react'
import { SaveItineraryButton } from '@/components/itinerary/save-itinerary-button'

// Mock chat message with itinerary data
const mockItineraryMessage = {
  id: 'msg_123',
  type: 'itinerary',
  content: 'I\'ve created a perfect 5-day Mumbai itinerary for you!',
  data: {
    title: '5-Day Mumbai Explorer',
    description: 'Experience the vibrant culture, street food, and iconic landmarks of Mumbai in this comprehensive 5-day adventure.',
    destinations: [
      { city: 'Mumbai', days: 5 }
    ],
    highlights: [
      'Explore the Gateway of India',
      'Try authentic street food at Mohammed Ali Road',
      'Visit the iconic Taj Mahal Palace Hotel',
      'Take a ferry to Elephanta Caves',
      'Experience the bustling markets of Crawford Market',
      'Walk along Marine Drive at sunset',
      'Discover Bollywood at Film City'
    ],
    imageSrc: '/sea-facing-villa-in-goa.jpg',
    itinerary: [
      {
        day: 1,
        title: 'Historic Mumbai',
        activities: ['Gateway of India', 'Taj Mahal Palace Hotel', 'Colaba Causeway Shopping']
      },
      {
        day: 2,
        title: 'Cultural Immersion',
        activities: ['Crawford Market', 'Mohammed Ali Road Food Tour', 'Chhatrapati Shivaji Terminus']
      },
      {
        day: 3,
        title: 'Bollywood & Beaches',
        activities: ['Film City Tour', 'Juhu Beach', 'Marine Drive Evening Walk']
      },
      {
        day: 4,
        title: 'Island Adventure',
        activities: ['Ferry to Elephanta Caves', 'Cave Exploration', 'Return via Mandwa Beach']
      },
      {
        day: 5,
        title: 'Local Markets & Departure',
        activities: ['Linking Road Shopping', 'Local Train Experience', 'Departure Preparations']
      }
    ]
  },
  timestamp: Date.now()
}

export function ChatItineraryExample() {
  const handleSaved = (id: string) => {
    alert(`Itinerary saved successfully! ID: ${id}`)
  }

  const handleError = (error: string) => {
    alert(`Failed to save: ${error}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md border p-6">
        <div className="flex items-start gap-4">
          {/* AI Avatar */}
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            AI
          </div>
          
          {/* Message Content */}
          <div className="flex-1">
            <p className="text-gray-800 mb-4">{mockItineraryMessage.content}</p>
            
            {/* Itinerary Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg mb-2">{mockItineraryMessage.data.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{mockItineraryMessage.data.description}</p>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Duration:</strong> {mockItineraryMessage.data.destinations[0].days} days in {mockItineraryMessage.data.destinations[0].city}
                </div>
                <div className="text-sm">
                  <strong>Highlights:</strong>
                  <ul className="list-disc list-inside mt-1 text-gray-600">
                    {mockItineraryMessage.data.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                    {mockItineraryMessage.data.highlights.length > 3 && (
                      <li>And {mockItineraryMessage.data.highlights.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <SaveItineraryButton
                chatData={mockItineraryMessage.data}
                onSaved={handleSaved}
                onError={handleError}
                variant="default"
                size="sm"
              />
              <button className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Details
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. AI generates an itinerary in chat</li>
          <li>2. User clicks "Save Itinerary" button</li>
          <li>3. Itinerary is stored in IndexedDB</li>
          <li>4. View all saved itineraries in your profile</li>
        </ul>
      </div>
    </div>
  )
}
