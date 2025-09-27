/**
 * IndexedDB utility for storing and managing itineraries
 */

export interface ItineraryPlace {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  type?: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping' | 'other'
  description?: string
  rating?: number
  imageUrl?: string
}

export interface ItineraryDestination {
  city: string
  days: number
  places?: ItineraryPlace[] // Actual places with coordinates
}

export interface Itinerary {
  id: string
  title: string
  description: string
  destinations: ItineraryDestination[]
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

// Sample itineraries with proper place data for testing
export async function createSampleItineraries(): Promise<void> {
  const sampleItineraries: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      title: "Mumbai Heritage & Culture",
      description: "Explore the vibrant city of Mumbai with its rich heritage and modern culture",
      destinations: [
        {
          city: "Mumbai",
          days: 3,
          places: [
            { name: "Gateway of India", latitude: 18.9220, longitude: 72.8347, type: "attraction", description: "Iconic monument overlooking the Arabian Sea", rating: 4.5 },
            { name: "Marine Drive", latitude: 18.9200, longitude: 72.8232, type: "attraction", description: "Famous promenade along the coastline", rating: 4.3 },
            { name: "Chhatrapati Shivaji Terminus", latitude: 18.9400, longitude: 72.8347, type: "attraction", description: "UNESCO World Heritage Site and historic railway station", rating: 4.4 },
            { name: "Taj Mahal Palace Hotel", latitude: 18.9216, longitude: 72.8332, type: "hotel", description: "Luxury heritage hotel", rating: 4.8 },
            { name: "Leopold Cafe", latitude: 18.9220, longitude: 72.8310, type: "restaurant", description: "Famous cafe in Colaba", rating: 4.2 }
          ]
        }
      ],
      highlights: ["Gateway of India", "Marine Drive", "Heritage Architecture", "Street Food"],
      imageSrc: "/mumbai-gateway.jpg"
    },
    {
      title: "Rajasthan Royal Experience", 
      description: "Discover the royal heritage of Rajasthan with palaces and desert adventures",
      destinations: [
        {
          city: "Jaipur",
          days: 2,
          places: [
            { name: "Hawa Mahal", latitude: 26.9239, longitude: 75.8267, type: "attraction", description: "Palace of Winds - iconic pink sandstone structure", rating: 4.6 },
            { name: "City Palace", latitude: 26.9255, longitude: 75.8235, type: "attraction", description: "Royal residence with museums and courtyards", rating: 4.5 },
            { name: "Amber Fort", latitude: 26.9855, longitude: 75.8513, type: "attraction", description: "Hilltop fort with stunning architecture", rating: 4.7 }
          ]
        },
        {
          city: "Udaipur",
          days: 2,
          places: [
            { name: "Lake Palace", latitude: 24.5760, longitude: 73.6811, type: "attraction", description: "Floating palace on Lake Pichola", rating: 4.8 },
            { name: "City Palace Udaipur", latitude: 24.5761, longitude: 73.6833, type: "attraction", description: "Magnificent palace complex", rating: 4.6 },
            { name: "Jagdish Temple", latitude: 24.5784, longitude: 73.6833, type: "attraction", description: "Historic Hindu temple", rating: 4.4 }
          ]
        }
      ],
      highlights: ["Royal Palaces", "Desert Culture", "Traditional Crafts", "Rajasthani Cuisine"],
      imageSrc: "/rajasthan-palace.jpg"
    },
    {
      title: "Goa Beach Paradise",
      description: "Relax and unwind in the beautiful beaches of Goa",
      destinations: [
        {
          city: "Goa",
          days: 4,
          places: [
            { name: "Baga Beach", latitude: 15.5559, longitude: 73.7516, type: "attraction", description: "Popular beach known for water sports and nightlife", rating: 4.3 },
            { name: "Basilica of Bom Jesus", latitude: 15.5008, longitude: 73.9115, type: "attraction", description: "UNESCO World Heritage Site and historic church", rating: 4.5 },
            { name: "Anjuna Beach", latitude: 15.5734, longitude: 73.7395, type: "attraction", description: "Famous for flea markets and parties", rating: 4.2 },
            { name: "Fort Aguada", latitude: 15.4942, longitude: 73.7736, type: "attraction", description: "17th-century Portuguese fort", rating: 4.4 },
            { name: "Fisherman's Wharf", latitude: 15.5031, longitude: 73.9142, type: "restaurant", description: "Waterfront restaurant with Goan cuisine", rating: 4.6 }
          ]
        }
      ],
      highlights: ["Pristine Beaches", "Portuguese Architecture", "Water Sports", "Seafood Cuisine"],
      imageSrc: "/goa-beach.jpg"
    }
  ]

  // Add sample itineraries to the database
  for (const itinerary of sampleItineraries) {
    try {
      await itineraryDB.saveItinerary(itinerary)
      console.log(`Created sample itinerary: ${itinerary.title}`)
    } catch (error) {
      console.error(`Failed to create sample itinerary: ${itinerary.title}`, error)
    }
  }
}

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