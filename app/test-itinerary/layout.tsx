import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Itinerary System - CityPulse',
  description: 'Test the complete itinerary storage and management system'
}

export default function TestItineraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}