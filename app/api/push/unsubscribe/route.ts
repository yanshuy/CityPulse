import { NextRequest, NextResponse } from 'next/server'
import SubscriptionStore from '@/lib/subscription-store'

const store = SubscriptionStore.getInstance()

export async function POST(request: NextRequest) {
    try {
        const { subscription } = await request.json()

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription required' },
                { status: 400 }
            )
        }

        // Find and remove subscription from storage
        const removedUserId = store.deleteByEndpoint(subscription.endpoint)

        return NextResponse.json({
            success: true,
            message: 'Subscription removed successfully',
            removedUserId
        })
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error)
        return NextResponse.json(
            { error: 'Failed to unsubscribe' },
            { status: 500 }
        )
    }
}