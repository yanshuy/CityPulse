"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, MessageSquare, Plus, SquareDashedBottom } from "lucide-react"

interface TopBarProps {
  onShowHistory?: () => void
  onNewChat?: () => void
}

export function TopBar({ onShowHistory, onNewChat }: TopBarProps) {
  return (
    <header className="relative mt-1 flex items-center justify-center">
      {/* Left floating icons */}
      <div className="absolute left-0 top-0 flex items-center gap-2">
        <button
          onClick={onShowHistory}
          className="h-8 w-8 rounded-xl bg-[color:var(--gumo-surface)] grid place-items-center hover:bg-[color:var(--gumo-surface)]/80 transition-colors"
          aria-label="Show chat history"
        >
          <SquareDashedBottom className="size-4 text-[color:var(--gumo-text)]/70" aria-hidden />
        </button>
        <button
          onClick={onNewChat}
          className="h-8 w-8 rounded-xl bg-[color:var(--gumo-surface)] grid place-items-center hover:bg-[color:var(--gumo-surface)]/80 transition-colors"
          aria-label="Start new chat"
        >
          <Plus className="size-4 text-[color:var(--gumo-text)]/70" aria-hidden />
        </button>
      </div>

      {/* Center pill selector */}
      <button className="gumo-pill px-3 py-1.5 pr-2 inline-flex items-center gap-2" aria-label="Select vibe">
        <Avatar className="h-7 w-7">
          <AvatarImage alt="Profile" src="/diverse-avatars.png" />
          <AvatarFallback className="bg-[oklch(0.68_0.2_30)] text-black">G</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-white/90">Aryan Pandey</span>
        <ChevronDown className="ml-1 size-4 text-white/80" aria-hidden />
      </button>

      {/* Right floating icon */}
      <div className="absolute right-0 top-0 h-8 w-8 rounded-xl bg-[color:var(--gumo-surface)] grid place-items-center">
        <MessageSquare className="size-4 text-[color:var(--gumo-text)]/70" aria-hidden />
      </div>
    </header>
  )
}
