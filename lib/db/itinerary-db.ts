/**
 * IndexedDB utility for storing and managing itineraries
 */

export interface Itinerary {
  id: string
  title: string
  description: string
  destinations: Array<{
    city: string
    days: number
  }>
  highlights: string[]
  createdAt: number
  updatedAt: number
  imageSrc?: string
  chatData?: any // Raw chat data from the conversation
}

class ItineraryDB {
  private dbName = 'CityPulseItineraries'
  private version = 1
  private storeName = 'itineraries'
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
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('title', 'title', { unique: false })
        }
      }
    })
  }

  async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  async saveItinerary(itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const db = await this.ensureDB()
    const id = `itinerary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const now = Date.now()
    
    const fullItinerary: Itinerary = {
      ...itinerary,
      id,
      createdAt: now,
      updatedAt: now
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(fullItinerary)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(id)
    })
  }

  async updateItinerary(id: string, updates: Partial<Omit<Itinerary, 'id' | 'createdAt'>>): Promise<void> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const getRequest = store.get(id)

      getRequest.onerror = () => reject(getRequest.error)
      getRequest.onsuccess = () => {
        const existingItinerary = getRequest.result
        if (!existingItinerary) {
          reject(new Error('Itinerary not found'))
          return
        }

        const updatedItinerary: Itinerary = {
          ...existingItinerary,
          ...updates,
          updatedAt: Date.now()
        }

        const putRequest = store.put(updatedItinerary)
        putRequest.onerror = () => reject(putRequest.error)
        putRequest.onsuccess = () => resolve()
      }
    })
  }

  async getItinerary(id: string): Promise<Itinerary | null> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async getAllItineraries(): Promise<Itinerary[]> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('createdAt')
      const request = index.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        // Sort by createdAt descending (newest first)
        const itineraries = request.result.sort((a, b) => b.createdAt - a.createdAt)
        resolve(itineraries)
      }
    })
  }

  async deleteItinerary(id: string): Promise<void> {
    const db = await this.ensureDB()
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async searchItineraries(query: string): Promise<Itinerary[]> {
    const allItineraries = await this.getAllItineraries()
    const lowerQuery = query.toLowerCase()
    
    return allItineraries.filter(itinerary => 
      itinerary.title.toLowerCase().includes(lowerQuery) ||
      itinerary.description.toLowerCase().includes(lowerQuery) ||
      itinerary.destinations.some(dest => dest.city.toLowerCase().includes(lowerQuery)) ||
      itinerary.highlights.some(highlight => highlight.toLowerCase().includes(lowerQuery))
    )
  }
}

// Export singleton instance
export const itineraryDB = new ItineraryDB()

// Utility function to generate sample itinerary data
export function createItineraryFromChat(chatData: any): Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'> {
  // This would parse chat data and extract itinerary information
  // For now, we'll return a template structure
  const destinations = chatData.destinations || [{ city: 'Bangkok', days: 3 }]
  const mainCity = destinations[0]?.city || 'Unknown City'
  
  return {
    title: chatData.title || `Trip to ${mainCity}`,
    description: chatData.description || `Explore the amazing city of ${mainCity} with this carefully crafted itinerary.`,
    destinations,
    highlights: chatData.highlights || [
      'Visit iconic landmarks',
      'Experience local cuisine',
      'Discover hidden gems'
    ],
    imageSrc: chatData.imageSrc,
    chatData
  }
}