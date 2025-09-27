'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SaveItineraryButton } from '@/components/itinerary/save-itinerary-button'
import { itineraryDB, type Itinerary } from '@/lib/db/itinerary-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ItineraryStorageDemo() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState({
    title: 'Amazing Mumbai Adventure',
    city: 'Mumbai',
    days: 4,
    description: 'Explore the vibrant city of Mumbai with its street food, Bollywood culture, and stunning beaches.',
    activities: ['Visit Gateway of India', 'Try street food at Chowpatty', 'Explore Bollywood studios', 'Take ferry to Elephanta Caves']
  })

  useEffect(() => {
    loadItineraries()
  }, [])

  const loadItineraries = async () => {
    try {
      setLoading(true)
      await itineraryDB.init()
      const saved = await itineraryDB.getAllItineraries()
      setItineraries(saved)
    } catch (error) {
      console.error('Error loading itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaved = (id: string) => {
    console.log('Itinerary saved with ID:', id)
    loadItineraries() // Refresh the list
  }

  const handleError = (error: string) => {
    console.error('Save error:', error)
    alert(`Error: ${error}`)
  }

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all saved itineraries?')) {
      try {
        for (const itinerary of itineraries) {
          await itineraryDB.deleteItinerary(itinerary.id)
        }
        loadItineraries()
      } catch (error) {
        console.error('Error clearing data:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Itinerary Storage Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Test Chat Data</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={testData.title}
                  onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={testData.city}
                  onChange={(e) => setTestData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days</label>
                <Input
                  type="number"
                  value={testData.days}
                  onChange={(e) => setTestData(prev => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={testData.description}
                onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <SaveItineraryButton
              chatData={testData}
              onSaved={handleSaved}
              onError={handleError}
              variant="default"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saved Itineraries ({itineraries.length})</span>
            <Button variant="outline" size="sm" onClick={clearAllData}>
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No saved itineraries yet. Try saving the test data above!
            </div>
          ) : (
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <div key={itinerary.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{itinerary.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(itinerary.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{itinerary.description}</p>
                  <div className="text-sm">
                    <div className="mb-1">
                      <strong>Destinations:</strong>{' '}
                      {itinerary.destinations.map(d => `${d.city} (${d.days} days)`).join(', ')}
                    </div>
                    <div>
                      <strong>Highlights:</strong> {itinerary.highlights.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
