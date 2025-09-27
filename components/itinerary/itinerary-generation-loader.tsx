"use client"

import { useState, useEffect } from "react"

interface LoadingStage {
  id: string
  text: string
  duration: number // seconds to wait before marking as complete
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
    duration: 2
  },
  {
    id: "dna",
    text: "Decoding your travel DNA",
    duration: 3
  },
  {
    id: "spots",
    text: "Finding the coolest spots to visit",
    duration: 4
  },
  {
    id: "collection",
    text: "Building your once-in-a-lifetime collection",
    duration: 5
  }
]

export default function ItineraryGenerationLoader({
  destination,
  days,
  onComplete
}: ItineraryGenerationLoaderProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const progressStage = (stageIndex: number) => {
      if (stageIndex >= LOADING_STAGES.length) {
        setIsComplete(true)
        onComplete?.()
        return
      }

      const stage = LOADING_STAGES[stageIndex]
      setCurrentStage(stageIndex)

      timeoutId = setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, stage.id]))

        // Move to next stage after a brief pause
        setTimeout(() => {
          progressStage(stageIndex + 1)
        }, 500)
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto">
      {/* Header with spinning loader */}
      <div className="flex items-center justify-center mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500"></div>
      </div>

      {/* Loading text */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Creating your itinerary
        </h3>
        <p className="text-sm text-gray-600">
          {days} days in {destination}
        </p>
      </div>

      {/* Progress stages */}
      <div className="space-y-3">
        {LOADING_STAGES.map((stage, index) => {
          const isCompleted = completedStages.has(stage.id)
          const isCurrent = currentStage === index && !isCompleted
          const isPending = index > currentStage

          return (
            <div
              key={stage.id}
              className="flex items-center gap-3"
            >
              {/* Status indicator */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isCompleted
                  ? 'bg-green-500'
                  : isCurrent
                    ? 'bg-blue-500 animate-pulse'
                    : 'bg-gray-200'
                }`}>
                {isCompleted && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Stage text */}
              <p className={`text-sm ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                }`}>
                {stage.text}
              </p>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${((completedStages.size + (currentStage < LOADING_STAGES.length ? 0.5 : 0)) / LOADING_STAGES.length) * 100}%`
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          {Math.round(((completedStages.size + (currentStage < LOADING_STAGES.length ? 0.5 : 0)) / LOADING_STAGES.length) * 100)}% complete
        </p>
      </div>
    </div>
  )
}
