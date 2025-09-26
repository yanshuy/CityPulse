import { NextRequest, NextResponse } from 'next/server'
import SubscriptionStore from '@/lib/subscription-store'

const store = SubscriptionStore.getInstance()

export async function POST(request: NextRequest) {
    try {
        const { subscription, userId } = await request.json()

        if (!subscription || !userId) {
            return NextResponse.json(
                { error: 'Subscription and userId required' },
                { status: 400 }
            )
        }

        // Store subscription using shared store
        store.set(userId, subscription)

        return NextResponse.json({
            success: true,
            message: 'Subscription registered successfully',
            userId
        })
    } catch (error) {
        console.error('Error subscribing to push notifications:', error)
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        )
    }
}

export async function GET() {
    // Return all subscriptions for admin/testing
    const subscriptions = store.getAll()
    const subscriptionList = subscriptions.map(({ userId, subscription }) => ({
        userId,
        endpoint: subscription.endpoint
    }))

    return NextResponse.json({
        subscriptions: subscriptionList,
        count: store.size(),
        userIds: store.getAllUserIds()
    })
}