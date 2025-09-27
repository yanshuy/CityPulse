export type UserPreferences = {
  home: string
  work: string
  workHours: { start: string; end: string } // "09:00", "17:00"
  transport: string // e.g., "Driving", "Metro Line B"
  interests: string[]
  schedulePoints?: string[]
  createdAt: number
}

const KEY = "citypulse_prefs_v1"
const GOALS_KEY = "citypulse_ai_goals_v1"

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(prefs))
}

export function loadPreferences(): UserPreferences | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as UserPreferences) : null
  } catch {
    return null
  }
}

export function hasPreferences(): boolean {
  return !!loadPreferences()
}

export type AiGoal = {
  title: string
  destination?: string
  time?: string
  days?: string[]
  method?: string
  reason?: string
}

export function saveAiGoals(goals: { goals: AiGoal[]; primary?: AiGoal } | null) {
  if (typeof window === "undefined") return
  if (!goals) {
    localStorage.removeItem(GOALS_KEY)
    return
  }
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

export function loadAiGoals(): { goals: AiGoal[]; primary?: AiGoal } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    return raw ? (JSON.parse(raw) as { goals: AiGoal[]; primary?: AiGoal }) : null
  } catch {
    return null
  }
}
