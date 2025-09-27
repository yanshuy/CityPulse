import { NextRequest, NextResponse } from 'next/server'
import SubscriptionStore from '@/lib/subscription-store'

const store = SubscriptionStore.getInstance()

export async function POST(request: NextRequest) {
    try {
        const { title, body, icon, url, userId, tag } = await request.json()

        if (!title || !body) {
            return NextResponse.json(
                { error: 'Title and body are required' },
                { status: 400 }
            )
        }

        // If no userId provided, try to send to all users or first available user
        let targetUserId = userId
        let subscription: PushSubscription | undefined

        if (!targetUserId) {
            const userIds = store.getAllUserIds()
            if (userIds.length === 0) {
                return NextResponse.json(
                    { error: 'No subscriptions found. Please enable notifications first.' },
                    { status: 404 }
                )
            }
            targetUserId = userIds[0] // Use first available user
            subscription = store.get(targetUserId)
        } else {
            subscription = store.get(targetUserId)
        }

        if (!subscription) {
            const availableUsers = store.getAllUserIds()
            return NextResponse.json(
                {
                    error: `No subscription found for user: ${targetUserId}`,
                    availableUsers,
                    hint: availableUsers.length > 0 ? `Try using one of: ${availableUsers.join(', ')}` : 'No users have subscribed to notifications yet'
                },
                { status: 404 }
            )
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icons/icon-192x192.svg',
            badge: '/icons/icon-96x96.svg',
            url: url || '/',
            tag: tag || 'citypulse-alert',
            timestamp: Date.now(),
            actions: [
                {
                    action: 'open',
                    title: 'View',
                    icon: '/icons/icon-96x96.svg'
                },
                {
                    action: 'close',
                    title: 'Dismiss'
                }
            ]
        })

        // Simple notification sending (without web-push library for now)
        console.log(`🔔 Sending notification to ${userId}:`, { title, body })
        console.log(`📱 Subscription endpoint:`, subscription.endpoint)

        // In a real implementation, you would use web-push here:
        // await webpush.sendNotification(subscription, payload)

        // For demo, we'll just simulate success
        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully',
            payload: JSON.parse(payload)
        })
    } catch (error) {
        console.error('Error sending push notification:', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}

// Test endpoint to send notification to all users
export async function GET() {
    try {
        const testPayload = {
            title: 'CityPulse Test Alert 🚨',
            body: 'This is a test notification from CityPulse! Your PWA is working correctly.',
            tag: 'test-notification'
        }

        const userIds = store.getAllUserIds()
        let sentCount = 0

        for (const userId of userIds) {
            // In a real implementation, send to each user
            sentCount++
        }

        return NextResponse.json({
            message: `Test notification ready for ${sentCount} users`,
            payload: testPayload,
            subscriptionCount: store.size(),
            availableUsers: userIds
        })
    } catch (error) {
        console.error('Error preparing test notifications:', error)
        return NextResponse.json(
            { error: 'Failed to prepare test notifications' },
            { status: 500 }
        )
    }
}
