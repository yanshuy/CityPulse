import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
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

export async function POST(request: NextRequest) {
    try {
        const { title, body, icon, url, userId, tag } = await request.json()

        if (!title || !body) {
            return NextResponse.json(
                { error: 'Title and body are required' },
                { status: 400 }
            )
        }

        const subscriptions = loadSubscriptions()

        if (subscriptions.length === 0) {
            return NextResponse.json(
                { error: 'No subscriptions found. Please subscribe first.' },
                { status: 404 }
            )
        }

        // Find target subscription
        let targetSub: StoredSubscription | undefined

        if (userId) {
            targetSub = subscriptions.find(sub => sub.userId === userId)
            if (!targetSub) {
                return NextResponse.json(
                    {
                        error: `No subscription found for user: ${userId}`,
                        availableUsers: subscriptions.map(sub => sub.userId)
                    },
                    { status: 404 }
                )
            }
        } else {
            // Use first available subscription
            targetSub = subscriptions[0]
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icons/icon-192x192.svg',
            badge: '/icons/icon-96x96.svg',
            url: url || '/',
            tag: tag || 'citypulse-alert',
            timestamp: Date.now(),
        })

        console.log(`🔔 Notification prepared for ${targetSub.userId}:`, { title, body })
        console.log(`📱 Target endpoint:`, targetSub.endpoint.substring(0, 50) + '...')

        // In real implementation, send via web-push here
        // await webpush.sendNotification(subscription, payload)

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully (simulated)',
            targetUser: targetSub.userId,
            payload: JSON.parse(payload),
            note: 'This is simulated - in production would use web-push library'
        })
    } catch (error) {
        console.error('Error sending push notification:', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}

export async function GET() {
    const subscriptions = loadSubscriptions()

    return NextResponse.json({
        message: 'File-based push notification sender',
        totalSubscriptions: subscriptions.length,
        availableUsers: subscriptions.map(sub => sub.userId)
    })
}