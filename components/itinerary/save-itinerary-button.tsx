'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BookmarkIcon, CheckIcon, LoaderIcon } from 'lucide-react'
import { saveItineraryPermanent } from '@/lib/itinerary-storage'
import { cn } from '@/lib/utils'

interface SaveItineraryButtonProps {
  itineraryData: any
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onSaved?: (id: string) => void
  onError?: (error: string) => void
}

export function SaveItineraryButton({
  itineraryData,
  className = '',
  variant = 'outline',
  size = 'sm',
  onSaved,
  onError
}: SaveItineraryButtonProps) {
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = async () => {
    if (!itineraryData) return

    setError(null)
    setSaving(true)

    try {
      const id = await saveItineraryPermanent(itineraryData)
      setSaved(true)
      onSaved?.(id)

      // Reset saved state after 3 seconds
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save itinerary'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Show success state if recently saved
  if (saved && !error) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("text-green-600 border-green-200 hover:bg-green-50", className)}
        disabled
      >
        <CheckIcon className="w-4 h-4 mr-2" />
        Saved!
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      disabled={saving || !itineraryData}
      className={className}
    >
      {saving ? (
        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <BookmarkIcon className="w-4 h-4 mr-2" />
      )}
      {saving ? 'Saving...' : 'Save Itinerary'}
    </Button>
  )
}

// Compact icon-only version for tight spaces
export function SaveItineraryIconButton({
  itineraryData,
  className,
  onSaved,
  onError
}: Omit<SaveItineraryButtonProps, 'size' | 'variant'>) {
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = async () => {
    if (!itineraryData) return

    setError(null)
    setSaving(true)

    try {
      const id = await saveItineraryPermanent(itineraryData)
      setSaved(true)
      onSaved?.(id)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save itinerary'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "w-8 h-8 p-0",
        saved ? "text-green-600 hover:text-green-700" : "text-gray-500 hover:text-gray-700",
        className
      )}
      onClick={handleSave}
      disabled={saving || !itineraryData}
      title={saving ? 'Saving...' : saved ? 'Saved!' : 'Save Itinerary'}
    >
      {saving ? (
        <LoaderIcon className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <BookmarkIcon className="w-4 h-4" />
      )}
    </Button>
  )
}
