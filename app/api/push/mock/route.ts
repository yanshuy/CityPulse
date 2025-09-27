import { NextRequest, NextResponse } from 'next/server'
import SubscriptionStore from '@/lib/subscription-store'

const store = SubscriptionStore.getInstance()

export async function POST(request: NextRequest) {
    try {
        // Create a mock subscription for testing without browser UI
        const mockSubscription = {
            endpoint: 'https://mock-push-service.googleapis.com/test-endpoint',
            keys: {
                p256dh: 'mock-key-p256dh',
                auth: 'mock-key-auth'
            },
            getKey: () => null,
            unsubscribe: () => Promise.resolve(true),
            toJSON: () => ({
                endpoint: 'https://mock-push-service.googleapis.com/test-endpoint',
                keys: {
                    p256dh: 'mock-key-p256dh',
                    auth: 'mock-key-auth'
                }
            })
        } as PushSubscription

        const testUserId = 'test-user-cli'
        store.set(testUserId, mockSubscription)

        return NextResponse.json({
            success: true,
            message: 'Mock subscription created for CLI testing',
            userId: testUserId,
            instructions: [
                'You can now send notifications via API:',
                `curl -X POST http://localhost:3000/api/push/send -H "Content-Type: application/json" -d '{"title":"CLI Test","body":"Mock notification","userId":"${testUserId}"}'`,
                'Note: This is for API testing only. Real notifications need browser subscription.'
            ]
        })
    } catch (error) {
        console.error('Error creating mock subscription:', error)
        return NextResponse.json(
            { error: 'Failed to create mock subscription' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Create Mock Subscription for CLI Testing',
        usage: 'POST to this endpoint to create a test subscription',
        note: 'This creates a mock subscription for API testing without browser UI'
    })
}
