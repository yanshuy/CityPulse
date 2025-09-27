import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const STORAGE_FILE = join(process.cwd(), 'subscriptions.json')

interface StoredSubscription {
    userId: string
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

function loadSubscriptions(): StoredSubscription[] {
    try {
        if (existsSync(STORAGE_FILE)) {
            const data = readFileSync(STORAGE_FILE, 'utf-8')
            return JSON.parse(data)
        }
    } catch (error) {
        console.error('Error loading subscriptions:', error)
    }
    return []
}

function saveSubscriptions(subscriptions: StoredSubscription[]): void {
    try {
        writeFileSync(STORAGE_FILE, JSON.stringify(subscriptions, null, 2))
    } catch (error) {
        console.error('Error saving subscriptions:', error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const { subscription, userId } = await request.json()

        if (!subscription || !userId) {
            return NextResponse.json(
                { error: 'Subscription and userId required' },
                { status: 400 }
            )
        }

        // Load existing subscriptions
        const subscriptions = loadSubscriptions()

        // Remove existing subscription for this user
        const filtered = subscriptions.filter(sub => sub.userId !== userId)

        // Add new subscription
        const newSub: StoredSubscription = {
            userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys
        }

        filtered.push(newSub)

        // Save to file
        saveSubscriptions(filtered)

        console.log(`📱 Subscription saved to file for user: ${userId}`)

        return NextResponse.json({
            success: true,
            message: 'Subscription registered successfully',
            userId,
            totalSubscriptions: filtered.length
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
    const subscriptions = loadSubscriptions()

    return NextResponse.json({
        subscriptions: subscriptions.map(sub => ({
            userId: sub.userId,
            endpoint: sub.endpoint.substring(0, 50) + '...'
        })),
        count: subscriptions.length,
        userIds: subscriptions.map(sub => sub.userId)
    })
}
