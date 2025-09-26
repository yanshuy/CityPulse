"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Paperclip, Phone } from "lucide-react"

export function ChatInput() {
  const [value, setValue] = useState("")
  const router = useRouter()

  function submit() {
    if (!value.trim()) return
    router.push(`/explore?prompt=${encodeURIComponent(value.trim())}`)
  }

  return (
    <div className="relative">
      <label htmlFor="gumo-chat" className="sr-only">
        Ask Gumo anything
      </label>
      <div className="rounded-2xl bg-[color:var(--gumo-surface)] gumo-input-outline px-4 py-3 flex items-center justify-between">
        <input
          id="gumo-chat"
          placeholder="Ask me anything..."
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
