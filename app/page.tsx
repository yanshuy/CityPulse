"use client"

import { TopBar } from "@/components/gumo/top-bar"
import { SuggestionCard } from "@/components/gumo/suggestion-card"
import { BottomNav } from "@/components/gumo/bottom-nav"
import { ChatInput } from "@/components/gumo/chat-input"
import { ChatHistory } from "@/components/gumo/chat-history"
import PlannerForm from "@/components/planner/planner-form"
import TrafficInsights from "@/components/gumo/traffic-insights"
import EventsList from "@/components/gumo/events-list"
import FoodList from "@/components/gumo/food-list"
import ExploreGrid from "@/components/gumo/explore-grid"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { chatHistoryDB, generateSessionId, generateSessionTitle, type ChatSession } from "@/lib/chat-history"
import ItinerarySummaryCardV2 from "@/components/gumo/itinerary-summary-card-v2"

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])

  type PlannerData = {
    destination: string
    days: number
    suggestedTitle: string
    description: string
    highlights: string[]
    bestTimeToVisit: string
    estimatedBudget: string
    suggestedActivities: Array<{
      day: number
      activity: string
      location: string
      duration: string
    }>
  }

  type TrafficData = {
    route: string
    fromLocation: string
    toLocation: string
    currentStatus: 'light' | 'moderate' | 'heavy' | 'severe'
    estimatedTime: string
    estimatedDelay: string
    alternativeRoutes: Array<{
      name: string
      estimatedTime: string
      description: string
    }>
    incidents: Array<{
      type: string
      location: string
      impact: string
      severity: 'low' | 'medium' | 'high'
    }>
    suggestion: string
    lastUpdated: string
  }

  type EventsData = {
    heading: string
    location: string
    timeframe: string
    events: Array<{
      title: string
      date: string
      time: string
      venue: string
      category: 'music' | 'arts' | 'food' | 'sports' | 'tech' | 'cultural' | 'entertainment' | 'business'
      price: string
      description: string
      image?: string
    }>
    totalFound: number
    suggestion: string
  }

  type FoodData = {
    heading: string
    location: string
    cuisine?: string
    restaurants: Array<{
      name: string
      cuisine: string
      rating: number
      priceRange: string
      location: string
      specialty: string
      description: string
      estimatedCost: string
      timings: string
      image?: string
    }>
    totalFound: number
    suggestion: string
  }

  type ExploreData = {
    heading: string
    location: string
    category?: string
    places: Array<{
      name: string
      type: 'tourist_attraction' | 'historical' | 'nature' | 'entertainment' | 'shopping' | 'cultural' | 'religious' | 'modern'
      rating: number
      location: string
      description: string
      highlights: string[]
      bestTimeToVisit: string
      entryFee: string
      estimatedDuration: string
      image?: string
    }>
    totalFound: number
    suggestion: string
  }

  type ChatMessage =
    | { id: string; role: "user"; type: "text"; text: string }
    | { id: string; role: "assistant"; type: "text"; text: string }
    | { id: string; role: "assistant"; type: "planner"; payload: PlannerData }
    | { id: string; role: "assistant"; type: "traffic"; payload: TrafficData }
    | { id: string; role: "assistant"; type: "events"; payload: EventsData }
    | { id: string; role: "assistant"; type: "food"; payload: FoodData }
    | { id: string; role: "assistant"; type: "explore"; payload: ExploreData }
    | {
      id: string
      role: "assistant"
      type: "summary"
      payload: { title: string; blurb: string; bullets: string[]; href: string; imageSrc?: string }
    }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const router = useRouter()

  // Save current session to IndexedDB
  const saveCurrentSession = useCallback(
    async (updatedMessages?: ChatMessage[]) => {
      if (!currentSessionId) return

      const messagesToSave = updatedMessages || messages
      if (messagesToSave.length === 0) return

      const session: ChatSession = {
        id: currentSessionId,
        title: generateSessionTitle(messagesToSave),
        messages: messagesToSave,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await chatHistoryDB.saveSession(session)
    },
    [currentSessionId, messages],
  )

  // Load chat sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await chatHistoryDB.getAllSessions()
        setChatSessions(sessions)
      } catch (error) {
        console.error("Failed to load chat sessions:", error)
      }
    }

    loadSessions()
  }, [])

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentSession(messages)
    }
  }, [messages, saveCurrentSession])

  // Start new chat session
  const startNewChat = useCallback(async () => {
    setCurrentSessionId(generateSessionId())
    setMessages([])
    setShowHistory(false)

    // Refresh the sessions list to show updated history
    try {
      const sessions = await chatHistoryDB.getAllSessions()
      setChatSessions(sessions)
    } catch (error) {
      console.error("Failed to refresh chat sessions:", error)
    }
  }, [])

  // Load existing chat session
  const loadChatSession = useCallback(async (sessionId: string) => {
    try {
      const session = await chatHistoryDB.getSession(sessionId)
      if (session) {
        setCurrentSessionId(sessionId)
        setMessages(session.messages)
        setShowHistory(false)
      }
    } catch (error) {
      console.error("Failed to load chat session:", error)
    }
  }, [])

  useEffect(() => {
    function onAdd(e: Event) {
      const ce = e as CustomEvent<{ title: string; blurb: string; bullets: string[]; href: string; imageSrc?: string }>
      if (!ce.detail) return
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}-s`,
          role: "assistant",
          type: "summary",
          payload: ce.detail,
        },
      ])
    }
    window.addEventListener("gumo:add-itinerary-summary", onAdd as EventListener)
    return () => window.removeEventListener("gumo:add-itinerary-summary", onAdd as EventListener)
  }, [])

  async function handleQuery(query: string) {
    setIsProcessing(true)

    // Initialize new session if none exists
    if (!currentSessionId) {
      setCurrentSessionId(generateSessionId())
    }

    // Immediately show the user's message in the thread
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", type: "text", text: query }])

    try {
      // Step 1: Classify the query to determine UI component type
      const classifyResponse = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const classificationResult = await classifyResponse.json()

      if (classificationResult.success && classificationResult.data) {
        const { type, confidence } = classificationResult.data

        console.log("Classification:", { type, confidence })

        // Step 2: Generate component-specific data if not general
        if (type !== "general" && confidence > 0.7) {
          const componentResponse = await fetch(`/api/components/${type}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          })

          const componentResult = await componentResponse.json()

          if (componentResult.success && componentResult.data) {
            const componentData = componentResult.data

            console.log("Component Data:", componentData)

            // Add AI-powered component with rich data
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}-t`,
                role: "assistant",
                type: "text",
                text: getIntroText(type, componentData),
              },
              {
                id: `a-${Date.now()}-c`,
                role: "assistant",
                type: type,
                payload: componentData,
              },
            ])
          } else {
            // Fallback to general response if component data generation fails
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}`,
                role: "assistant",
                type: "text",
                text: "I had trouble generating specific details. Let me show you some general options.",
              },
            ])
          }
        } else {
          // Handle general queries or low confidence classifications
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: "assistant",
              type: "text",
              text: "Here are some suggestions for you:",
            },
          ])
        }
      } else {
        // Fallback if classification fails
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            type: "text",
            text: "I had trouble understanding that. Try rephrasing your request.",
          },
        ])
      }
    } catch (error) {
      console.error("Error processing query:", error)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", type: "text", text: "Something went wrong. Please try again." },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to generate intro text based on component type
  function getIntroText(type: string, data: any): string {
    switch (type) {
      case "planner":
        return `I can help you plan a ${data.days}-day trip to ${data.destination}. Here are the details:`
      case "traffic":
        return `Here's the current traffic situation for ${data.route}:`
      case "events":
        return `Here are ${data.events?.length || 0} events happening ${data.timeframe?.toLowerCase() || "soon"}:`
      case "food":
        return `Found ${data.restaurants?.length || 0} great dining options in ${data.location}:`
      case "explore":
        return `Discover ${data.places?.length || 0} amazing places to explore in ${data.location}:`
      default:
        return "Here's what I found for you:"
    }
  }

  return (
    <main className="min-h-dvh mx-auto max-w-md px-4 pb-24 pt-2 flex flex-col">
      <img src="/images/reference/gumo-home.jpg" alt="" aria-hidden className="hidden" />

      <TopBar onShowHistory={() => setShowHistory(true)} onNewChat={startNewChat} />

      {showHistory && (
        <ChatHistory
          sessions={chatSessions}
          onSelectSession={loadChatSession}
          onClose={() => setShowHistory(false)}
          onDeleteSession={(sessionId) => {
            setChatSessions((prev) => prev.filter((s) => s.id !== sessionId))
          }}
        />
      )}

      <section className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <>
            <h1 className="text-pretty text-2xl font-medium">What's your plan for today?</h1>

            <div className="mt-4 space-y-4">
              <SuggestionCard
                image="/traffic.png"
                title="Check traffic conditions for my commute"
                onClick={() => handleQuery("Check traffic conditions for my commute")}
              />
              <SuggestionCard
                image="/events.png"
                title="Find local events happening this weekend"
                onClick={() => handleQuery("Find local events happening this weekend")}
              />
              <SuggestionCard
                image="/food.png"
                title="Plan a 3 day itinerary to Mumbai"
                onClick={() => handleQuery("Plan a 3 day itinerary to Mumbai")}
              />
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-[15px] leading-6 text-[color:var(--gumo-muted)]">
                {isProcessing ? "Processing your request..." : "Discover how"}{" "}
                <span className="font-semibold text-[color:var(--gumo-text)]">CityPulse</span>
                {!isProcessing && <br />}
                {!isProcessing && " can help you?"}
              </p>
              <a
                href="/about"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-[color:var(--gumo-yellow)]"
              >
                Learn more
                <span aria-hidden>↗</span>
              </a>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${["planner", "traffic", "events", "food", "explore"].includes(m.type)
                    ? "w-full" // Full width for special UI components
                    : `rounded-2xl p-3 ${m.role === "user" ? "bg-white/5 ml-12" : "bg-white/10 mr-12"}`
                  }`}
              >
                {m.type === "text" && <p className="text-sm text-white/90">{m.text}</p>}
                {m.type === "planner" && (
                  <div className="mt-2">
                    <PlannerForm data={m.payload} />
                  </div>
                )}
                {m.type === "traffic" && (
                  <div className="mt-2">
                    <TrafficInsights data={m.payload} />
                  </div>
                )}
                {m.type === "events" && (
                  <div className="mt-2">
                    <EventsList data={m.payload} />
                  </div>
                )}
                {m.type === "food" && (
                  <div className="mt-2">
                    <FoodList data={m.payload} />
                  </div>
                )}
                {m.type === "explore" && (
                  <div className="mt-2">
                    <ExploreGrid data={m.payload} />
                  </div>
                )}
                {m.type === "summary" && (
                  <div className="mt-2">
                    <ItinerarySummaryCardV2
                      title={m.payload.title}
                      blurb={m.payload.blurb}
                      bullets={m.payload.bullets}
                      href={m.payload.href}
                      imageSrc={m.payload.imageSrc}
                    />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="rounded-2xl bg-white/10 p-3 mr-12">
                <p className="text-sm text-white/70">Thinking…</p>
              </div>
            )}
          </div>
        )}
      </section>
      {/* Spacer to push input to bottom on taller screens */}
      <div className="flex-1" />

      <div className="relative">
        <div className="gumo-ambient" />
        <ChatInput onQuerySubmit={handleQuery} disabled={isProcessing} />
      </div>

      <div className="fixed inset-x-0 bottom-3">
        <div className="mx-auto max-w-md px-4">
          <BottomNav />
        </div>
      </div>
    </main>
  )
}
