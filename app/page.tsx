import { TopBar } from "@/components/gumo/top-bar"
import { SuggestionCard } from "@/components/gumo/suggestion-card"
import { ChatInput } from "@/components/gumo/chat-input"

export default function Page() {
  return (
    <main className="min-h-dvh mx-auto max-w-md px-4 pb-24 pt-2 flex flex-col">
      {/* Preload the provided reference image without affecting layout */}
      <img src="/images/reference/gumo-home.jpg" alt="" aria-hidden className="hidden" />

      <TopBar />

      <section className="mt-6">
        <h1 className="text-pretty text-2xl font-medium">Where to today?</h1>

        <div className="mt-4 space-y-4">
          <SuggestionCard
            image="/sea-facing-villa-in-goa.jpg"
            title="Find sea facing villas in South Goa for next month"
          />
          <SuggestionCard
            image="/himachal-pradesh-mountains.jpg"
            title="Plan a 5-day Himachal Pradesh itinerary for next week"
          />
          <SuggestionCard image="/waterfall-in-jaipur.jpg" title="Show me top 10 tourist attractions in Jaipur" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-[15px] leading-6 text-[color:var(--gumo-muted)]">
            Learn how <span className="font-semibold text-[color:var(--gumo-text)]">Gumo.ai</span>
            <br /> can help you?
          </p>
          <a
            href="/vibes/solo-relax"
            className="inline-flex items-center gap-2 text-[15px] font-medium text-[color:var(--gumo-yellow)]"
          >
            Learn more
            <span aria-hidden>↗</span>
          </a>
        </div>
      </section>

      {/* Spacer to push input to bottom on taller screens */}
      <div className="flex-1" />

      <div className="relative">
        <div className="gumo-ambient" />
        <ChatInput />
      </div>
    </main>
  )
}
