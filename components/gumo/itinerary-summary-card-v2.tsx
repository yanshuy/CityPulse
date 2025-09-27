"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

type Props = {
  title: string
  blurb: string
  bullets: string[]
  href: string
  imageSrc?: string
  className?: string
}

export default function ItinerarySummaryCardV2({
  title,
  blurb,
  bullets,
  href,
  imageSrc = "/images/reference/itinerary-summary-user.png",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={[
        "group relative block overflow-hidden rounded-3xl",
        "border border-white/10 bg-gradient-to-br from-white/5 to-white/2",
        "backdrop-blur-sm shadow-2xl shadow-black/20",
        "transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50",
        className,
      ].join(" ")}
      aria-label={`${title} — view full itinerary`}
    >
      {/* Background image with improved overlay */}
      <div className="relative h-[34rem]">
        <Image
          src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/40/ce/c3/mumbai-marine-drive-along.jpg?w=900&h=-1&s=1"
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/30 to-black/60" />
      </div>

      {/* Content overlay with improved layout */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="text-white space-y-4">
          {/* Title with better typography */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
              {title}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-white/90 max-w-[50ch]">
              {blurb}
            </p>
          </div>

          {/* Highlights with modern styling */}
          {bullets?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/80 uppercase tracking-wide">
                Highlights
              </h4>
              <ul className="space-y-1">
                {bullets.slice(0, 3).map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/90 m-0">
                    <div className="mt-2 h-1 w-1 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enhanced CTA button */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-400 text-black font-semibold text-sm transition-all duration-200 group-hover:bg-yellow-300 group-hover:shadow-lg group-hover:shadow-yellow-400/25 shadow-lg">
              View full itinerary
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Subtle accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent" />
    </Link>
  )
}
