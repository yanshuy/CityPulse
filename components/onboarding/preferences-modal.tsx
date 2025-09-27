"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { UserPreferences } from "@/lib/preferences"

const INTEREST_TAGS = [
  "Live Music",
  "Food Trucks",
  "Italian Food",
  "Craft Beer",
  "Parks",
  "Street Markets",
  "Museums",
  "Hiking",
]

type Props = {
  open: boolean
  onClose: () => void
  onSave: (prefs: UserPreferences) => void
}

export default function PreferencesModal({ open, onClose, onSave }: Props) {
  const [home, setHome] = useState("")
  const [work, setWork] = useState("")
  const [start, setStart] = useState("09:00")
  const [end, setEnd] = useState("17:00")
  const [transport, setTransport] = useState("Driving")
  const [interests, setInterests] = useState<string[]>([])
  const [schedulePoints, setSchedulePoints] = useState<string[]>([])
  const [scheduleInput, setScheduleInput] = useState("")
  const [interestInput, setInterestInput] = useState("")

  useEffect(() => {
    if (!open) return
    setInterests([])
    setSchedulePoints([])
    setScheduleInput("")
    setInterestInput("")
  }, [open])

  if (!open) return null

  function addSchedulePoint() {
    const v = scheduleInput.trim()
    if (!v) return
    setSchedulePoints((prev) => [...prev, v])
    setScheduleInput("")
  }

  function removeSchedulePoint(idx: number) {
    setSchedulePoints((prev) => prev.filter((_, i) => i !== idx))
  }

  function addCustomInterest() {
    const v = interestInput.trim()
    if (!v) return
    setInterests((prev) => (prev.includes(v) ? prev : [...prev, v]))
    setInterestInput("")
  }

  function toggleInterest(tag: string) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleSave() {
    const prefs: UserPreferences = {
      home: home.trim(),
      work: work.trim(),
      workHours: { start, end },
      transport,
      interests,
      schedulePoints,
      createdAt: Date.now(),
    }
    onSave(prefs)
  }

  const canSave = (home.trim() && work.trim() && start && end && transport) || schedulePoints.length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4"
    >
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-white/10 bg-[color:var(--gumo-bg)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--gumo-text)]">Tell Us Your Vibe</h2>
            <p className="text-sm text-[color:var(--gumo-muted)]">
              We’ll personalize your goals and suggestions based on your routine and interests.
            </p>
          </div>
          <button aria-label="Close" onClick={onClose} className="text-[color:var(--gumo-muted)] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Welcoming schedule capture */}
          <div>
            <Label className="text-[color:var(--gumo-muted)]">What’s your daily schedule like?</Label>
            <p className="text-xs mt-1 text-[color:var(--gumo-muted)]">
              Add a few points in your own words. Examples: {"“From Monday to Friday I have work 9-5”"},{" "}
              {"“Saturday morning I relax”"},{" “I play football Saturday evening”"}, {"“Sunday morning house work”"},{" "}
              {"“Sunday afternoon movies or shopping”"}.
            </p>

            <div className="mt-3 flex gap-2">
              <Input
                value={scheduleInput}
                onChange={(e) => setScheduleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSchedulePoint()
                  }
                }}
                placeholder='e.g., "From Monday to Friday I have work 9-5"'
                className="flex-1"
                style={{
                  backgroundColor: "var(--gumo-surface)",
                  borderColor: "var(--gumo-navy)",
                  color: "var(--gumo-text)",
                }}
              />
              <Button
                type="button"
                onClick={addSchedulePoint}
                className="bg-[color:var(--gumo-yellow)] text-black hover:bg-[color:var(--gumo-yellow)]/90"
              >
                Add
              </Button>
            </div>

            {schedulePoints.length > 0 && (
              <ul className="mt-3 space-y-2">
                {schedulePoints.map((pt, idx) => (
                  <li
                    key={`${pt}-${idx}`}
                    className="flex items-start gap-2 rounded-lg border border-[color:var(--gumo-navy)] p-2 text-sm"
                  >
                    <span className="mt-1 text-[color:var(--gumo-yellow)]">•</span>
                    <span className="flex-1 text-[color:var(--gumo-text)]">{pt}</span>
                    <button
                      aria-label="Remove item"
                      onClick={() => removeSchedulePoint(idx)}
                      className="text-[color:var(--gumo-muted)] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Locations */}
          <div>
            <Label htmlFor="home" className="text-[color:var(--gumo-muted)]">
              Home Location
            </Label>
            <Input
              id="home"
              placeholder="e.g., Andheri West, Mumbai"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="mt-1"
              style={{
                backgroundColor: "var(--gumo-surface)",
                borderColor: "var(--gumo-navy)",
                color: "var(--gumo-text)",
              }}
            />
          </div>

          <div>
            <Label htmlFor="work" className="text-[color:var(--gumo-muted)]">
              Work Location
            </Label>
            <Input
              id="work"
              placeholder="e.g., Bandra Kurla Complex"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              className="mt-1"
              style={{
                backgroundColor: "var(--gumo-surface)",
                borderColor: "var(--gumo-navy)",
                color: "var(--gumo-text)",
              }}
            />
          </div>

          {/* Work hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start" className="text-[color:var(--gumo-muted)]">
                Work starts
              </Label>
              <Input
                id="start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1"
                style={{
                  backgroundColor: "var(--gumo-surface)",
                  borderColor: "var(--gumo-navy)",
                  color: "var(--gumo-text)",
                }}
              />
            </div>
            <div>
              <Label htmlFor="end" className="text-[color:var(--gumo-muted)]">
                Work ends
              </Label>
              <Input
                id="end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1"
                style={{
                  backgroundColor: "var(--gumo-surface)",
                  borderColor: "var(--gumo-navy)",
                  color: "var(--gumo-text)",
                }}
              />
            </div>
          </div>

          {/* Transport */}
          <div>
            <Label className="text-[color:var(--gumo-muted)]">Primary Transport</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {["Driving", "Metro", "Train", "Bus", "Bike", "Walk"].map((opt) => (
                <Button
                  key={opt}
                  type="button"
                  variant={transport === opt ? "default" : "outline"}
                  onClick={() => setTransport(opt)}
                  className={`h-9 ${transport === opt
                      ? "bg-[color:var(--gumo-yellow)] text-black"
                      : "border-[color:var(--gumo-navy)] text-[color:var(--gumo-text)]"
                    }`}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <Label className="text-[color:var(--gumo-muted)]">Interests</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTEREST_TAGS.map((tag) => {
                const active = interests.includes(tag)
                return (
                  <Badge
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    className={`cursor-pointer ${active
                        ? "bg-[color:var(--gumo-yellow)] text-black"
                        : "bg-[color:var(--gumo-navy)] text-[color:var(--gumo-text)] border-[color:var(--gumo-navy)]"
                      }`}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCustomInterest()
                  }
                }}
                placeholder='Add your own, e.g., "Korean BBQ"'
                className="flex-1"
                style={{
                  backgroundColor: "var(--gumo-surface)",
                  borderColor: "var(--gumo-navy)",
                  color: "var(--gumo-text)",
                }}
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                className="bg-[color:var(--gumo-yellow)] text-black hover:bg-[color:var(--gumo-yellow)]/90"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[color:var(--gumo-navy)] text-[color:var(--gumo-text)] bg-transparent"
          >
            Not now
          </Button>
          <Button
            disabled={!canSave}
            onClick={handleSave}
            className="flex-1 bg-[color:var(--gumo-yellow)] text-black hover:bg-[color:var(--gumo-yellow)]/90"
          >
            Save preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
