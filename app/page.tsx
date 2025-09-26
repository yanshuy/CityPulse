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

export default function Page() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])

  type ChatMessage =
    | { id: string; role: 'user'; type: 'text'; text: string }
    | { id: string; role: 'assistant'; type: 'text'; text: string }
    | { id: string; role: 'assistant'; type: 'planner'; payload: { destination?: string; days?: number; query?: string } }
    | { id: string; role: 'assistant'; type: 'traffic'; payload: { query?: string } }
    | { id: string; role: 'assistant'; type: 'events'; payload: { heading?: string } }
    | { id: string; role: 'assistant'; type: 'food'; payload: { heading?: string } }
    | { id: string; role: 'assistant'; type: 'explore'; payload: { heading?: string } }

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const router = useRouter()

  // Save current session to IndexedDB
  const saveCurrentSession = useCallback(async (updatedMessages?: ChatMessage[]) => {
    if (!currentSessionId) return

    const messagesToSave = updatedMessages || messages
    if (messagesToSave.length === 0) return

    const session: ChatSession = {
      id: currentSessionId,
      title: generateSessionTitle(messagesToSave),
      messages: messagesToSave,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await chatHistoryDB.saveSession(session)
  }, [currentSessionId, messages])

  // Load chat sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await chatHistoryDB.getAllSessions()
        setChatSessions(sessions)
      } catch (error) {
        console.error('Failed to load chat sessions:', error)
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
      console.error('Failed to refresh chat sessions:', error)
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
      console.error('Failed to load chat session:', error)
    }
  }, [])

  async function handleQuery(query: string) {
    setIsProcessing(true)

    // Initialize new session if none exists
    if (!currentSessionId) {
      setCurrentSessionId(generateSessionId())
    }

    // Immediately show the user's message in the thread
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', type: 'text', text: query },
    ])

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const { type, destination, days, searchQuery, timeframe } = result.data

        console.log('AI Response:', result.data)

        // Handle different query types with available components
        switch (type) {
          case 'itinerary':
            // Render planner component inline in chat
            setMessages((prev) => [
              ...prev,
              {
                id: `a-${Date.now()}-t`,
                role: 'assistant',
                type: 'text',
                text: `I can plan a ${days ?? ''}${days ? '-day ' : ''}trip ${destination ? `to ${destination}` : ''}. Adjust details below and continue.`,
              },
              {
                id: `a-${Date.now()}-p`,
                role: 'assistant',
                type: 'planner',
                payload: {
                  destination: destination || '',
                  days: days,
                  query,
                },
              },
            ])
            break

          case 'traffic':
            // Inline traffic insights card
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}-t`, role: 'assistant', type: 'text', text: 'Here are traffic insights for you:' },
              { id: `a-${Date.now()}-x`, role: 'assistant', type: 'traffic', payload: { query: searchQuery || query } },
            ])
            break

          case 'events':
            // Inline events list
            const eventsQuery = timeframe ? `events ${timeframe}` : 'local events'
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}-t`, role: 'assistant', type: 'text', text: `Here are ${eventsQuery}:` },
              { id: `a-${Date.now()}-x`, role: 'assistant', type: 'events', payload: { heading: eventsQuery } },
            ])
            break

          case 'food':
            // Inline food list
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}-t`, role: 'assistant', type: 'text', text: 'Here are some popular places to eat:' },
              { id: `a-${Date.now()}-x`, role: 'assistant', type: 'food', payload: { heading: 'Popular restaurants' } },
            ])
            break

          case 'explore':
            // Inline explore grid
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}-t`, role: 'assistant', type: 'text', text: 'Exploring interesting spots…' },
              { id: `a-${Date.now()}-x`, role: 'assistant', type: 'explore', payload: { heading: 'Explore ideas' } },
            ])
            break

          default:
            // Fallback for general queries – keep inline for now
            setMessages((prev) => [
              ...prev,
              { id: `a-${Date.now()}`, role: 'assistant', type: 'text', text: 'Got it — here are some ideas you can explore.' },
              { id: `a-${Date.now()}-x`, role: 'assistant', type: 'explore', payload: { heading: 'Suggestions' } },
            ])
        }
      } else {
        // Fallback if AI processing fails
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', type: 'text', text: 'I had trouble understanding that. Try rephrasing your request.' },
        ])
      }

    } catch (error) {
      console.error('Error processing query:', error)
      // Fallback to original behavior
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', type: 'text', text: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-dvh mx-auto max-w-md px-4 pb-24 pt-2 flex flex-col">
      <img
        src="/images/reference/gumo-home.jpg"
        alt=""
        aria-hidden
        className="hidden"
      />

      <TopBar
        onShowHistory={() => setShowHistory(true)}
        onNewChat={startNewChat}
      />

      {showHistory && (
        <ChatHistory
          sessions={chatSessions}
          onSelectSession={loadChatSession}
          onClose={() => setShowHistory(false)}
          onDeleteSession={(sessionId) => {
            setChatSessions(prev => prev.filter(s => s.id !== sessionId))
          }}
        />
      )}

      <section className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <>
            <h1 className="text-pretty text-2xl font-medium">
              What's your plan for today?
            </h1>

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
                <span className="font-semibold text-[color:var(--gumo-text)]">
                  CityPulse
                </span>
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
              <div key={m.id} className={`${['planner', 'traffic', 'events', 'food', 'explore'].includes(m.type)
                ? 'w-full' // Full width for special UI components
                : `rounded-2xl p-3 ${m.role === 'user' ? 'bg-white/5 ml-12' : 'bg-white/10 mr-12'}`
                }`}>
                {m.type === 'text' && <p className="text-sm text-white/90">{m.text}</p>}
                {m.type === 'planner' && (
                  <div className="mt-2">
                    <PlannerForm
                      destination={m.payload.destination}
                      days={m.payload.days}
                      query={m.payload.query}
                    />
                  </div>
                )}
                {m.type === 'traffic' && (
                  <div className="mt-2">
                    <TrafficInsights query={m.payload.query} />
                  </div>
                )}
                {m.type === 'events' && (
                  <div className="mt-2">
                    <EventsList heading={m.payload.heading} />
                  </div>
                )}
                {m.type === 'food' && (
                  <div className="mt-2">
                    <FoodList heading={m.payload.heading} />
                  </div>
                )}
                {m.type === 'explore' && (
                  <div className="mt-2">
                    <ExploreGrid heading={m.payload.heading} />
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
