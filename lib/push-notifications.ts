"use client"

export class PushNotificationService {
    private static instance: PushNotificationService
    private registration: ServiceWorkerRegistration | null = null

    static getInstance(): PushNotificationService {
        if (!PushNotificationService.instance) {
            PushNotificationService.instance = new PushNotificationService()
        }
        return PushNotificationService.instance
    }

    async init(): Promise<void> {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Push notifications not supported')
        }

        this.registration = await navigator.serviceWorker.ready
    }

    async requestPermission(): Promise<NotificationPermission> {
        const permission = await Notification.requestPermission()
        return permission
    }

    async subscribe(): Promise<PushSubscription | null> {
        if (!this.registration) {
            await this.init()
        }

        const existingSubscription = await this.registration?.pushManager.getSubscription()
        if (existingSubscription) {
            return existingSubscription
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
            throw new Error('VAPID public key not configured')
        }

        const subscription = await this.registration?.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
        })

        // Send subscription to your server
        if (subscription) {
            await this.sendSubscriptionToServer(subscription)
        }

        return subscription || null
    }

    async unsubscribe(): Promise<boolean> {
        const subscription = await this.registration?.pushManager.getSubscription()
        if (subscription) {
            const success = await subscription.unsubscribe()
            if (success) {
                await this.removeSubscriptionFromServer(subscription)
            }
            return success
        }
        return false
    }

    async getSubscription(): Promise<PushSubscription | null> {
        if (!this.registration) {
            await this.init()
        }
        return await this.registration?.pushManager.getSubscription() || null
    }

    private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
        try {
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription,
                    userId: this.getUserId()
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send subscription to server')
            }
        } catch (error) {
            console.error('Error sending subscription to server:', error)
        }
    }

    private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
        try {
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
            })
        } catch (error) {
            console.error('Error removing subscription from server:', error)
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
    }

    private getUserId(): string {
        // Simple localStorage-based ID for demo
        let userId = localStorage.getItem('citypulse_user_id')
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
            localStorage.setItem('citypulse_user_id', userId)
        }
        return userId
    }
}