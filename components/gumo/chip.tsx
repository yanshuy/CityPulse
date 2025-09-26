"use client"

import type React from "react"

import { X } from "lucide-react"

export function Chip({
  children,
  removable,
  onRemove,
  active,
}: {
  children: React.ReactNode
  removable?: boolean
  onRemove?: () => void
  active?: boolean
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm",
        active ? "bg-[color:var(--gumo-yellow)] text-black" : "bg-[color:var(--gumo-surface)] text-white/90",
      ].join(" ")}
    >
      {children}
      {removable && (
        <button aria-label="Remove" onClick={onRemove} className="text-black/70">
          <X className="size-4" />
        </button>
      )}
    </span>
  )
}
