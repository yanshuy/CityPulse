// Itinerary storage utility for handling large itinerary data
// Uses sessionStorage for temporary storage and IndexedDB for persistence

export interface StoredItinerary {
    id: string
    data: any // GeneratedItinerary type
    timestamp: number
    type: 'session' | 'saved'
}

class ItineraryStorage {
    private dbName = 'CityPulseItineraries'
    private dbVersion = 1
    private storeName = 'itineraries'
    private db: IDBDatabase | null = null

    // Initialize IndexedDB
    async init(): Promise<void> {
        if (typeof window === 'undefined') return

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion)

            request.onerror = () => reject(request.error)
            request.onsuccess = () => {
                this.db = request.result
                resolve()
            }

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
                    store.createIndex('timestamp', 'timestamp', { unique: false })
                    store.createIndex('type', 'type', { unique: false })
                }
            }
        })
    }

    // Generate a short, unique ID for the itinerary
    private generateId(): string {
        return `itin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Save itinerary to sessionStorage (temporary)
    saveToSession(itineraryData: any): string {
        if (typeof window === 'undefined') return ''

        const id = this.generateId()
        const storedItinerary: StoredItinerary = {
            id,
            data: itineraryData,
            timestamp: Date.now(),
            type: 'session'
        }

        try {
            sessionStorage.setItem(`itinerary_${id}`, JSON.stringify(storedItinerary))
            return id
        } catch (error) {
            console.error('Failed to save to sessionStorage:', error)
            return ''
        }
    }

    // Get itinerary from sessionStorage
    getFromSession(id: string): any | null {
        if (typeof window === 'undefined') return null

        try {
            const stored = sessionStorage.getItem(`itinerary_${id}`)
            if (!stored) return null

            const parsedStored: StoredItinerary = JSON.parse(stored)
            return parsedStored.data
        } catch (error) {
            console.error('Failed to get from sessionStorage:', error)
            return null
        }
    }

    // Save itinerary to IndexedDB (persistent)
    async saveToDB(itineraryData: any, id?: string): Promise<string> {
        if (!this.db) {
            await this.init()
        }

        const itineraryId = id || this.generateId()
        const storedItinerary: StoredItinerary = {
            id: itineraryId,
            data: itineraryData,
            timestamp: Date.now(),
            type: 'saved'
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.put(storedItinerary)

            request.onsuccess = () => resolve(itineraryId)
            request.onerror = () => reject(request.error)
        })
    }

    // Get itinerary from IndexedDB
    async getFromDB(id: string): Promise<any | null> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)
            const request = store.get(id)

            request.onsuccess = () => {
                const result = request.result as StoredItinerary | undefined
                resolve(result ? result.data : null)
            }
            request.onerror = () => reject(request.error)
        })
    }

    // Get itinerary from either storage method
    async getItinerary(id: string): Promise<any | null> {
        // First try sessionStorage (faster)
        const sessionData = this.getFromSession(id)
        if (sessionData) return sessionData

        // Then try IndexedDB
        try {
            return await this.getFromDB(id)
        } catch (error) {
            console.error('Failed to get from IndexedDB:', error)
            return null
        }
    }

    // Clean up old session storage items (optional)
    cleanupSession(): void {
        if (typeof window === 'undefined') return

        const keys = Object.keys(sessionStorage)
        const now = Date.now()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        keys.forEach(key => {
            if (key.startsWith('itinerary_')) {
                try {
                    const stored = sessionStorage.getItem(key)
                    if (stored) {
                        const parsedStored: StoredItinerary = JSON.parse(stored)
                        if (now - parsedStored.timestamp > maxAge) {
                            sessionStorage.removeItem(key)
                        }
                    }
                } catch (error) {
                    // Remove invalid entries
                    sessionStorage.removeItem(key)
                }
            }
        })
    }

    // Get all saved itineraries from IndexedDB
    async getAllSaved(): Promise<StoredItinerary[]> {
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readonly')
            const store = transaction.objectStore(this.storeName)
            const index = store.index('type')
            const request = index.getAll('saved')

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    // Delete itinerary
    async deleteItinerary(id: string): Promise<void> {
        // Remove from sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(`itinerary_${id}`)
        }

        // Remove from IndexedDB
        if (!this.db) {
            await this.init()
        }

        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'))
                return
            }

            const transaction = this.db.transaction([this.storeName], 'readwrite')
            const store = transaction.objectStore(this.storeName)
            const request = store.delete(id)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
}

// Export singleton instance
export const itineraryStorage = new ItineraryStorage()

// Helper functions for easy usage
export const saveItinerary = (itineraryData: any): string => {
    return itineraryStorage.saveToSession(itineraryData)
}

export const getItinerary = async (id: string): Promise<any | null> => {
    return itineraryStorage.getItinerary(id)
}

export const saveItineraryPermanent = async (itineraryData: any, id?: string): Promise<string> => {
    return itineraryStorage.saveToDB(itineraryData, id)
}

// Initialize on import
if (typeof window !== 'undefined') {
    itineraryStorage.init().catch(console.error)
    // Clean up old session data periodically
    itineraryStorage.cleanupSession()
}