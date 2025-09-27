import { useState } from 'react'
import { itineraryDB, createItineraryFromChat, type Itinerary } from '@/lib/db/itinerary-db'

export function useItineraryStorage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveItinerary = async (chatData: any): Promise<string | null> => {
    try {
      setSaving(true)
      setError(null)
      
      // Initialize DB if needed
      await itineraryDB.init()
      
      // Create itinerary from chat data
      const itineraryData = createItineraryFromChat(chatData)
      
      // Save to IndexedDB
      const id = await itineraryDB.saveItinerary(itineraryData)
      
      return id
    } catch (err) {
      console.error('Error saving itinerary:', err)
      setError(err instanceof Error ? err.message : 'Failed to save itinerary')
      return null
    } finally {
      setSaving(false)
    }
  }

  const updateItinerary = async (id: string, updates: Partial<Omit<Itinerary, 'id' | 'createdAt'>>): Promise<boolean> => {
    try {
      setSaving(true)
      setError(null)
      
      await itineraryDB.updateItinerary(id, updates)
      return true
    } catch (err) {
      console.error('Error updating itinerary:', err)
      setError(err instanceof Error ? err.message : 'Failed to update itinerary')
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteItinerary = async (id: string): Promise<boolean> => {
    try {
      setSaving(true)
      setError(null)
      
      await itineraryDB.deleteItinerary(id)
      return true
    } catch (err) {
      console.error('Error deleting itinerary:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete itinerary')
      return false
    } finally {
      setSaving(false)
    }
  }

  const clearError = () => setError(null)

  return {
    saving,
    error,
    saveItinerary,
    updateItinerary,
    deleteItinerary,
    clearError
  }
}

// Utility function to extract itinerary data from various chat formats
export function extractItineraryFromChat(chatData: any) {
  // This function would parse different chat formats and extract structured itinerary data
  // For now, we'll handle common patterns
  
  if (typeof chatData === 'string') {
    // Try to parse JSON string
    try {
      chatData = JSON.parse(chatData)
    } catch {
      // If not JSON, create basic structure from string
      return createBasicItineraryFromText(chatData)
    }
  }

  // Handle different chat data structures
  if (chatData.destinations) {
    return chatData
  }

  // Extract from common chat response patterns
  const destinations = []
  const highlights = []

  // Look for city mentions and duration
  if (chatData.city || chatData.location) {
    destinations.push({
      city: chatData.city || chatData.location,
      days: chatData.days || chatData.duration || 3
    })
  }

  // Look for activities or highlights
  if (chatData.activities) {
    highlights.push(...(Array.isArray(chatData.activities) ? chatData.activities : [chatData.activities]))
  }

  if (chatData.highlights) {
    highlights.push(...(Array.isArray(chatData.highlights) ? chatData.highlights : [chatData.highlights]))
  }

  return {
    title: chatData.title || `Trip to ${destinations[0]?.city || 'Unknown City'}`,
    description: chatData.description || chatData.summary || 'A wonderful travel experience awaits.',
    destinations: destinations.length > 0 ? destinations : [{ city: 'Unknown City', days: 3 }],
    highlights: highlights.length > 0 ? highlights : ['Explore the city', 'Try local cuisine', 'Visit landmarks'],
    imageSrc: chatData.image || chatData.imageSrc,
    chatData
  }
}

function createBasicItineraryFromText(text: string) {
  // Basic text parsing to extract some information
  const lines = text.split('\n').filter(line => line.trim())
  const title = lines[0] || 'My Travel Plan'
  
  // Try to find city names (very basic pattern matching)
  const cityMatches = text.match(/(?:to|in|visit|exploring)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi)
  const cities = cityMatches ? cityMatches.map(match => 
    match.replace(/(?:to|in|visit|exploring)\s+/i, '').trim()
  ) : ['Unknown City']

  return {
    title,
    description: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
    destinations: cities.slice(0, 3).map(city => ({ city, days: 3 })),
    highlights: [
      'Discover amazing places',
      'Experience local culture',
      'Create unforgettable memories'
    ],
    chatData: { originalText: text }
  }
}
