"use client"

import Image from "next/image"

export function SuggestionCard({
  image,
  title,
  onClick,
}: {
  image: string
  title: string
  onClick: () => void
}) {
  return (
    <button
      className="gumo-card w-full px-3.5 py-3 text-left flex items-center gap-3"
      aria-label={title}
      onClick={onClick}
    >
      <div className="overflow-hidden rounded-xl">
        <Image
          src={image || "/placeholder.svg"}
          alt=""
          width={96}
          height={72}
          className="h-24 w-32 object-cover"
        />
      </div>
      <p className="text-[15px] leading-6 text-white/90">{title}</p>
    </button>
  )
}
