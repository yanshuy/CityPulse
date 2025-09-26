'use client'

import React, { useState, useRef, useEffect } from 'react'

interface SwipeableProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipe?: (direction: 'left' | 'right', distance: number) => void
  threshold?: number
  className?: string
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipe,
  threshold = 50,
  className = ''
}: SwipeableProps) {
  const [startX, setStartX] = useState<number | null>(null)
  const [startY, setStartY] = useState<number | null>(null)
  const [currentX, setCurrentX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX)
    setStartY(clientY)
    setCurrentX(clientX)
    setIsDragging(true)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || startX === null || startY === null) return

    setCurrentX(clientX)

    // Prevent vertical scrolling while swiping horizontally
    const deltaX = Math.abs(clientX - startX)
    const deltaY = Math.abs(clientY - startY)
    
    if (deltaX > deltaY && deltaX > 10) {
      // Horizontal swipe is dominant, prevent default scroll behavior
      return false
    }
  }

  const handleEnd = () => {
    if (!isDragging || startX === null || currentX === null) {
      setIsDragging(false)
      setStartX(null)
      setStartY(null)
      setCurrentX(null)
      return
    }

    const deltaX = currentX - startX
    const deltaY = startY !== null ? Math.abs((currentX) - startY) : 0
    const distance = Math.abs(deltaX)

    // Only trigger swipe if horizontal movement is dominant and exceeds threshold
    if (distance > threshold && Math.abs(deltaX) > deltaY) {
      const direction = deltaX > 0 ? 'right' : 'left'
      
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft()
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight()
      }

      if (onSwipe) {
        onSwipe(direction, distance)
      }
    }

    setIsDragging(false)
    setStartX(null)
    setStartY(null)
    setCurrentX(null)
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (handleMove(touch.clientX, touch.clientY) === false) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  return (
    <div
      ref={elementRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        touchAction: 'pan-y', // Allow vertical scrolling but handle horizontal swipes
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {children}
    </div>
  )
}