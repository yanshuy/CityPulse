"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

export function SuggestionCard({ image, title }: { image: string; title: string }) {
  const router = useRouter()
  return (
    <button
      className="gumo-card w-full px-3.5 py-3 text-left flex items-center gap-3"
      aria-label={title}
      onClick={() => router.push(`/explore?prompt=${encodeURIComponent(title)}`)}
    >
      <div className="overflow-hidden rounded-xl">
        <Image src={image || "/placeholder.svg"} alt="" width={96} height={72} className="h-24 w-32 object-cover" />
      </div>
      <p className="text-[15px] leading-6 text-white/90">{title}</p>
    </button>
  )
}
