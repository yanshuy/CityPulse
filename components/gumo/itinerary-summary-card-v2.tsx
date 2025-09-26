"use client"

import Link from "next/link"
import Image from "next/image"

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
        "group relative block overflow-hidden rounded-2xl",
        "ring-1 ring-[color:var(--border-muted,#2a2a2a)]",
        "shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        "transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5",
        className,
      ].join(" ")}
      aria-label={`${title} — view full itinerary`}
    >
      {/* Background image */}
      <div className="relative aspect-[16/9]">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
        {/* Strong bottom gradient + soft vignette to ensure readability */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.65)_30%,rgba(0,0,0,0.35)_60%,transparent_85%)]" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
        <div className="text-white">
          <h3 className="text-lg sm:text-xl font-semibold drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed opacity-95 max-w-[60ch] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {blurb}
          </p>

          {bullets?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {bullets.slice(0, 3).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm opacity-95">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/90" aria-hidden />
                  <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <span
            className={[
              "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2",
              "bg-[color:var(--brand-yellow,#ffe600)] text-black font-medium",
              "shadow-[0_4px_16px_rgba(255,230,0,0.35)]",
              "transition-colors group-hover:bg-[color:var(--brand-yellow-strong,#ffd400)]",
            ].join(" ")}
          >
            View full itinerary
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
              <path fill="currentColor" d="M13 5l7 7-7 7v-4H4v-6h9V5z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Soft bottom glow accent */}
      <div className="pointer-events-none absolute -bottom-2 left-4 right-4 h-2 rounded-full blur-md opacity-60 bg-[color:var(--brand-yellow,#ffe600)]" />
    </Link>
  )
}
