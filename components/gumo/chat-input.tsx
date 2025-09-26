"use client"

import { useState } from "react"
import { Paperclip, Phone } from "lucide-react"

interface ChatInputProps {
  onQuerySubmit: (query: string) => void
}

export function ChatInput({ onQuerySubmit }: ChatInputProps) {
  const [value, setValue] = useState("")

  function submit() {
    if (!value.trim()) return
    onQuerySubmit(value.trim())
    setValue("") // Clear input after submission
  }

  return (
    <div className="relative">
      <label htmlFor="gumo-chat" className="sr-only">
        Ask about traffic, events, or local places...
      </label>
      <div className="rounded-2xl bg-[color:var(--gumo-surface)] gumo-input-outline px-4 py-3 flex items-center justify-between">
        <input
          id="gumo-chat"
          placeholder="Ask about traffic, events, or local places..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="bg-transparent placeholder:text-white/40 text-[15px] leading-6 text-white/90 outline-none flex-1"
        />
        <div className="ml-3 flex items-center gap-3 text-white/60">
          <button aria-label="Attach" onClick={() => alert("Mock: open file picker")}>
            <Paperclip className="size-5" aria-hidden />
          </button>
          <button aria-label="Call" onClick={() => alert("Mock: start voice call")}>
            <Phone className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
