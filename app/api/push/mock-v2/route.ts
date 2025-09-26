import { NextResponse } from 'next/server'
import { writeFileSync } from 'fs'
import { join } from 'path'

const STORAGE_FILE = join(process.cwd(), 'subscriptions.json')

export async function POST() {
    try {
        const mockSubscription = {
            userId: 'test-user-cli',
            endpoint: 'https://mock-push-service.googleapis.com/test-endpoint',
            keys: {
                p256dh: 'mock-key-p256dh',
                auth: 'mock-key-auth'
            }
        }

        // Save to file
        writeFileSync(STORAGE_FILE, JSON.stringify([mockSubscription], null, 2))

        console.log('📱 Mock subscription saved to file')

        return NextResponse.json({
            success: true,
            message: 'Mock subscription created and saved to file',
            userId: mockSubscription.userId,
            testCommands: [
                'Check subscriptions: curl http://localhost:3000/api/push/subscribe-v2',
                'Send notification: curl -X POST http://localhost:3000/api/push/send-v2 -H "Content-Type: application/json" -d \'{"title":"File Test","body":"Testing file-based storage!"}\'',
                'Send to specific user: curl -X POST http://localhost:3000/api/push/send-v2 -H "Content-Type: application/json" -d \'{"title":"CLI Test","body":"Hello CLI user!","userId":"test-user-cli"}\''
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