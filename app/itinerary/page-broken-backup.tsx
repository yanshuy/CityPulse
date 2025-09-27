"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import ItineraryDisplay from "@/components/itinerary/dynamic-itinerary-display"
import EditItineraryModal from "@/components/itinerary/edit-itinerary-modal"
import { GeneratedItinerary, ItineraryItem } from "@/lib/types/component-schemas"
import { getItinerary, saveItinerary } from "@/lib/itinerary-storage"
import { itineraryDB, type Itinerary } from "@/lib/db/itinerary-db"

// Convert new Itinerary format to GeneratedItinerary format for the display component
function convertItineraryToGenerated(itinerary: Itinerary): GeneratedItinerary {
  console.log('🔄 Converting itinerary:', itinerary);
  console.log('🎯 Itinerary destinations:', itinerary.destinations);
  console.log('🎯 Itinerary chatData:', itinerary.chatData);
  
  // FIRST PRIORITY: If chatData is already a complete GeneratedItinerary, use it directly
  if (itinerary.chatData && 
      itinerary.chatData.id && 
      itinerary.chatData.title && 
      itinerary.chatData.days && 
      Array.isArray(itinerary.chatData.days) &&
      itinerary.chatData.days.length > 0 &&
      itinerary.chatData.days[0].items) {
    console.log('✅ ChatData is already a complete GeneratedItinerary - using directly');
    return itinerary.chatData as GeneratedItinerary;
  }
  
  // SECOND PRIORITY: Look for the days array anywhere in chatData
  if (itinerary.chatData) {
    console.log('🔍 Searching for days array in chatData...');
    
    // Check all properties of chatData for a days array
    const searchForDaysArray = (obj: any, path: string = ''): any[] | null => {
      if (Array.isArray(obj) && obj.length > 0 && obj[0].day && obj[0].items) {
        console.log(`✨ Found valid days array at: ${path}`);
        return obj;
      }
      
      if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          const result = searchForDaysArray(value, path ? `${path}.${key}` : key);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    const foundDays = searchForDaysArray(itinerary.chatData);
    if (foundDays) {
      console.log('🎉 Using found days array from chatData');
      return {
        id: itinerary.id,
        title: itinerary.title,
        destination: itinerary.chatData.destination || itinerary.destinations[0]?.city || 'Unknown',
        totalDays: foundDays.length,
        overview: itinerary.description,
        bestTimeToVisit: itinerary.chatData.bestTimeToVisit || 'Year-round',
        totalBudget: itinerary.chatData.totalBudget || '₹15,000 - ₹25,000',
        days: foundDays,
        generalTips: itinerary.chatData.generalTips || itinerary.highlights || [],
        alternativeSuggestions: itinerary.chatData.alternativeSuggestions || []
      } as GeneratedItinerary;
    }
  }
  
  console.log('⚠️ No valid days array found in chatData - this should not happen for saved itineraries');
  console.log('🔍 Full chatData keys:', itinerary.chatData ? Object.keys(itinerary.chatData) : 'No chatData');
  
  // Only as last resort, create from destinations (this is what was causing the generic content)
  console.log('🏗️ Last resort: Building from destinations (this will create generic content)');
  return createFromDestinations(itinerary);
}

// Separate function for creating from destinations (only used as fallback)
function createFromDestinations(itinerary: Itinerary): GeneratedItinerary {
  
// Separate function for creating from destinations (only used as fallback)
function createFromDestinations(itinerary: Itinerary): GeneratedItinerary {
  console.log('🏗️ Building new itinerary format from stored data');
  console.log('🗺️ Destinations:', itinerary.destinations);
  
  // Safety check for destinations
  if (!itinerary.destinations || !Array.isArray(itinerary.destinations) || itinerary.destinations.length === 0) {
    console.warn('⚠️ No destinations found, creating default itinerary');
    console.log('🏗️ Destinations data:', itinerary.destinations);
    return {
      id: itinerary.id,
      title: itinerary.title,
      destination: 'Unknown',
      totalDays: 1,
      overview: itinerary.description,
      bestTimeToVisit: 'Year-round',
      totalBudget: '₹15,000 - ₹25,000',
      days: [{
        day: 1,
        date: 'Day 1',
        theme: 'City Exploration',
        summary: 'Explore the highlights of your destination',
        items: [{
          id: 'default-1',
          name: 'City Tour',
          type: 'attraction' as const,
          description: 'Discover the city highlights',
          location: 'City Center',
          address: 'City Center',
          startTime: '10:00 AM',
          duration: '4 hours',
          estimatedCost: '₹1000-2000',
          rating: 4.2,
          highlights: itinerary.highlights?.slice(0, 2) || ['Explore the city', 'Great experience'],
          tips: 'Start early to make the most of your day'
        }],
        totalEstimatedCost: '₹1000-2000',
        walkingDistance: '3-5 km',
        tips: 'Enjoy your exploration and take lots of photos!'
      }],
      generalTips: itinerary.highlights && itinerary.highlights.length > 0 ? itinerary.highlights : [
        'Stay hydrated throughout your journey',
        'Try local cuisine and specialties', 
        'Respect local customs and traditions'
      ],
      alternativeSuggestions: []
    };
  }
  
  // Otherwise, create a basic GeneratedItinerary structure from the stored data
  const totalDays = itinerary.destinations.reduce((sum, dest) => sum + (dest.days || 0), 0);
  console.log('📊 Total days calculated:', totalDays);
  console.log('🏗️ Processing destinations:', itinerary.destinations);
  
  // Validate destinations have proper structure
  const validDestinations = itinerary.destinations.filter(dest => 
    dest && dest.city && typeof dest.days === 'number' && dest.days > 0
  );
  
  if (validDestinations.length === 0) {
    console.warn('⚠️ No valid destinations found, creating single day plan');
    return {
      id: itinerary.id,
      title: itinerary.title,
      destination: itinerary.destinations[0]?.city || 'Unknown',
      totalDays: 1,
      overview: itinerary.description,
      bestTimeToVisit: 'Year-round',
      totalBudget: '₹15,000 - ₹25,000',
      days: [{
        day: 1,
        date: 'Day 1',
        theme: 'City Exploration',
        summary: 'Explore the highlights of your destination',
        items: [{
          id: 'default-1',
          name: 'City Tour',
          type: 'attraction' as const,
          description: 'Discover the city highlights',
          location: itinerary.destinations[0]?.city || 'City Center',
          address: 'City Center',
          startTime: '10:00 AM',
          duration: '4 hours',
          estimatedCost: '₹1000-2000',
          rating: 4.2,
          highlights: itinerary.highlights?.slice(0, 2) || ['Explore the city', 'Great experience'],
          tips: 'Start early to make the most of your day'
        }],
        totalEstimatedCost: '₹1000-2000',
        walkingDistance: '3-5 km',
        tips: 'Enjoy your exploration and take lots of photos!'
      }],
      generalTips: itinerary.highlights && itinerary.highlights.length > 0 ? itinerary.highlights : [
        'Stay hydrated throughout your journey',
        'Try local cuisine and specialties', 
        'Respect local customs and traditions'
      ],
      alternativeSuggestions: []
    };
  }

  // Create basic itinerary from destinations (fallback only)
  console.log('⚠️ Creating basic itinerary from destinations - this should rarely happen');
  return {
    id: itinerary.id,
    title: itinerary.title,
    destination: validDestinations[0]?.city || 'Unknown',
    totalDays: totalDays || 1,
    overview: itinerary.description,
    bestTimeToVisit: 'Year-round',
    totalBudget: '₹15,000 - ₹25,000',
    days: [{
      day: 1,
      date: 'Day 1',
      theme: 'City Exploration',
      summary: 'Basic itinerary created from destination data',
      items: [{
        id: 'basic-1',
        name: `Explore ${validDestinations[0]?.city || 'the city'}`,
        type: 'attraction' as const,
        description: `Basic city exploration in ${validDestinations[0]?.city || 'your destination'}`,
        location: validDestinations[0]?.city || 'City Center',
        address: validDestinations[0]?.city || 'City Center',
        startTime: '10:00 AM',
        duration: '4 hours',
        estimatedCost: '₹1000-2000',
        rating: 4.0,
        highlights: ['City exploration'],
        tips: 'Enjoy your visit'
      }],
      totalEstimatedCost: '₹1000-2000',
      walkingDistance: '2-3 km',
      tips: 'Have a great day exploring!'
    }],
    generalTips: ['Stay hydrated', 'Try local food'],
    alternativeSuggestions: []
  };
}
          duration: '4 hours',
          estimatedCost: '₹1000-2000',
          rating: 4.2,
          highlights: itinerary.highlights?.slice(0, 2) || ['Explore the city', 'Great experience'],
          tips: 'Start early to make the most of your day'
        }],
        totalEstimatedCost: '₹1000-2000',
        walkingDistance: '3-5 km',
        tips: 'Enjoy your exploration and take lots of photos!'
      }],
      generalTips: itinerary.highlights && itinerary.highlights.length > 0 ? itinerary.highlights : [
        'Stay hydrated throughout your journey',
        'Try local cuisine and specialties', 
        'Respect local customs and traditions'
      ],
      alternativeSuggestions: []
    };
  }
  
  // Create day plans from destinations
  let dayCounter = 1;
  const dayPlans = validDestinations.flatMap((dest, destIndex) => {
    console.log(`🏙️ Processing destination ${destIndex + 1}:`, dest);
    console.log(`📍 Places in ${dest.city}:`, dest.places);
    console.log(`📅 Days for ${dest.city}:`, dest.days);
    
    return Array.from({ length: dest.days }, (_, dayIndex) => ({
      day: dayCounter++,
      date: `Day ${dayCounter - 1}`,
      theme: `${dest.city} Exploration`,
      summary: `Discover the best of ${dest.city}`,
      items: dest.places && dest.places.length > 0 ? 
        dest.places.slice(0, 5).map((place, placeIndex) => ({
          id: `${dest.city.toLowerCase()}-${dayCounter - 1}-${placeIndex}`,
          name: place.name,
          type: (place.type === 'hotel' ? 'accommodation' : 
                place.type === 'shopping' ? 'activity' : 
                place.type === 'other' ? 'attraction' : 
                place.type || 'attraction') as 'restaurant' | 'attraction' | 'transport' | 'activity' | 'accommodation',
          description: place.description || `Experience ${place.name} in ${dest.city}`,
          location: place.address || dest.city,
          address: place.address || dest.city,
          startTime: `${9 + placeIndex * 2}:00 AM`,
          duration: placeIndex === 0 ? '2-3 hours' : '1-2 hours',
          estimatedCost: place.type === 'restaurant' ? '₹800-1500' : '₹200-800',
          rating: place.rating || (4.0 + Math.random() * 0.8), // Random rating between 4.0-4.8
          highlights: place.description ? [place.description] : [`Must-visit place in ${dest.city}`, `Great for photos`],
          tips: `Visit early in the day for the best experience`,
          coordinates: place.latitude && place.longitude ? {
            lat: place.latitude,
            lng: place.longitude
          } : undefined
        })) : [
          // Enhanced default items if no places are stored - try to use highlights or create better content
          {
            id: `${dest.city.toLowerCase()}-${dayCounter - 1}-highlight-1`,
            name: itinerary.highlights && itinerary.highlights[0] ? itinerary.highlights[0] : `Explore ${dest.city}`,
            type: 'attraction' as const,
            description: itinerary.highlights && itinerary.highlights[0] ? 
              `Experience ${itinerary.highlights[0]} in ${dest.city}` : 
              `Discover the highlights of ${dest.city}`,
            location: dest.city,
            address: dest.city,
            startTime: '10:00 AM',
            duration: '3-4 hours',
            estimatedCost: '₹500-1000',
            rating: 4.3,
            highlights: itinerary.highlights?.slice(0, 2) || [`Best of ${dest.city}`, 'Local culture', 'Great atmosphere'],
            tips: 'Perfect for a full day of exploration'
          },
          // Add more items if we have more highlights
          ...(itinerary.highlights && itinerary.highlights.length > 1 ? [{
            id: `${dest.city.toLowerCase()}-${dayCounter - 1}-highlight-2`,
            name: itinerary.highlights[1],
            type: 'activity' as const,
            description: `Experience ${itinerary.highlights[1]} in ${dest.city}`,
            location: dest.city,
            address: dest.city,
            startTime: '2:00 PM',
            duration: '2-3 hours',
            estimatedCost: '₹300-800',
            rating: 4.1,
            highlights: [itinerary.highlights[1], 'Unique experience'],
            tips: 'Great for afternoon exploration'
          }] : [])
        ],
      totalEstimatedCost: '₹2000-4000',
      walkingDistance: '2-3 km',
      tips: `Take your time to explore ${dest.city}. Stay hydrated and wear comfortable shoes.`
    }));
  });
  
  const convertedItinerary = {
    id: itinerary.id,
    title: itinerary.title,
    destination: itinerary.destinations[0]?.city || 'Unknown',
    totalDays: totalDays || 1,
    overview: itinerary.description,
    bestTimeToVisit: 'Year-round',
    totalBudget: '₹15,000 - ₹25,000',
    days: dayPlans.length > 0 ? dayPlans : [
      // Default single day if no destinations
      {
        day: 1,
        date: 'Day 1',
        theme: 'City Exploration',
        summary: 'Explore the highlights of your destination',
        items: [{
          id: 'default-1',
          name: 'City Tour',
          type: 'attraction' as const,
          description: 'Discover the city highlights',
          location: itinerary.destinations[0]?.city || 'City Center',
          address: 'City Center',
          startTime: '10:00 AM',
          duration: '4 hours',
          estimatedCost: '₹1000-2000',
          rating: 4.2,
          highlights: itinerary.highlights.slice(0, 2),
          tips: 'Start early to make the most of your day'
        }],
        totalEstimatedCost: '₹1000-2000',
        walkingDistance: '3-5 km',
        tips: 'Enjoy your exploration and take lots of photos!'
      }
    ],
    generalTips: itinerary.highlights.length > 0 ? itinerary.highlights : [
      'Stay hydrated throughout your journey',
      'Try local cuisine and specialties', 
      'Respect local customs and traditions'
    ],
    alternativeSuggestions: []
  };
  
  console.log('🎯 Final converted itinerary days:', convertedItinerary.days);
  console.log('📏 Days array length:', convertedItinerary.days.length);
  console.log('🔍 Is days an array?', Array.isArray(convertedItinerary.days));
  
  // Final validation - ensure days is always an array
  if (!Array.isArray(convertedItinerary.days) || convertedItinerary.days.length === 0) {
    console.error('❌ Critical error: days is not an array or is empty. Creating fallback...');
    convertedItinerary.days = [{
      day: 1,
      date: 'Day 1',
      theme: 'City Exploration',
      summary: 'Explore the highlights of your destination',
      items: [{
        id: 'fallback-1',
        name: 'City Tour',
        type: 'attraction' as const,
        description: 'Discover the city highlights',
        location: 'City Center',
        address: 'City Center',
        startTime: '10:00 AM',
        duration: '4 hours',
        estimatedCost: '₹1000-2000',
        rating: 4.2,
        highlights: ['Explore the city', 'Great experience'],
        tips: 'Start early to make the most of your day'
      }],
      totalEstimatedCost: '₹1000-2000',
      walkingDistance: '3-5 km',
      tips: 'Enjoy your exploration and take lots of photos!'
    }];
  }
  
  return convertedItinerary;
}

