// Shared subscription storage for demo
// In production, this would be a database

// Global store to ensure singleton across module reloads
const globalStore = global as any
const STORE_KEY = 'citypulse_subscription_store'

class SubscriptionStore {
    private static instance: SubscriptionStore
    private subscriptions = new Map<string, PushSubscription>()

    static getInstance(): SubscriptionStore {
        // Use global store to persist across hot reloads
        if (globalStore[STORE_KEY]) {
            return globalStore[STORE_KEY]
        }

        if (!SubscriptionStore.instance) {
            SubscriptionStore.instance = new SubscriptionStore()
            globalStore[STORE_KEY] = SubscriptionStore.instance
        }
        return SubscriptionStore.instance
    }

    set(userId: string, subscription: PushSubscription): void {
        this.subscriptions.set(userId, subscription)
        console.log(`📱 Subscription stored for user: ${userId} (total: ${this.subscriptions.size})`)
    }

    get(userId: string): PushSubscription | undefined {
        return this.subscriptions.get(userId)
    }

    delete(userId: string): boolean {
        const result = this.subscriptions.delete(userId)
        if (result) {
            console.log(`📱 Subscription removed for user: ${userId}`)
        }
        return result
    }

    deleteByEndpoint(endpoint: string): string | null {
        for (const [userId, subscription] of this.subscriptions.entries()) {
            if (subscription.endpoint === endpoint) {
                this.subscriptions.delete(userId)
                console.log(`📱 Subscription removed for user: ${userId}`)
                return userId
            }
        }
        return null
    }

    getAll(): Array<{ userId: string; subscription: PushSubscription }> {
        console.log(`📊 Getting all subscriptions: ${this.subscriptions.size} found`)
        return Array.from(this.subscriptions.entries()).map(([userId, subscription]) => ({
            userId,
            subscription
        }))
    }

    getAllUserIds(): string[] {
        return Array.from(this.subscriptions.keys())
    }

    size(): number {
        return this.subscriptions.size
    }

    clear(): void {
        this.subscriptions.clear()
        console.log('📱 All subscriptions cleared')
    }
}

export default SubscriptionStore