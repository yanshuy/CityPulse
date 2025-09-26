'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useItineraryStorage, extractItineraryFromChat } from '@/hooks/use-itinerary-storage'
import { BookmarkIcon, CheckIcon, LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SaveItineraryButtonProps {
  chatData: any
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onSaved?: (id: string) => void
  onError?: (error: string) => void
}

export function SaveItineraryButton({
  chatData,
  className,
  variant = 'outline',
  size = 'sm',
  onSaved,
  onError
}: SaveItineraryButtonProps) {
  const { saving, error, saveItinerary, clearError } = useItineraryStorage()
  const [saved, setSaved] = React.useState(false)

  const handleSave = async () => {
    if (!chatData) return

    try {
      clearError()
      const itineraryData = extractItineraryFromChat(chatData)
      const id = await saveItinerary(itineraryData)
      
      if (id) {
        setSaved(true)
        onSaved?.(id)
        
        // Reset saved state after 2 seconds
        setTimeout(() => setSaved(false), 2000)
      } else if (error) {
        onError?.(error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save itinerary'
      onError?.(errorMessage)
    }
  }

  if (saved) {
    return (
      <Button
        variant="outline"
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
      className={className}
      onClick={handleSave}
      disabled={saving}
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

// Alternative compact version for tight spaces
export function SaveItineraryIconButton({
  chatData,
  className,
  onSaved,
  onError
}: Omit<SaveItineraryButtonProps, 'size' | 'variant'>) {
  const { saving, error, saveItinerary, clearError } = useItineraryStorage()
  const [saved, setSaved] = React.useState(false)

  const handleSave = async () => {
    if (!chatData) return

    try {
      clearError()
      const itineraryData = extractItineraryFromChat(chatData)
      const id = await saveItinerary(itineraryData)
      
      if (id) {
        setSaved(true)
        onSaved?.(id)
        setTimeout(() => setSaved(false), 2000)
      } else if (error) {
        onError?.(error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save itinerary'
      onError?.(errorMessage)
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
      disabled={saving}
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