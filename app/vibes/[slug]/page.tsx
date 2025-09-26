"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { Chip } from "@/components/gumo/chip"
import Link from "next/link"

const MOCK_VIBES = {
  "solo-relax": {
    title: "Solo Relax",
    desc: "I remember the moment I decided to travel solo—it felt like stepping into a world where every choice was mine alone. No compromises, no agendas but my …",
    interests: ["Hiking", "Relax", "Nature", "Offbeat"],
    auto: ["Hiking", "Relax", "Nature", "Offbeat"],
  },
}

export default function VibeDetail({ params }: { params: { slug: string } }) {
  const vibe = useMemo(
    () => MOCK_VIBES[params.slug as keyof typeof MOCK_VIBES] ?? MOCK_VIBES["solo-relax"],
    [params.slug],
  )
  const [interests, setInterests] = useState<string[]>(vibe.interests)
  const [tab, setTab] = useState<"images" | "links" | "documents">("images")

  function addInterest() {
    const next = prompt("Add an interest (mock):")
    if (next && !interests.includes(next)) setInterests([...interests, next])
  }

  return (
    <main className="mx-auto max-w-md min-h-dvh">
      {/* Yellow Header */}
      <div className="relative overflow-hidden rounded-b-[2rem] bg-[color:var(--gumo-yellow)] text-black p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-medium">
            Solo Relax
          </Link>
          <button className="rounded-xl bg-black/10 px-3 py-1.5 text-sm">Edit Vibe</button>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">{vibe.title}</h1>
        <div
          className="absolute -right-6 -bottom-8 h-28 w-40 rounded-tl-[3rem] bg-[color:var(--gumo-purple)]/40"
          aria-hidden
        />
      </div>

      {/* Body */}
      <div className="px-4 py-6 space-y-6">
        <section>
          <p className="text-white/80">{vibe.desc}</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Interests</h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((t) => (
              <Chip key={t} removable onRemove={() => setInterests(interests.filter((x) => x !== t))}>
                {t}
              </Chip>
            ))}
            <button
              onClick={addInterest}
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-[color:var(--gumo-yellow)] px-3 py-1.5 text-sm text-black"
            >
              <Plus className="size-4" /> Add Interests
            </button>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-semibold">Auto Tags</h3>
          <div className="flex flex-wrap gap-2">
            {vibe.auto.map((t) => (
              <Chip key={`auto-${t}`}>{t}</Chip>
            ))}
          </div>
        </section>

        <section>
          <div className="flex gap-6 border-b border-white/10">
            {(["images", "links", "documents"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={[
                  "relative px-1 py-3 text-sm",
                  tab === k ? "text-[color:var(--gumo-yellow)]" : "text-white/70",
                ].join(" ")}
              >
                {k[0].toUpperCase() + k.slice(1)}
                {tab === k && (
                  <span className="absolute left-0 right-0 -bottom-[1px] mx-auto h-1 w-10 rounded-full bg-[color:var(--gumo-yellow)]" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === "images" && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Image
                    key={i}
                    src={`/travel-.jpg?height=300&width=300&query=travel-${i + 1}`}
                    alt=""
                    width={300}
                    height={300}
                    className="h-36 w-full rounded-xl object-cover"
                  />
                ))}
                <button className="col-span-2 gumo-card px-4 py-3 text-left" onClick={() => alert("Mock: add images")}>
                  + Add Images
                </button>
              </div>
            )}
            {tab === "links" && (
              <ul className="space-y-3">
                {["Best cafes in Goa", "Hidden waterfalls near Margao"].map((t) => (
                  <li key={t} className="gumo-card px-4 py-3">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {tab === "documents" && (
              <div className="space-y-3">
                <button className="gumo-card px-4 py-3 w-full text-left" onClick={() => alert("Mock: upload document")}>
                  + Upload Document
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
