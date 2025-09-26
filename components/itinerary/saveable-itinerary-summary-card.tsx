'use client'

import React from 'react'
import ItinerarySummaryCardV2 from '@/components/gumo/itinerary-summary-card-v2'
import { SaveItineraryIconButton } from '@/components/itinerary/save-itinerary-button'

type Props = {
  title: string
  blurb: string
  bullets: string[]
  href: string
  imageSrc?: string
  className?: string
  // Additional props for save functionality
  chatData?: any
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
  chatData,
  onSaved,
  onError
}: Props) {
  // Extract itinerary data from the summary card props
  const itineraryData = chatData || {
    title,
    description: blurb,
    destinations: [{ city: title.split(' ')[0] || 'Unknown City', days: 3 }], // Basic extraction
    highlights: bullets || [],
    imageSrc,
    href
  }

  return (
    <div className="relative group">
      <ItinerarySummaryCardV2
        title={title}
        blurb={blurb}
        bullets={bullets}
        href={href}
        imageSrc={imageSrc}
        className={className}
      />
      
      {/* Floating save button */}
      <div className="absolute top-4 right-4 z-10">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <SaveItineraryIconButton
            chatData={itineraryData}
            onSaved={onSaved}
            onError={onError}
            className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  )
}