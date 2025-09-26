import { NextResponse } from 'next/server'
import SubscriptionStore from '@/lib/subscription-store'

const store = SubscriptionStore.getInstance()

export async function GET() {
    const userIds = store.getAllUserIds()
    const subscriptions = store.getAll()

    return NextResponse.json({
        debug: 'CityPulse Push Notification Debug Info',
        totalSubscriptions: store.size(),
        userIds,
        subscriptions: subscriptions.map(({ userId, subscription }) => ({
            userId,
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            hasKeys: !!subscription.getKey
        })),
        testCommands: {
            'Send to first user': userIds.length > 0 ? `curl -X POST http://localhost:3000/api/push/send -H "Content-Type: application/json" -d '{"title":"Test","body":"Hello!","userId":"${userIds[0]}"}'` : 'No users subscribed',
            'Send to any user': `curl -X POST http://localhost:3000/api/push/send -H "Content-Type: application/json" -d '{"title":"Test","body":"Hello!"}'`,
            'View subscriptions': 'curl http://localhost:3000/api/push/subscribe'
        },
        instructions: [
            '1. Go to /profile → Settings tab',
            '2. Click "Enable" notifications',
            '3. Accept browser permission',
            '4. Use the test commands above'
        ]
    })
}

export async function POST() {
    // Clear all subscriptions for testing
    store.clear()

    return NextResponse.json({
        message: 'All subscriptions cleared',
        totalSubscriptions: store.size()
    })
}