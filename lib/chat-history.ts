// IndexedDB utilities for chat history persistence

interface ChatSession {
    id: string
    title: string
    messages: any[]
    createdAt: number
    updatedAt: number
}

class ChatHistoryDB {
    private dbName = 'citypluse-chat'
    private version = 1
    private db: IDBDatabase | null = null

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                this.db = request.result
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result

                // Create chat sessions store
                if (!db.objectStoreNames.contains('sessions')) {
                    const store = db.createObjectStore('sessions', { keyPath: 'id' })
                    store.createIndex('updatedAt', 'updatedAt', { unique: false })
                }
            }
        })
    }

    async saveSession(session: ChatSession): Promise<void> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readwrite')
            const store = transaction.objectStore('sessions')
            const request = store.put(session)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }

    async getSession(id: string): Promise<ChatSession | null> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readonly')
            const store = transaction.objectStore('sessions')
            const request = store.get(id)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve(request.result || null)
        })
    }

    async getAllSessions(): Promise<ChatSession[]> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readonly')
            const store = transaction.objectStore('sessions')
            const index = store.index('updatedAt')
            const request = index.getAll()

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                const sessions = request.result.sort((a, b) => b.updatedAt - a.updatedAt)
                resolve(sessions)
            }
        })
    }

    async deleteSession(id: string): Promise<void> {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['sessions'], 'readwrite')
            const store = transaction.objectStore('sessions')
            const request = store.delete(id)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => resolve()
        })
    }
}

// Singleton instance
export const chatHistoryDB = new ChatHistoryDB()

// Utility functions
export function generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateSessionTitle(messages: any[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user' && m.type === 'text')
    if (firstUserMessage) {
        const text = firstUserMessage.text
        return text.length > 30 ? text.substring(0, 30) + '...' : text
    }
    return `Chat ${new Date().toLocaleDateString()}`
}

export type { ChatSession }