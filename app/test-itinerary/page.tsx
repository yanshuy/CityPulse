import { CompleteFlowDemo } from '@/components/itinerary/complete-flow-demo'
import { ItineraryStorageDemo } from '@/components/itinerary/itinerary-storage-demo'
import { ChatItineraryExample } from '@/components/itinerary/chat-itinerary-example'

export default function TestItineraryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">🧪 Itinerary Storage System Test</h1>
          <p className="text-gray-600 text-center mb-8">
            Complete IndexedDB integration for chat-generated travel itineraries
          </p>
          
          <div className="space-y-16">
            {/* Complete Flow Demo - Main test */}
            <section>
              <CompleteFlowDemo />
            </section>

            {/* Divider */}
            <div className="border-t border-gray-300"></div>

            {/* Additional Tests */}
            <section>
              <h2 className="text-2xl font-semibold text-center mb-6">Additional Components</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Chat Integration Example */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Chat Integration Example</h3>
                  <ChatItineraryExample />
                </div>

                {/* Storage Management Demo */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Storage Management</h3>
                  <ItineraryStorageDemo />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}