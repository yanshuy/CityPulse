"use client"

import { useState, useMemo } from "react"
import { useUser, updateUser } from "@/lib/user-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type EvaluateGoalsResponse = {
  success: boolean
  data?: {
    primary?: {
      title: string
      destination?: string
      time?: string
      days?: string[]
      method?: string
      reason?: string
    }
    goals: {
      title: string
      destination?: string
      time?: string
      days?: string[]
      method?: string
      reason?: string
    }[]
  }
  error?: string
}

const SUGGESTED_INTERESTS = [
  "Live Music",
  "Food Trucks",
  "Italian Food",
  "Craft Beer",
  "Parks",
  "Coffee",
  "Budget Eats",
  "Museums",
  "Morning Runs",
  "Bookstores",
]

export function PreferencesComposer({
  autoOpen = true,
  onClose,
}: {
  autoOpen?: boolean
  onClose?: () => void
}) {
  const { user } = useUser()
  const [username, setUsername] = useState(user?.username || "")
  const [pointInput, setPointInput] = useState("")
  const [points, setPoints] = useState<string[]>(user?.goals?.length ? user.goals : [])
  const [interestInput, setInterestInput] = useState("")
  const [interests, setInterests] = useState<string[]>(user?.preferences?.length ? user.preferences : [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const show = useMemo(() => {
    if (!autoOpen) return true
    // first-time users: no username or no points trigger onboarding
    return !user?.username || !user?.goals?.length
  }, [autoOpen, user])

  function addPoint() {
    const v = pointInput.trim()
    if (!v) return
    setPoints((prev) => Array.from(new Set([...prev, v])))
    setPointInput("")
  }

  function removePoint(item: string) {
    setPoints((prev) => prev.filter((p) => p !== item))
  }

  function toggleInterest(tag: string) {
    setInterests((prev) => {
      return prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    })
  }

  function addInterest() {
    const v = interestInput.trim()
    if (!v) return
    setInterests((prev) => Array.from(new Set([...prev, v])))
    setInterestInput("")
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      setMessage(null)

      // persist base user object
      updateUser({
        username: username.trim(),
        goals: points,
        preferences: interests,
        overrides: user?.overrides || [],
      })

      // evaluate goals with AI using points + interests
      const res = await fetch("/api/preferences/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            schedulePoints: points,
            interests,
          },
        }),
      })

      const json: EvaluateGoalsResponse = await res.json()
      if (!json.success) {
        setMessage(json.error || "Could not evaluate goals right now.")
      } else {
        updateUser({
          ai: {
            primary: json.data?.primary,
            goals: json.data?.goals || [],
          },
        })
        setMessage("Your vibe is set. We generated goals tailored to your routine.")
      }

      onClose?.()
    } catch (e) {
      setMessage("Something went wrong saving your preferences.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
      <Card className="w-full max-w-2xl border-border bg-card text-foreground">
        <CardHeader className="space-y-2">
          <CardTitle className="text-balance text-2xl">Tell Us Your Vibe</CardTitle>
          <CardDescription className="text-pretty">
            Welcome! Help us learn your day-to-day so we can plan smarter. Add a few points about your week and what you
            enjoy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Username */}
          <section className="space-y-2">
            <label className="text-sm font-medium">Your name</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Alex"
              className="bg-background"
              aria-label="Your name"
            />
          </section>

          <Separator />

          {/* Schedule Points */}
          <section className="space-y-3">
            <div>
              <div className="text-sm font-medium">Daily schedule points</div>
              <p className="text-muted-foreground text-sm">
                Examples: {'"from monday to friday i have work 9-5"'}, {'"saturday morning i relax"'},{" "}
                {'"i go play football in the evening on saturday"'}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={pointInput}
                onChange={(e) => setPointInput(e.target.value)}
                placeholder='Type a point like: "from monday to friday i have work 9-5"'
                className="flex-1 bg-background"
                aria-label="Add schedule point"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addPoint()
                  }
                }}
              />
              <Button onClick={addPoint} variant="default">
                Add
              </Button>
            </div>
            {!!points.length && (
              <div className="flex flex-wrap gap-2">
                {points.map((p) => (
                  <Badge
                    key={p}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removePoint(p)}
                    aria-label={`Remove point: ${p}`}
                  >
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Interests */}
          <section className="space-y-3">
            <div>
              <div className="text-sm font-medium">Interests</div>
              <p className="text-muted-foreground text-sm">Tap to select suggested interests or add your own.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_INTERESTS.map((tag) => {
                const active = interests.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={active ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleInterest(tag)}
                    aria-pressed={active}
                    aria-label={`Toggle interest: ${tag}`}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Add a custom interest"
                className="flex-1 bg-background"
                aria-label="Add custom interest"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addInterest()
                  }
                }}
              />
              <Button onClick={addInterest} variant="outline">
                Add
              </Button>
            </div>
            {!!interests.length && (
              <div className="flex flex-wrap gap-2">
                {interests.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save & Generate Goals"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreferencesComposer
