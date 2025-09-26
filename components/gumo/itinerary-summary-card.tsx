"use client"

import Image from "next/image"
import Link from "next/link"

type SummaryItem = {
  title: string
}

export default function ItinerarySummaryCard({
  title = "Trip to Bangkok (v1)",
  description = "Immerse yourself in the vibrant tapestry of Bangkok, where ancient traditions and modern wonders collide in a captivating city.",
  items = [{ title: "Bangkokian Museum" }, { title: "SOI Bangkok Restaurant" }, { title: "Asiatique The Riverfront" }],
  href = "/itinerary",
  image = "/images/reference/itinerary-card.png",
}: {
  title?: string
  description?: string
  items?: SummaryItem[]
  href?: string
  image?: string
}) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-black/55" />
      <Image
        src={image || "/placeholder.svg"}
        alt=""
        width={1200}
        height={700}
        className="h-56 w-full object-cover"
        priority
      />
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-white/85 text-sm leading-6 line-clamp-2">{description}</p>
        <ul className="mt-2 list-disc pl-5 text-white/90 text-sm space-y-1">
          {items.slice(0, 3).map((it, idx) => (
            <li key={idx}>{it.title}</li>
          ))}
        </ul>
        <Link href={href} className="mt-3 inline-flex items-center gap-2 text-white font-medium">
          <span className="text-[13px] tracking-wide">VIEW FULL ITINERARY</span>
          <span aria-hidden>↗</span>
        </Link>
      </div>

      {/* subtle ambient glow */}
      <div className="pointer-events-none absolute -inset-1 rounded-[28px] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(255,230,0,0.15),rgba(0,0,0,0))]" />
    </div>
  )
}
