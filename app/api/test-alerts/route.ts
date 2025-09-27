import { NextResponse } from 'next/server'
import { AlertSystem } from '@/lib/alert-system'

export async function POST() {
    const alertSystem = AlertSystem.getInstance()

    try {
        // Test different types of alerts
        const alerts = [
            {
                method: () => alertSystem.sendTrafficAlert(
                    "Heavy traffic detected on MG Road. Consider taking alternate routes via Indiranagar.",
                    "MG Road, Bangalore"
                ),
                name: "Traffic Alert"
            },
            {
                method: () => alertSystem.sendEventAlert(
                    "Lollapalooza India",
                    "Concert starts in 1 hour at Mahalaxmi Race Course. Gates open now!",
                    "Mumbai"
                ),
                name: "Event Alert"
            },
            {
                method: () => alertSystem.sendWeatherAlert(
                    "Heavy rain expected in the next 2 hours. Carry an umbrella!",
                    "Current Location"
                ),
                name: "Weather Alert"
            },
            {
                method: () => alertSystem.sendItineraryReminder(
                    "Visit to Red Fort",
                    "2:00 PM"
                ),
                name: "Itinerary Reminder"
            }
        ]

        const results = []

        for (const alert of alerts) {
            const success = await alert.method()
            results.push({
                alert: alert.name,
                success
            })

            // Wait between alerts to avoid overwhelming
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        return NextResponse.json({
            message: 'Test alerts sent',
            results,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error sending test alerts:', error)
        return NextResponse.json(
            { error: 'Failed to send test alerts' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'CityPulse Alert System Test Endpoint',
        endpoints: {
            'POST /api/test-alerts': 'Send various test notifications',
            'GET /api/push/subscribe': 'View current subscriptions',
            'POST /api/push/send': 'Send custom notification'
        },
        usage: 'Send POST request to trigger test notifications'
    })
}
