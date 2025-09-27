"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResizableDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
  minHeight?: number
  maxHeight?: number
  defaultHeight?: number
  className?: string
}

export function ResizableDrawer({
  open,
  onOpenChange,
  children,
  title,
  minHeight = 200,
  maxHeight = 800,
  defaultHeight = 400,
  className,
}: ResizableDrawerProps) {
  const [drawerHeight, setDrawerHeight] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartHeight, setDragStartHeight] = useState(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStartY(e.clientY)
    setDragStartHeight(drawerHeight)
    document.body.style.cursor = 'ns-resize'
  }, [drawerHeight])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
    setDragStartHeight(drawerHeight)
  }, [drawerHeight])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      
      const deltaY = dragStartY - e.clientY
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, dragStartHeight + deltaY)
      )
      setDrawerHeight(newHeight)
    },
    [isDragging, dragStartY, dragStartHeight, minHeight, maxHeight]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return
      
      e.preventDefault() // Prevent scrolling while dragging
      const deltaY = dragStartY - e.touches[0].clientY
      const newHeight = Math.max(
        minHeight,
        Math.min(maxHeight, dragStartHeight + deltaY)
      )
      setDrawerHeight(newHeight)
    },
    [isDragging, dragStartY, dragStartHeight, minHeight, maxHeight]
  )

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = 'auto'
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleEnd])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        ref={drawerRef}
        showHandle={false}
        className={cn(
          "bg-[color:var(--gumo-surface)] border-white/20 text-[color:var(--gumo-text)]",
          className
        )}
        style={{
          height: `${drawerHeight}px`,
          maxHeight: `${maxHeight}px`,
          minHeight: `${minHeight}px`,
        }}
      >
        {/* Custom Drag Handle */}
        <div className="flex items-center justify-center py-3 px-4 border-b border-white/10 relative">
          {/* Resizable handle */}
          <div
            className={cn(
              "absolute top-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-[color:var(--gumo-muted)]/50 rounded-full transition-all duration-200 cursor-ns-resize hover:bg-[color:var(--gumo-muted)] hover:h-1.5",
              isDragging && "bg-[color:var(--gumo-yellow)] h-1.5"
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          
          {/* Title and Close Button */}
          <div className="flex items-center justify-between w-full mt-2">
            <h2 className="text-lg font-semibold text-[color:var(--gumo-text)]">
              {title || "Details"}
            </h2>
            <DrawerClose asChild>
              <button 
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg bg-[color:var(--gumo-bg)]/50 hover:bg-[color:var(--gumo-bg)] transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[color:var(--gumo-text)]" />
              </button>
            </DrawerClose>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 pb-6"
          style={{
            maxHeight: `${drawerHeight - 80}px`
          }}
        >
          {children}
        </div>

        {/* Resize indicator when dragging */}
        {isDragging && (
          <div className="absolute top-4 right-4 bg-[color:var(--gumo-yellow)] text-black px-2 py-1 rounded text-xs font-medium">
            {Math.round(drawerHeight)}px
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
