"use client"

import { useState, useEffect } from "react"

interface LoadingStage {
  id: string
  text: string
  duration: number // seconds to wait before marking as complete
  icon: string
}

interface ItineraryGenerationLoaderProps {
  destination: string
  days: number
  onComplete?: () => void
}

const LOADING_STAGES: LoadingStage[] = [
  {
    id: "scoop",
    text: "Getting the scoop on your travel wishes",
    duration: 2,
    icon: "✅"
  },
  {
    id: "dna",
    text: "Decoding your travel DNA",
    duration: 3,
    icon: "✅"
  },
  {
    id: "spots",
    text: "Finding the coolest spots to visit",
    duration: 4,
    icon: "✅"
  },
  {
    id: "collection",
    text: "Building your once-in-a-lifetime collection",
    duration: 5,
    icon: "⏳"
  }
]

export default function ItineraryGenerationLoader({ 
  destination, 
  days, 
  onComplete 
}: ItineraryGenerationLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const [isThinking, setIsThinking] = useState(true)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const progressStage = (stageIndex: number) => {
      if (stageIndex >= LOADING_STAGES.length) {
        setIsThinking(false)
        return
      }

      const stage = LOADING_STAGES[stageIndex]
      setCurrentStage(stageIndex)

      timeoutId = setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, stage.id]))
        
        // Move to next stage
        if (stageIndex < LOADING_STAGES.length - 1) {
          progressStage(stageIndex + 1)
        } else {
          // Final stage - keep showing until onComplete is called
          setIsThinking(false)
        }
      }, stage.duration * 1000)
    }

    // Start the progression
    progressStage(0)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [onComplete])

  // Call onComplete when all stages are done
  useEffect(() => {
    if (!isThinking && completedStages.size === LOADING_STAGES.length) {
      onComplete?.()
    }
  }, [isThinking, completedStages.size, onComplete])

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[color:var(--gumo-surface)] rounded-2xl border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[color:var(--gumo-yellow)]"></div>
        <span className="text-white/80 text-sm font-medium">
          {isThinking ? 'Thinking' : 'Finalizing'}
        </span>
        {isThinking && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Progress Stages */}
      <div className="space-y-4">
        {LOADING_STAGES.map((stage, index) => {
          const isCompleted = completedStages.has(stage.id)
          const isCurrent = currentStage === index && !isCompleted
          const isPending = index > currentStage

          return (
            <div 
              key={stage.id}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isPending ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Status Icon */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent
                  ? 'bg-[color:var(--gumo-yellow)] text-black'
                  : 'bg-gray-600 text-gray-400'
              }`}>
                {isCompleted ? '✓' : isCurrent ? '⏳' : '○'}
              </div>

              {/* Stage Text */}
              <div className={`flex-1 transition-all duration-300 ${
                isCompleted ? 'text-green-400' : isCurrent ? 'text-[color:var(--gumo-yellow)]' : 'text-white/60'
              }`}>
                <p className="text-sm">
                  {stage.text}
                  {stage.id === 'collection' && (
                    <span className="text-white/60"> for {destination}</span>
                  )}
                </p>
              </div>

              {/* Loading animation for current stage */}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[color:var(--gumo-yellow)]"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Message */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-white/50 text-center">
          {isThinking 
            ? `Creating your perfect ${days}-day ${destination} adventure...`
            : `Almost ready! Finalizing your ${days}-day itinerary...`
          }
        </p>
      </div>
    </div>
  )
}