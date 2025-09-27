"use client"

import { useState } from "react"
import { useUser, updateUser } from "@/lib/user-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function OverridesComposer({
  compact = false,
  reevaluate = true,
}: {
  compact?: boolean
  // if reevaluate is true, we append the override to schedule points when asking AI to reprioritize
  reevaluate?: boolean
}) {
  const { user } = useUser()
  const [text, setText] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    const v = text.trim()
    if (!v) return
    setLoading(true)
    setStatus(null)

    // persist override
    updateUser({ overrides: [...(user?.overrides || []), v] })

    try {
      if (reevaluate) {
        const schedule = [...(user?.goals || []), v] // treat override as a timely schedule point
        const interests = user?.preferences || []

        const res = await fetch("/api/preferences/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences: {
              schedulePoints: schedule,
              interests,
            },
          }),
        })
        const json = await res.json()
        if (json?.success) {
          updateUser({
            ai: {
              primary: json.data?.primary,
              goals: json.data?.goals || [],
            },
          })
          setStatus("Override added and goals updated.")
        } else {
          setStatus("Override added. Couldn’t update goals right now.")
        }
      } else {
        setStatus("Override added.")
      }
    } catch {
      setStatus("Override added. Failed to update goals.")
    } finally {
      setLoading(false)
      setText("")
    }
  }

  if (compact) {
    return (
      <div className="flex w-full items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='E.g., "Find me a place for dinner and some live music tonight. Nothing too expensive."'
          className="bg-background"
          aria-label="Add override"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <Button onClick={handleAdd} disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full border-border bg-card text-foreground">
      <CardHeader>
        <CardTitle className="text-lg">Sudden changes</CardTitle>
        <CardDescription>Add a one-off plan that temporarily adjusts your day.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='E.g., "Find me a place for dinner and some live music tonight. Nothing too expensive."'
          className="bg-background"
          aria-label="Add override"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <div className="flex justify-end">
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? "Adding..." : "Add override"}
          </Button>
        </div>
        {status && <p className="text-sm text-muted-foreground">{status}</p>}
      </CardContent>
    </Card>
  )
}

export default OverridesComposer