export default function ItineraryPage() {
  const searchParams = useSearchParams()
  const readOnly = searchParams.get('readOnly') === 'true'

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true)
        const itineraryId = searchParams.get('id')

        if (itineraryId) {
          // First try the new itinerary system (itineraryDB)
          try {
            await itineraryDB.init()
            const newItinerary = await itineraryDB.getItinerary(itineraryId)
            if (newItinerary) {
              console.log('🔍 Raw itinerary from new system:', newItinerary);
              console.log('🔍 Raw itinerary destinations:', newItinerary.destinations);
              console.log('🔍 Raw itinerary chatData:', newItinerary.chatData);
              const generatedItinerary = convertItineraryToGenerated(newItinerary)
              console.log('🔄 Converted itinerary:', generatedItinerary);
              console.log('📅 Converted Days array:', generatedItinerary.days);
              console.log('🔢 Days array type:', typeof generatedItinerary.days);
              console.log('🔢 Days array length:', generatedItinerary.days?.length);
              setItinerary(generatedItinerary)
              return
            }
          } catch (newSystemError) {
            console.log('New system failed, trying old system:', newSystemError)
          }

          // Fallback to old itinerary system
          const oldItineraryData = await getItinerary(itineraryId)
          if (oldItineraryData) {
            setItinerary(oldItineraryData)
            return
          }
          
          setError('Itinerary not found in either storage system')
        } else {
          // Fallback: check for old URL format
          const itineraryParam = searchParams.get('itinerary')
          if (itineraryParam) {
            try {
              const decoded = JSON.parse(decodeURIComponent(itineraryParam)) as GeneratedItinerary
              setItinerary(decoded)
              // Optionally save to storage for future use
              saveItinerary(decoded)
            } catch (parseError) {
              setError('Invalid itinerary data')
            }
          } else {
            setError('No itinerary ID provided')
          }
        }
      } catch (err) {
        console.error('Failed to load itinerary:', err)
        setError(err instanceof Error ? err.message : 'Failed to load itinerary')
      } finally {
        setLoading(false)
      }
    }

    loadItinerary()
  }, [searchParams])

  const router = useRouter()
  const [editingItem, setEditingItem] = useState<{ itemId: string; day: number } | null>(null)
  const [currentItinerary, setCurrentItinerary] = useState<GeneratedItinerary | null>(itinerary)

  const handleEdit = (itemId: string, day: number) => {
    setEditingItem({ itemId, day })
  }

  const handleRemove = (itemId: string, day: number) => {
    if (!currentItinerary) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === day) {
          return {
            ...dayPlan,
            items: dayPlan.items.filter(item => item.id !== itemId)
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
  }

  const handleAddSuggestion = (day: number) => {
    setEditingItem({ itemId: 'new', day })
  }

  const handleSaveItem = (updatedItem: ItineraryItem) => {
    if (!currentItinerary || !editingItem) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === editingItem.day) {
          return {
            ...dayPlan,
            items: dayPlan.items.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
    setEditingItem(null)
  }

  const handleReplaceItem = (newItem: ItineraryItem, oldItemId: string) => {
    if (!currentItinerary || !editingItem) return

    const updatedItinerary = {
      ...currentItinerary,
      days: currentItinerary.days.map(dayPlan => {
        if (dayPlan.day === editingItem.day) {
          if (oldItemId === 'new') {
            // Adding new item
            return {
              ...dayPlan,
              items: [...dayPlan.items, newItem]
            }
          } else {
            // Replacing existing item
            return {
              ...dayPlan,
              items: dayPlan.items.map(item =>
                item.id === oldItemId ? newItem : item
              )
            }
          }
        }
        return dayPlan
      })
    }

    setCurrentItinerary(updatedItinerary)
    updateUrlWithItinerary(updatedItinerary)
    setEditingItem(null)
  }

  const updateUrlWithItinerary = (updatedItinerary: GeneratedItinerary) => {
    // Save updated itinerary to storage
    const itineraryId = saveItinerary(updatedItinerary)
    const newUrl = `/itinerary?id=${itineraryId}`
    router.replace(newUrl, { scroll: false })
  }

  const getCurrentEditingItem = (): ItineraryItem | undefined => {
    if (!editingItem || !currentItinerary) return undefined

    if (editingItem.itemId === 'new') return undefined

    const day = currentItinerary.days.find(d => d.day === editingItem.day)
    return day?.items.find(item => item.id === editingItem.itemId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--gumo-yellow)] mb-4"></div>
          <p className="text-white/70">Loading your itinerary...</p>
        </div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Itinerary Not Found</h1>
          <p className="text-white/70 mb-6">
            {error || 'This itinerary link is invalid or expired. Please generate a new one.'}
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-[color:var(--gumo-yellow)] text-black rounded-xl font-medium hover:brightness-110 transition-all"
          >
            Generate New Itinerary
          </a>
        </div>
      </div>
    )
  } return (
    <div className="min-h-screen bg-[color:var(--gumo-bg)] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <a
            href={readOnly ? "/profile" : "/"}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            ← Back to {readOnly ? "Profile" : "Chat"}
          </a>
        </div>

        {/* Itinerary Display */}
        <ItineraryDisplay
          itinerary={currentItinerary || itinerary}
          onEdit={readOnly ? undefined : handleEdit}
          onRemove={readOnly ? undefined : handleRemove}
          onAddSuggestion={readOnly ? undefined : handleAddSuggestion}
          readOnly={readOnly}
        />

        {/* Edit Modal */}
        <EditItineraryModal
          isOpen={!!editingItem}
          item={getCurrentEditingItem()}
          day={editingItem?.day || 1}
          destination={(currentItinerary || itinerary)?.destination || 'Mumbai'}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
          onReplace={handleReplaceItem}
        />
      </div>
    </div>
  )
}
