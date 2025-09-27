'use client'

import React from 'react'
import ItinerarySummaryCardV2 from '@/components/gumo/itinerary-summary-card-v2'
import { SaveItineraryIconButton } from '@/components/itinerary/save-itinerary-button'

interface SaveableItinerarySummaryCardProps {
  title: string
  blurb: string
  bullets: string[]
  href: string
  imageSrc?: string
  className?: string
  // Data for saving to IndexedDB
  itineraryData?: {
    title: string
    description: string
    destinations: Array<{
      city: string
      days: number
    }>
    highlights: string[]
    imageSrc?: string
    chatData?: any
  }
  onSaved?: (id: string) => void
  onError?: (error: string) => void
}

export default function SaveableItinerarySummaryCard({
  title,
  blurb,
  bullets,
  href,
  imageSrc,
  className,
  itineraryData,
  onSaved,
  onError
}: SaveableItinerarySummaryCardProps) {
  // Fallback itinerary data extraction if not provided
  const finalItineraryData = itineraryData || {
    title,
    description: blurb,
    destinations: [{ city: title.split(' ')[0] || 'Unknown', days: 3 }],
    highlights: bullets,
    imageSrc
  }

  return (
    <div className="relative group">
      {/* Original itinerary card */}
      <ItinerarySummaryCardV2
        title={title}
        blurb={blurb}
        bullets={bullets}
        href={href}
        imageSrc={imageSrc}
        className={className}
      />
      
      {/* Floating save button - appears on hover */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <SaveItineraryIconButton
          chatData={finalItineraryData}
          onSaved={onSaved}
          onError={onError}
          className="shadow-lg backdrop-blur-sm"
        />
      </div>
    </div>
  )
}