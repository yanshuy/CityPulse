'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { itineraryDB, type Itinerary } from '@/lib/db/itinerary-db'
import { ArrowLeft, MapPin, Calendar, Clock, Share, Trash2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ItineraryDetailPageProps {
  params: {
    id: string
  }
}

export default function ItineraryDetailPage({ params }: ItineraryDetailPageProps) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadItinerary()
  }, [params.id])

  const loadItinerary = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await itineraryDB.init()
      const savedItinerary = await itineraryDB.getItinerary(params.id)
      
      if (savedItinerary) {
        setItinerary(savedItinerary)
      } else {
        setError('Itinerary not found')
      }
    } catch (err) {
      console.error('Error loading itinerary:', err)
      setError('Failed to load itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!itinerary) return
    
    if (confirm('Are you sure you want to delete this itinerary? This action cannot be undone.')) {
      try {
        await itineraryDB.deleteItinerary(itinerary.id)
        router.push('/profile')
      } catch (err) {
        console.error('Error deleting itinerary:', err)
        alert('Failed to delete itinerary')
      }
    }
  }

  const handleShare = async () => {
    if (!itinerary) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: itinerary.title,
          text: itinerary.description,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const getTotalDays = () => {
    if (!itinerary) return 0
    return itinerary.destinations.reduce((total, dest) => total + dest.days, 0)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-md min-h-dvh px-4 py-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="w-16 h-8 bg-gray-300 rounded"></div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Image skeleton */}
          <div className="aspect-video bg-gray-300 rounded-2xl"></div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !itinerary) {
    return (
      <main className="mx-auto max-w-md min-h-dvh px-4 py-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Itinerary Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The itinerary you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => router.push('/profile')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md min-h-dvh">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[color:var(--gumo-background)]/95 backdrop-blur-sm px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[color:var(--gumo-text)] hover:text-[color:var(--gumo-yellow)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = `/maps?layer=itinerary&itinerary=${params.id}`}
              className="p-2 text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-text)] transition-colors rounded-lg hover:bg-white/5"
              title="View on map"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-[color:var(--gumo-muted)] hover:text-[color:var(--gumo-text)] transition-colors rounded-lg hover:bg-white/5"
              title="Share itinerary"
            >
              <Share className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
              title="Delete itinerary"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Hero Image */}
        {itinerary.imageSrc && (
          <div className="mb-6 aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            <img
              src={itinerary.imageSrc}
              alt={itinerary.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and Description */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[color:var(--gumo-text)] mb-3 leading-tight">
            {itinerary.title}
          </h1>
          <p className="text-[color:var(--gumo-muted)] leading-relaxed">
            {itinerary.description}
          </p>
        </div>

        {/* Trip Statistics */}
        <div className="mb-6 grid grid-cols-3 gap-4 p-4 bg-[color:var(--gumo-surface)]/30 rounded-2xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MapPin className="w-4 h-4 text-[color:var(--gumo-yellow)]" />
            </div>
            <div className="text-lg font-semibold text-[color:var(--gumo-text)]">
              {itinerary.destinations.length}
            </div>
            <div className="text-xs text-[color:var(--gumo-muted)]">
              {itinerary.destinations.length === 1 ? 'City' : 'Cities'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-[color:var(--gumo-yellow)]" />
            </div>
            <div className="text-lg font-semibold text-[color:var(--gumo-text)]">
              {getTotalDays()}
            </div>
            <div className="text-xs text-[color:var(--gumo-muted)]">
              Days
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Heart className="w-4 h-4 text-[color:var(--gumo-yellow)]" />
            </div>
            <div className="text-lg font-semibold text-[color:var(--gumo-text)]">
              {itinerary.highlights.length}
            </div>
            <div className="text-xs text-[color:var(--gumo-muted)]">
              Highlights
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[color:var(--gumo-text)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[color:var(--gumo-yellow)]" />
            Your Journey
          </h2>
          <div className="space-y-3">
            {itinerary.destinations.map((destination, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[color:var(--gumo-surface)]/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[color:var(--gumo-yellow)] rounded-full flex items-center justify-center text-black font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium text-[color:var(--gumo-text)] block">
                      {destination.city}
                    </span>
                    <span className="text-xs text-[color:var(--gumo-muted)]">
                      Destination {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-[color:var(--gumo-muted)] bg-[color:var(--gumo-surface)]/30 px-3 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>{destination.days} {destination.days === 1 ? 'day' : 'days'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        {itinerary.highlights.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[color:var(--gumo-text)] mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[color:var(--gumo-yellow)]" />
              Highlights
            </h2>
            <div className="space-y-3">
              {itinerary.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[color:var(--gumo-surface)]/10 rounded-xl">
                  <div className="mt-1.5 w-2 h-2 bg-[color:var(--gumo-yellow)] rounded-full flex-shrink-0" />
                  <span className="text-[color:var(--gumo-text)] leading-relaxed">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="p-4 bg-[color:var(--gumo-surface)]/20 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-xs text-[color:var(--gumo-muted)]">
            <div>
              <span className="block">Created</span>
              <span className="font-medium text-[color:var(--gumo-text)]">
                {formatDate(itinerary.createdAt)}
              </span>
            </div>
            {itinerary.updatedAt !== itinerary.createdAt && (
              <div className="text-right">
                <span className="block">Last Updated</span>
                <span className="font-medium text-[color:var(--gumo-text)]">
                  {formatDate(itinerary.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20" />
    </main>
  )
}
